# Project Walkthrough (Restored Context)

## System Architecture
- **Frontend**: React + Vite + Tailwind (deployed on Vercel)
- **Backend**: Node.js microservices + Java Spring Boot service (deployed on Render)
- **Database**: MongoDB Atlas

## Key Features Implemented

### 1. Authentication & Security
- Complete JWT auth flow
- Email verification using Brevo API (bypasses SMTP blocks)
- Password recovery flow (Forgot/Reset password)
- Admin role & protected routes

### 2. E-commerce
- Shopping cart with persistent state
- Checkout process recording purchases
- "My Templates" area for downloading purchased files

### 3. Content
- Legal pages (Terms, Privacy)
- Blog system (Admin can post)
- Video tutorials for templates (TikTok/Instagram integration)

## How to Resume Work (Ubuntu)
1. Clone repo: `git clone https://github.com/cetelloa/LoreNotes.git`
2. Install deps: `npm install` (root) & `cd client && npm install`
3. Setup `.env` files (you'll need to recreate your .env files with secrets)
4. Run with Docker: `docker-compose up`

## Last Status
All core features including password recovery are implemented and pushed to main branch.
