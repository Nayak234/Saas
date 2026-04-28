# AI Business Automation SaaS (JoyzAI-style)

Production-oriented mono-repo for a multi-tenant SaaS platform with:
- Omni-channel chat (WhatsApp + website)
- CRM + tickets + campaigns
- AI chatbot + training pipeline
- UPI deep-link payments with verification flow
- Workflow automation and analytics

## Monorepo structure
- `backend` - Node.js Express REST API + Socket.io
- `frontend` - Next.js + Tailwind dashboard
- `database/schema.sql` - PostgreSQL schema with pgvector
- `docs/DEPLOYMENT.md` - deployment guide

## Quick start
1. Create PostgreSQL DB and run `database/schema.sql`
2. Configure `backend/.env`
3. Install dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Run apps:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## Core API routes
- Auth: `POST /auth/register`, `POST /auth/login`
- Chat: `GET /chat/conversations`, `POST /chat/messages/send`
- AI: `POST /ai/chat`, `POST /ai/train`
- Payments: `POST /payment/create`, `POST /payment/confirm`, `POST /payment/verify`
- Campaign: `POST /campaign/send`
- Workflow: `POST /workflow/trigger`

## UPI flow
`generateUPILink(amount)` uses:
`upi://pay?pa=PPQR01.UTGOQA@iob&pn=Aatreyee%20Enterprise&am={amount}`

Flow:
1. AI triggers payment intent
2. Backend creates pending payment + UPI deep link
3. Client shows "Pay Now"
4. User uploads screenshot
5. Admin verifies and marks success/failed
