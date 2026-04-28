# Deployment Guide

## Frontend (Vercel)
1. Import `frontend` folder as Next.js project.
2. Set env vars:
   - `NEXT_PUBLIC_API_URL`
3. Deploy.

## Backend (Railway/Render)
1. Deploy `backend` as Node service.
2. Set env vars from `.env.example`.
3. Ensure persistent Postgres is connected.
4. Run database migrations by executing `database/schema.sql`.

## Database (Supabase/Neon)
1. Create PostgreSQL instance.
2. Enable `uuid-ossp` and `vector` extensions.
3. Apply `database/schema.sql`.

## Storage
- Use S3/Cloudinary for payment screenshots.
- Replace multer local path with cloud uploader in `payment/confirm`.

## Scaling notes
- Add queue (BullMQ) for campaigns and follow-up jobs.
- Add Redis for session/caching and rate limiting.
- Add worker process for WhatsApp webhooks, retries, and drip automation.
