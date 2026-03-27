import os
import hashlib
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "shaper_shed")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
videos_collection = db["videos"]
translations_collection = db["translations"]
bookmarks_collection = db["bookmarks"]
listings_collection = db["listings"]

LANGUAGE_NAMES = {
    "pt-BR": "Brazilian Portuguese",
    "pt-PT": "Portuguese",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean",
}

# ──────────────────────────────────────────────
# MODELS
# ──────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    heard: Optional[str] = ""
    lookingFor: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    email: str
    firstName: str
    lastName: str
    name: str
    role: str
    createdAt: str

class TranslateRequest(BaseModel):
    text: str
    target_locale: str
    context: Optional[str] = "surfboard shaper directory listing"

class TranslateResponse(BaseModel):
    original: str
    translated: str
    locale: str
    cached: bool = False

class VideoCreate(BaseModel):
    url: str
    path: str
    name: str
    size: int
    type: str
    title: Optional[str] = ""
    description: Optional[str] = ""

class VideoShare(BaseModel):
    videoId: str
    shaperIds: List[int]

class BookmarkUpdate(BaseModel):
    listingId: int

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_by_email(email: str):
    return users_collection.find_one({"email": email.lower()}, {"_id": 0})

SUPER_ADMINS = ["admin@shapersheds.com", "hello@shapersheds.com"]

def is_admin(email: str) -> bool:
    return email.lower() in [e.lower() for e in SUPER_ADMINS]

# ──────────────────────────────────────────────
# AUTH ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user exists
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "email": user.email.lower(),
        "password": hash_password(user.password),
        "firstName": user.firstName,
        "lastName": user.lastName,
        "name": f"{user.firstName} {user.lastName}",
        "heard": user.heard,
        "lookingFor": user.lookingFor,
        "role": "superadmin" if is_admin(user.email) else "user",
        "createdAt": now,
    }
    users_collection.insert_one(user_doc)
    
    return UserResponse(
        email=user_doc["email"],
        firstName=user_doc["firstName"],
        lastName=user_doc["lastName"],
        name=user_doc["name"],
        role=user_doc["role"],
        createdAt=now
    )

@app.post("/api/auth/login", response_model=UserResponse)
async def login(creds: UserLogin):
    user = get_user_by_email(creds.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user["password"] != hash_password(creds.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return UserResponse(
        email=user["email"],
        firstName=user["firstName"],
        lastName=user["lastName"],
        name=user["name"],
        role="superadmin" if is_admin(user["email"]) else "user",
        createdAt=user.get("createdAt", "")
    )

# ──────────────────────────────────────────────
# BOOKMARKS ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/api/bookmarks/{email}")
async def get_bookmarks(email: str):
    doc = bookmarks_collection.find_one({"email": email.lower()}, {"_id": 0})
    if doc:
        return {"savedIds": doc.get("savedIds", [])}
    return {"savedIds": []}

@app.post("/api/bookmarks/{email}/toggle")
async def toggle_bookmark(email: str, bookmark: BookmarkUpdate):
    email = email.lower()
    doc = bookmarks_collection.find_one({"email": email})
    
    if doc:
        saved_ids = doc.get("savedIds", [])
        if bookmark.listingId in saved_ids:
            saved_ids.remove(bookmark.listingId)
            action = "removed"
        else:
            saved_ids.append(bookmark.listingId)
            action = "added"
        bookmarks_collection.update_one(
            {"email": email},
            {"$set": {"savedIds": saved_ids, "updatedAt": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        saved_ids = [bookmark.listingId]
        action = "added"
        bookmarks_collection.insert_one({
            "email": email,
            "savedIds": saved_ids,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        })
    
    return {"savedIds": saved_ids, "action": action}

# ──────────────────────────────────────────────
# LISTINGS ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/api/listings")
async def get_listings():
    """Get all listings from the database"""
    listings = list(listings_collection.find({}, {"_id": 0}))
    return {"listings": listings}

@app.post("/api/listings")
async def create_listing(listing: Dict[str, Any] = Body(...)):
    """Create a single listing"""
    now = datetime.now(timezone.utc).isoformat()
    listing["createdAt"] = now
    listing["updatedAt"] = now
    
    # Check if listing with same ID exists
    existing = listings_collection.find_one({"id": listing.get("id")})
    if existing:
        # Update existing
        listings_collection.update_one(
            {"id": listing.get("id")},
            {"$set": {**listing, "updatedAt": now}}
        )
    else:
        listings_collection.insert_one(listing)
    
    # Remove _id before returning
    listing.pop("_id", None)
    return {"success": True, "listing": listing}

@app.post("/api/listings/bulk")
async def bulk_upsert_listings(data: Dict[str, Any] = Body(...)):
    """Bulk upsert listings (for CSV import)"""
    listings = data.get("listings", [])
    if not listings:
        return {"success": False, "message": "No listings provided", "count": 0}
    
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0
    updated = 0
    
    for listing in listings:
        listing["updatedAt"] = now
        existing = listings_collection.find_one({"id": listing.get("id")})
        if existing:
            listings_collection.update_one(
                {"id": listing.get("id")},
                {"$set": listing}
            )
            updated += 1
        else:
            listing["createdAt"] = now
            listings_collection.insert_one(listing)
            inserted += 1
    
    return {
        "success": True, 
        "inserted": inserted, 
        "updated": updated, 
        "total": inserted + updated
    }

@app.put("/api/listings/{listing_id}")
async def update_listing(listing_id: int, listing: Dict[str, Any] = Body(...)):
    """Update a specific listing"""
    now = datetime.now(timezone.utc).isoformat()
    listing["updatedAt"] = now
    
    result = listings_collection.update_one(
        {"id": listing_id},
        {"$set": listing}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return {"success": True}

@app.delete("/api/listings/{listing_id}")
async def delete_listing(listing_id: int):
    """Delete a listing"""
    result = listings_collection.delete_one({"id": listing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"success": True}

# ──────────────────────────────────────────────
# VIDEO ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/api/videos/{email}")
async def create_video(email: str, video: VideoCreate):
    now = datetime.now(timezone.utc).isoformat()
    video_doc = {
        "userEmail": email.lower(),
        "url": video.url,
        "path": video.path,
        "name": video.name,
        "size": video.size,
        "type": video.type,
        "title": video.title or video.name,
        "description": video.description,
        "sharedWith": [],  # List of shaper IDs
        "createdAt": now,
        "updatedAt": now
    }
    result = videos_collection.insert_one(video_doc)
    video_doc["id"] = str(result.inserted_id)
    if "_id" in video_doc:
        del video_doc["_id"]
    return video_doc

@app.get("/api/videos/{email}")
async def get_user_videos(email: str):
    videos = list(videos_collection.find({"userEmail": email.lower()}, {"_id": 0}))
    return {"videos": videos}

@app.get("/api/videos/shared/{shaper_id}")
async def get_shared_videos(shaper_id: int):
    """Get videos shared with a specific shaper"""
    videos = list(videos_collection.find(
        {"sharedWith": shaper_id},
        {"_id": 0}
    ))
    return {"videos": videos}

@app.post("/api/videos/{email}/share")
async def share_video(email: str, share: VideoShare):
    """Share a video with specific shapers"""
    result = videos_collection.update_one(
        {"userEmail": email.lower(), "path": share.videoId},
        {
            "$addToSet": {"sharedWith": {"$each": share.shaperIds}},
            "$set": {"updatedAt": datetime.now(timezone.utc).isoformat()}
        }
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"success": True, "sharedWith": share.shaperIds}

@app.delete("/api/videos/{email}/{video_path:path}")
async def delete_video(email: str, video_path: str):
    result = videos_collection.delete_one({
        "userEmail": email.lower(),
        "path": video_path
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"success": True}

# ──────────────────────────────────────────────
# TRANSLATION ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.post("/api/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    # Skip translation for English locales
    if req.target_locale.startswith("en"):
        return TranslateResponse(
            original=req.text,
            translated=req.text,
            locale=req.target_locale,
            cached=True
        )
    
    # Check MongoDB cache first
    cache_key = hashlib.md5(f"{req.text}:{req.target_locale}".encode()).hexdigest()
    cached = translations_collection.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached:
        return TranslateResponse(
            original=req.text,
            translated=cached["translated"],
            locale=req.target_locale,
            cached=True
        )
    
    # Get target language name
    target_lang = LANGUAGE_NAMES.get(req.target_locale, req.target_locale)
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"translate-{cache_key}",
            system_message=f"You are a professional translator. Translate the given text to {target_lang}. Only respond with the translation, nothing else. Preserve any formatting, line breaks, and special characters. Keep proper nouns (names of people, places, businesses) unchanged."
        ).with_model("openai", "gpt-4.1-mini")
        
        user_message = UserMessage(
            text=f"Translate this text from a {req.context}:\n\n{req.text}"
        )
        
        translated = await chat.send_message(user_message)
        translated = translated.strip()
        
        # Store in MongoDB for persistence
        translations_collection.insert_one({
            "cache_key": cache_key,
            "original": req.text,
            "translated": translated,
            "locale": req.target_locale,
            "context": req.context,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
        
        return TranslateResponse(
            original=req.text,
            translated=translated,
            locale=req.target_locale,
            cached=False
        )
    except Exception as e:
        print(f"Translation error: {e}")
        # Return original text on error
        return TranslateResponse(
            original=req.text,
            translated=req.text,
            locale=req.target_locale,
            cached=False
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
