import os
import hashlib
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, HTTPException, Body, Request
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
questions_collection = db["questions"]
settings_collection = db["settings"]
claims_collection = db["claims"]
subscriptions_collection = db["subscriptions"]
payment_transactions_collection = db["payment_transactions"]

# Premium pricing
PREMIUM_PRICE = 39.00  # $39/month
TRIAL_DAYS = 7

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

SUPER_ADMINS = ["admin@shapershed.com", "hello@shapershed.com"]

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
        "role": "admin" if is_admin(user.email) else "user",
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
        role="admin" if is_admin(user["email"]) else "user",
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
# QUESTIONS ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/api/questions")
async def get_all_questions(status: str = None):
    """Get all questions, optionally filtered by status"""
    query = {}
    if status == "pending":
        query["approved"] = {"$ne": True}
    elif status == "approved":
        query["approved"] = True
    questions = list(questions_collection.find(query, {"_id": 0}))
    return {"questions": questions}

@app.get("/api/questions/shaper/{shaper_id}")
async def get_shaper_questions(shaper_id: int):
    """Get approved questions for a specific shaper"""
    questions = list(questions_collection.find(
        {"shaperId": shaper_id, "approved": True}, 
        {"_id": 0}
    ))
    return {"questions": questions}

@app.post("/api/questions")
async def create_question(question: Dict[str, Any] = Body(...)):
    """Create a new question (pending approval)"""
    now = datetime.now(timezone.utc).isoformat()
    question["createdAt"] = now
    question["id"] = int(datetime.now(timezone.utc).timestamp() * 1000)
    question["approved"] = False  # Requires admin approval
    questions_collection.insert_one(question)
    question.pop("_id", None)
    return {"success": True, "question": question}

@app.put("/api/questions/{question_id}/approve")
async def approve_question(question_id: int):
    """Approve a question"""
    result = questions_collection.update_one(
        {"id": question_id},
        {"$set": {"approved": True, "approvedAt": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"success": True}

@app.delete("/api/questions/{question_id}")
async def delete_question(question_id: int):
    """Delete/reject a question"""
    result = questions_collection.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"success": True}

@app.put("/api/questions/{question_id}/answer")
async def answer_question(question_id: int, answer: Dict[str, Any] = Body(...)):
    """Answer a question"""
    now = datetime.now(timezone.utc).isoformat()
    result = questions_collection.update_one(
        {"id": question_id},
        {"$set": {"answer": answer.get("answer"), "answeredAt": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"success": True}

@app.put("/api/questions/{question_id}/vote")
async def vote_question(question_id: int, vote: Dict[str, Any] = Body(...)):
    """Upvote/downvote a question"""
    increment = 1 if vote.get("direction") == "up" else -1
    result = questions_collection.update_one(
        {"id": question_id},
        {"$inc": {"votes": increment}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"success": True}

# ──────────────────────────────────────────────
# SETTINGS ENDPOINTS (Hero image, etc.)
# ──────────────────────────────────────────────

@app.get("/api/settings")
async def get_settings():
    """Get site settings"""
    settings = settings_collection.find_one({"type": "site"}, {"_id": 0})
    if not settings:
        return {"heroImage": "", "logoImage": ""}
    return settings

@app.put("/api/settings")
async def update_settings(data: Dict[str, Any] = Body(...)):
    """Update site settings"""
    now = datetime.now(timezone.utc).isoformat()
    data["updatedAt"] = now
    data["type"] = "site"
    
    settings_collection.update_one(
        {"type": "site"},
        {"$set": data},
        upsert=True
    )
    return {"success": True}

# ──────────────────────────────────────────────
# CLAIM LISTING ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/api/claims")
async def create_claim(data: Dict[str, Any] = Body(...)):
    """Submit a claim request for a listing"""
    now = datetime.now(timezone.utc).isoformat()
    claim = {
        "listingId": data.get("listingId"),
        "listingName": data.get("listingName"),
        "claimerEmail": data.get("email"),
        "claimerName": data.get("name"),
        "claimerPhone": data.get("phone", ""),
        "message": data.get("message", ""),
        "status": "pending",  # pending, approved, rejected
        "createdAt": now
    }
    claims_collection.insert_one(claim)
    claim.pop("_id", None)
    return {"success": True, "claim": claim}

@app.get("/api/claims")
async def get_claims(status: str = None):
    """Get all claims (for admin)"""
    query = {}
    if status:
        query["status"] = status
    claims = list(claims_collection.find(query, {"_id": 0}))
    return {"claims": claims}

@app.put("/api/claims/{listing_id}/approve")
async def approve_claim(listing_id: int, data: Dict[str, Any] = Body(...)):
    """Approve a claim and link user to listing"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Update claim status
    claims_collection.update_one(
        {"listingId": listing_id, "status": "pending"},
        {"$set": {"status": "approved", "approvedAt": now}}
    )
    
    # Update listing with owner
    listings_collection.update_one(
        {"id": listing_id},
        {"$set": {
            "ownerEmail": data.get("email"),
            "claimed": True,
            "claimedAt": now
        }}
    )
    
    return {"success": True}

@app.put("/api/claims/{listing_id}/reject")
async def reject_claim(listing_id: int):
    """Reject a claim"""
    claims_collection.update_one(
        {"listingId": listing_id, "status": "pending"},
        {"$set": {"status": "rejected", "rejectedAt": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ──────────────────────────────────────────────
# PREMIUM SUBSCRIPTION ENDPOINTS (STRIPE)
# ──────────────────────────────────────────────

@app.post("/api/premium/checkout")
async def create_premium_checkout(request: Request, data: Dict[str, Any] = Body(...)):
    """Create a Stripe checkout session for premium subscription"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    listing_id = data.get("listingId")
    email = data.get("email")
    origin_url = data.get("originUrl", "")
    
    if not listing_id or not email:
        raise HTTPException(status_code=400, detail="Missing listingId or email")
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/premium-success?session_id={{CHECKOUT_SESSION_ID}}&listing_id={listing_id}"
    cancel_url = f"{origin_url}/listing/{listing_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=PREMIUM_PRICE,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "listing_id": str(listing_id),
            "email": email,
            "type": "premium_subscription"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create pending transaction record
    now = datetime.now(timezone.utc).isoformat()
    payment_transactions_collection.insert_one({
        "sessionId": session.session_id,
        "listingId": listing_id,
        "email": email,
        "amount": PREMIUM_PRICE,
        "currency": "usd",
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": now
    })
    
    return {"url": session.url, "sessionId": session.session_id}

@app.get("/api/premium/status/{session_id}")
async def get_premium_status(request: Request, session_id: str):
    """Check the status of a premium checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction record
    if status.payment_status == "paid":
        # Check if already processed
        transaction = payment_transactions_collection.find_one({"sessionId": session_id})
        if transaction and transaction.get("status") != "completed":
            now = datetime.now(timezone.utc).isoformat()
            
            # Update transaction
            payment_transactions_collection.update_one(
                {"sessionId": session_id},
                {"$set": {"status": "completed", "paymentStatus": "paid", "completedAt": now}}
            )
            
            # Activate premium with 7-day trial consideration
            listing_id = int(status.metadata.get("listing_id", 0))
            if listing_id:
                trial_end = datetime.now(timezone.utc)
                # First month starts after trial
                subscriptions_collection.update_one(
                    {"listingId": listing_id},
                    {"$set": {
                        "listingId": listing_id,
                        "email": status.metadata.get("email"),
                        "status": "active",
                        "startedAt": now,
                        "currentPeriodEnd": (trial_end + timedelta(days=30)).isoformat()
                    }},
                    upsert=True
                )
                
                # Mark listing as premium
                listings_collection.update_one(
                    {"id": listing_id},
                    {"$set": {"premium": True, "premiumSince": now}}
                )
    
    return {
        "status": status.status,
        "paymentStatus": status.payment_status,
        "amount": status.amount_total,
        "metadata": status.metadata
    }

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            # Process successful payment
            listing_id = int(event.metadata.get("listing_id", 0))
            if listing_id:
                now = datetime.now(timezone.utc).isoformat()
                listings_collection.update_one(
                    {"id": listing_id},
                    {"$set": {"premium": True, "premiumSince": now}}
                )
        
        return {"received": True}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"error": str(e)}

@app.post("/api/premium/start-trial")
async def start_premium_trial(data: Dict[str, Any] = Body(...)):
    """Start a 7-day free trial for premium"""
    listing_id = data.get("listingId")
    email = data.get("email")
    
    if not listing_id or not email:
        raise HTTPException(status_code=400, detail="Missing listingId or email")
    
    # Check if trial already used
    existing = subscriptions_collection.find_one({"listingId": listing_id})
    if existing:
        raise HTTPException(status_code=400, detail="Trial already used for this listing")
    
    now = datetime.now(timezone.utc)
    trial_end = now + timedelta(days=TRIAL_DAYS)
    
    subscriptions_collection.insert_one({
        "listingId": listing_id,
        "email": email,
        "status": "trial",
        "trialStartedAt": now.isoformat(),
        "trialEndsAt": trial_end.isoformat()
    })
    
    # Mark listing as premium (trial)
    listings_collection.update_one(
        {"id": listing_id},
        {"$set": {"premium": True, "premiumTrial": True, "trialEndsAt": trial_end.isoformat()}}
    )
    
    return {"success": True, "trialEndsAt": trial_end.isoformat()}

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
        from openai import OpenAI
        
        api_key = os.environ.get("OPENAI_API_KEY", "")
        
        # If no API key, return original text
        if not api_key:
            return TranslateResponse(
                original=req.text,
                translated=req.text,
                locale=req.target_locale,
                cached=False
            )
        
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a professional translator. Translate the given text to {target_lang}. Only respond with the translation, nothing else. Preserve any formatting, line breaks, and special characters. Keep proper nouns (names of people, places, businesses) unchanged."},
                {"role": "user", "content": f"Translate this text from a {req.context}:\n\n{req.text}"}
            ]
        )
        
        translated = response.choices[0].message.content.strip()
        
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
