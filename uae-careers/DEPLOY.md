# UAE Careers — Deployment Guide

## Stack
- **Web**: Next.js → Vercel
- **API**: Node.js/Express → Railway
- **Database**: PostgreSQL → Supabase (free tier)
- **Storage**: Backblaze B2 (10GB free)
- **Domain**: uaecareer.ae (GoDaddy → point to Vercel)

---

## Step 1 — Database (Supabase)
1. Go to supabase.com → New project
2. Copy connection string (Session mode, port 5432)
3. Set DATABASE_URL in Railway env vars

## Step 2 — API (Railway)
1. Go to railway.app → New project → Deploy from GitHub
2. Select the `uae-careers/api` folder
3. Set all env vars from `.env.example`
4. Railway auto-runs: migrate → seed → start
5. Copy your Railway API URL

## Step 3 — Web (Vercel)
1. Go to vercel.com → New project → Import GitHub repo
2. Set root directory to `uae-careers/web`
3. Set env vars:
   - NEXT_PUBLIC_API_URL = your Railway API URL
   - NEXTAUTH_SECRET = random string
4. Deploy

## Step 4 — Domain (GoDaddy → Vercel)
1. In Vercel: Project Settings → Domains → Add `uaecareer.ae`
2. Vercel gives you nameservers or CNAME records
3. In GoDaddy DNS: Add the records Vercel provides
4. Wait 10-30 min for propagation

## Step 5 — Storage (Backblaze B2)
1. Go to backblaze.com → Create account → Create Bucket
2. Bucket settings: Private
3. Create Application Key with read/write access
4. Add to API env vars: B2_ENDPOINT, B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME

## Step 6 — Super Admin Login
- URL: uaecareer.ae/admin
- Email: admin@uaecareer.ae
- Password: Admin@123456 ← CHANGE THIS IMMEDIATELY

## Step 7 — Google AdSense
1. Apply at adsense.google.com with uaecareer.ae
2. Once approved, get slot IDs
3. Add slot IDs in Admin Panel → Settings → Ads

## Step 8 — SMS OTP (Twilio)
1. Create account at twilio.com
2. Get Account SID, Auth Token, Phone Number
3. Add to API env vars

## Monthly Cost Estimate (At Launch)
| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free |
| Railway (Starter) | $5/mo |
| Supabase (Free tier) | Free |
| Backblaze B2 | Free (10GB) |
| Twilio OTP | ~$0.0075/SMS |
| **Total** | **~$5/mo** |
