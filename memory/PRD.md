# Shaper Shed - Product Requirements Document

## Original Problem Statement
1. Bookmarks not saving for registered users
2. Need video upload for users to share surfing videos with shapers
3. Need translation storage so language tool works properly
4. CSV uploaded shapers need to be stored so everyone can access them
5. Premium Listing flow ($39/month via Stripe, 7-day trial)
6. Admin Panel functionalities (Claims, Questions review, Impersonate Premium users)

## Architecture
- **Frontend**: React + Vite (port 3000)
- **Backend**: FastAPI (port 8001)
- **Database**: MongoDB Atlas (shapershed)
- **Storage**: Firebase Storage (for videos - pending implementation)
- **Payments**: Stripe (stubbed, needs API key)
- **Deployment**: Vercel (frontend), Railway (backend with custom Dockerfile)

## User Personas
1. **Surfers** - Browse shapers, save bookmarks, upload videos, read reviews, ask questions
2. **Shapers** - Listed in directory, receive video shares, answer questions, claim & upgrade listings
3. **Admin** - Manage listings, approve submissions, review questions, impersonate premium users

## Core Requirements (Static)
- User registration and authentication
- Bookmark functionality tied to user accounts
- Multi-language support with persistent translations
- CSV import/export for shapers data
- All data stored in MongoDB for cross-device access
- Premium listing claim flow with Stripe payments

## What's Been Implemented

### April 1, 2026
- ✅ **Fixed PremiumLock button click issue** - Added `pointer-events: none;` to `.ld-lock::before` pseudo-element that was blocking button clicks

### Previous Session
- ✅ **MongoDB Atlas integration** - Bookmarks, listings, questions persist across sessions
- ✅ **Railway backend deployment** - Custom Dockerfile for Python backend
- ✅ **Premium Listing UI** - Claim flow, "Watch this Shaper at Work", "Shaping Knowledge" sections
- ✅ **Admin Panel** - Claims review, Questions approval, Premium Impersonation
- ✅ **Ask a Shaper** - Questions system with voting and approval workflow
- ✅ **Repairs category** - Added with icon
- ✅ **CSV import to backend** - Uploaded CSV data saved to MongoDB
- ✅ **Translation caching** - Translations stored for persistence
- ✅ **Firebase config** - Firebase SDK installed (not fully wired)

### API Endpoints
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/bookmarks/{email} - Get user's bookmarks
- POST /api/bookmarks/{email}/toggle - Toggle bookmark
- GET /api/listings - Get all shapers
- POST /api/listings - Create/update single listing
- POST /api/listings/bulk - Bulk import listings (CSV)
- PUT /api/listings/{id} - Update listing
- DELETE /api/listings/{id} - Delete listing
- POST /api/translate - Translate text with caching
- GET /api/questions - Get questions for a shaper
- POST /api/questions - Submit question
- POST /api/questions/{qid}/vote - Vote on question
- POST /api/questions/{qid}/status - Approve/reject question (admin)
- GET /api/claims - Get claims list
- POST /api/claims - Submit claim

## Prioritized Backlog

### P0 - Critical (Awaiting Keys)
- [ ] Stripe Integration for Premium Subscriptions (backend stubs exist, needs STRIPE_API_KEY)
- [ ] Firebase Video Upload Integration (config provided, needs wiring)

### P1 - Important
- [ ] Forgot Password flow - Backend email reset + frontend modal
- [ ] Translation storage via OpenAI (requires OPENAI_API_KEY)
- [ ] CSV Export for Questions in Admin panel

### P2 - Nice to Have
- [ ] Impersonate Premium feature refinement
- [ ] Video management UI for users
- [ ] Video analytics (views, shares)

## Pending Issues

### Issue 1: Forgot Password (P1)
- Status: NOT STARTED
- Current: Link shows toast message "Coming soon"
- Needed: Backend email reset flow + frontend modal

## Known Mocked/Stubbed Features
- **Stripe Payments**: Backend endpoints exist but need actual API key
- **OpenAI Translations**: Library installed but needs API key
- **Firebase Video**: Config provided but not fully integrated

## Test Credentials
- Admin: admin@shapershed.com / admin123

## Next Tasks
1. Wire up Firebase Video Upload in Premium Edit Modal
2. Complete Stripe checkout flow when API key provided
3. Implement Forgot Password email reset flow
