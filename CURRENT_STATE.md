# UAE Careers — Current State Audit
_Generated: 2026-06-28_

---

## Executive Summary

The project is a **UAE job board** with three sub-projects in a monorepo:
- `uae-careers/web` — Next.js 16 frontend (live on Vercel at uaecareer.ae)
- `uae-careers/api` — Node.js/Express backend (live on Railway)
- `uae-careers/mobile` — React Native / Expo app (not deployed; development only)

**Critical finding:** The frontend and backend are **completely disconnected**. The live site runs entirely on hardcoded mock data. The Railway API is live and healthy but returns zero real data (empty database). No Supabase is in use — the stack is Prisma + PostgreSQL (hosted on Supabase's free Postgres tier).

---

## 1.1 Repository Structure

```
Jobs/                                   ← git root
├── CURRENT_STATE.md                    ← this file
├── README.md
├── qa-artifacts/                       ← Playwright test artifacts
├── tests/                              ← root-level test stubs (empty)
└── uae-careers/
    ├── package.json                    ← workspace root (npm workspaces)
    ├── DEPLOY.md                       ← deployment instructions
    ├── api/                            ← Node.js/Express backend
    │   ├── .env / .env.example
    │   ├── railway.json                ← Railway deploy config
    │   ├── nixpacks.toml
    │   ├── prisma/
    │   │   ├── schema.prisma           ← full DB schema (18 models)
    │   │   └── seed.js                 ← seeds countries, cities, categories, settings
    │   └── src/
    │       ├── index.js                ← Express app entry
    │       ├── middleware/             ← auth.js, error.js
    │       ├── lib/                    ← prisma.js, otp.js, storage.js, etc.
    │       └── routes/
    │           ├── auth.js
    │           ├── jobs.js
    │           ├── applications.js
    │           ├── profile.js
    │           ├── saved.js
    │           └── admin/              ← users, jobs, categories, cms, analytics, etc.
    ├── web/                            ← Next.js 16 frontend
    │   ├── next.config.ts
    │   ├── playwright.config.ts
    │   ├── src/
    │   │   ├── app/                    ← App Router pages
    │   │   ├── components/             ← layout + UI components
    │   │   ├── lib/                    ← api.ts (axios), admin-data.ts (mock), utils.ts
    │   │   └── types/index.ts
    │   └── tests/full-audit.spec.ts    ← 73-test Playwright suite
    └── mobile/                         ← Expo/React Native (not deployed)
```

---

## 1.2 Framework & Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Web framework | Next.js App Router | 16.2.9 |
| React | react / react-dom | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| API | Express.js | 5.2.1 |
| ORM | Prisma | 5.22.0 |
| Database | PostgreSQL (via Supabase free tier) | — |
| Mobile | Expo / React Native | — |
| Deployment: web | Vercel | — |
| Deployment: API | Railway | — |

---

## 1.3 All Pages / Routes

### Public Pages (web)
| Route | File | Data Source | Status |
|-------|------|-------------|--------|
| `/` | `app/page.tsx` | Hardcoded | ✅ Live |
| `/jobs` | `app/jobs/page.tsx` | Hardcoded (empty) | ✅ Live |
| `/jobs/[country]` | `app/jobs/[country]/page.tsx` | 20 mock jobs in-file | ❌ 500 on live |
| `/jobs/[country]/[city]` | `app/jobs/[country]/[city]/page.tsx` | Empty placeholder | ⚠️ Stub |
| `/jobs/category/[category]` | `app/jobs/category/[category]/page.tsx` | Empty placeholder | ⚠️ Stub |
| `/companies` | `app/companies/page.tsx` | Unknown | ⚠️ Unknown |
| `/companies/[slug]` | `app/companies/[slug]/page.tsx` | Unknown | ⚠️ Unknown |
| `/cv-service` | `app/cv-service/page.tsx` | Static copy | ✅ Live |
| `/cv-builder` | `app/cv-builder/page.tsx` | Redirects → `/cv-service` | ✅ Live |
| `/cv-builder/builder` | `app/cv-builder/builder/page.tsx` | Unknown | ⚠️ Unknown |
| `/salary-guide` | `app/salary-guide/page.tsx` | Unknown | ✅ Live |
| `/thank-you` | `app/thank-you/page.tsx` | Static | ✅ Live |
| `/auth/login` | `app/auth/login/page.tsx` | `lib/api.ts` (not wired) | ⚠️ UI only |
| `/auth/register` | `app/auth/register/page.tsx` | `lib/api.ts` (not wired) | ⚠️ UI only |
| `/profile` | `app/profile/page.tsx` | Unknown | ⚠️ Unknown |
| `/dashboard` | `app/dashboard/page.tsx` | Unknown | ⚠️ Unknown |
| `/saved-jobs` | `app/saved-jobs/page.tsx` | Unknown | ⚠️ Unknown |
| `/employer/post-job` | `app/employer/post-job/page.tsx` | No API call | ⚠️ UI only |
| `/employer/dashboard` | `app/employer/dashboard/page.tsx` | Unknown | ⚠️ Unknown |

### Admin Pages (web)
| Route | Auth | Data Source |
|-------|------|-------------|
| `/secure-portal-9x4m7k` | None (hardcoded creds) | localStorage |
| `/admin` | localStorage token | `lib/admin-data.ts` (mock) |
| `/admin/jobs` | localStorage token | `lib/admin-data.ts` (mock) |
| `/admin/users` | localStorage token | `lib/admin-data.ts` (mock) |
| `/admin/employers` | localStorage token | `lib/admin-data.ts` (mock) |
| `/admin/categories` | localStorage token | Hardcoded array |
| `/admin/countries` | localStorage token | Hardcoded array |
| `/admin/analytics` | localStorage token | Derived from mock data |
| `/admin/cms` | localStorage token | Hardcoded |
| `/admin/seo` | localStorage token | Hardcoded |
| `/admin/products` | localStorage token | Hardcoded |
| `/admin/settings` | localStorage token | Hardcoded |
| `/admin/admins` | localStorage token | Hardcoded |
| `/admin/profile` | localStorage token | localStorage + hardcoded password |

### API Routes (Next.js)
| Route | Purpose |
|-------|---------|
| `/api/cv/ai` | Claude AI CV builder — calls Anthropic API. Requires `ANTHROPIC_API_KEY` |

### Backend API (Railway — `https://jobs-production-7093.up.railway.app`)
| Endpoint | Method | Notes |
|----------|--------|-------|
| `/health` | GET | ✅ Returns `{"success":true,"message":"OK"}` |
| `/api/auth/*` | POST | Login, register, OTP, refresh |
| `/api/jobs` | GET | ✅ Reachable, returns empty `[]` (no data seeded) |
| `/api/applications/*` | GET/POST | Auth required |
| `/api/profile/*` | GET/PUT | Auth required |
| `/api/saved/*` | GET/POST | Auth required |
| `/api/admin/*` | Various | Admin auth required |

---

## 1.4 Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Header` | `components/layout/Header.tsx` | Nav: Jobs, Salary Guide, CV Service, Get Your CV Done CTA |
| `Footer` | `components/layout/Footer.tsx` | Links, Services column, WhatsApp icon |
| `FraudNotice` | `components/ui/FraudNotice.tsx` | Warning banner shown on job pages |
| `JobCard` | `components/ui/JobCard.tsx` | Job listing card (used on homepage/jobs) |
| `ProductBanners` | `components/ui/ProductBanners.tsx` | Promo banner cards |

---

## 1.5 Dependencies Audit

### Web (`web/package.json`)

**Used:**
- `next` 16.2.9, `react` 19.2.4, `tailwindcss` v4 — core
- `lucide-react` — icons everywhere
- `isomorphic-dompurify` — sanitising dangerouslySetInnerHTML in job detail
- `next-seo` — **likely unused** (metadata is done via Next.js native Metadata API)
- `@playwright/test` — test suite

**Installed but not wired up / potentially unused:**
- `@hookform/resolvers` + `react-hook-form` + `zod` — imported in auth/employer pages but forms don't submit to real API
- `@radix-ui/react-dialog` + `@radix-ui/react-dropdown-menu` + `@radix-ui/react-select` + `@radix-ui/react-toast` — no evidence of usage in current pages (pages use plain HTML)
- `@tanstack/react-query` — no evidence of usage in current pages
- `axios` — `lib/api.ts` defines axios client but no page imports it
- `clsx` + `tailwind-merge` — not imported in current pages
- `date-fns` — not imported in current pages
- `react-hot-toast` — not imported in current pages

**Bloat score: HIGH** — roughly half the dependencies are unused in the current frontend code.

### API (`api/package.json`)

| Package | Use | Status |
|---------|-----|--------|
| `express`, `helmet`, `cors`, `morgan` | Core | ✅ Used |
| `@prisma/client`, `prisma` | ORM | ✅ Used |
| `bcryptjs` | Password hashing | ✅ Used |
| `jsonwebtoken` | JWT auth | ✅ Used |
| `express-rate-limit`, `express-validator` | Security | ✅ Used |
| `resend` | Email (transactional) | ⚠️ Wired, not tested |
| `twilio` | SMS OTP | ⚠️ Wired, keys not set |
| `stripe` | Payments | ⚠️ Wired, keys not set |
| `@aws-sdk/client-s3` | Backblaze B2 storage | ⚠️ Wired, keys not set |
| `sharp` | Image processing | ⚠️ Wired |
| `google-auth-library` | Google OAuth | ⚠️ Wired, not tested |
| `nodemailer` | Email (fallback) | ⚠️ Duplicate of resend |
| `multer` | File uploads | ⚠️ Wired |
| `uuid` | ID generation | ✅ Used (Prisma handles IDs, may be redundant) |
| `pg` | Postgres direct | ⚠️ Prisma handles DB, may be redundant |

---

## 1.6 Environment Variables

### Web (Vercel)
| Variable | Required | Used |
|----------|----------|------|
| `NEXT_PUBLIC_API_URL` | Yes | `lib/api.ts` — currently hardcoded fallback `http://localhost:8000/api/v1` (wrong port) |
| `NEXT_PUBLIC_SITE_URL` | No | `app/robots.ts` for sitemap URL |
| `ANTHROPIC_API_KEY` | For CV builder | `app/api/cv/ai/route.ts` |

**⚠️ Gap:** `NEXT_PUBLIC_API_URL` is set in the web but the fallback is wrong port (8000 vs Railway's dynamic port). The web never actually calls the API in any current page.

### API (Railway)
| Variable | Required | Status |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Must be set to Supabase Postgres URL |
| `JWT_SECRET` | Yes | Must be set |
| `JWT_REFRESH_SECRET` | Yes | Must be set |
| `PORT` | Auto-set by Railway | — |
| `CORS_ORIGIN` | Recommended | Should be `https://www.uaecareer.ae` |
| `TWILIO_*` | For OTP | Not set |
| `RESEND_API_KEY` | For email | Not set |
| `B2_*` | For file storage | Not set |
| `STRIPE_*` | For payments | Not set |
| `FRONTEND_URL` | For CORS/links | Should be set |

---

## 1.7 Database Schema (Prisma — 18 models)

**Models:**
1. `User` — auth + role (SUPER_USER, ADMIN, EMPLOYER, JOB_SEEKER)
2. `JobSeekerProfile` — CV, skills, preferences
3. `EmployerProfile` — company info, LLM keys, Stripe ID
4. `AdminProfile` — permissions JSON
5. `Country` — GCC countries
6. `City` — cities per country
7. `Category` — job categories with ad config
8. `Job` — full job listing model
9. `Application` — job applications
10. `SavedJob` — bookmarks
11. `OtpCode` — phone/email OTP
12. `Product` — promo banners
13. `ProductBanner` — banner↔category linking
14. `CategoryAd` — ad config per category
15. `Notification` — user notifications
16. `PlatformSetting` — key-value admin settings
17. `CmsContent` + `CmsHistory` — CMS with versioning
18. `Transaction` — payment records
19. `JobAlert` — saved search alerts

**Current data in Railway DB:** Empty (0 jobs, 0 users). Seed script runs on deploy but only seeds reference data (countries, cities, categories, platform settings). No jobs or users are present.

---

## 1.8 Railway Deployment

**Config:** `uae-careers/api/railway.json` + `nixpacks.toml`

**Deploy command on Railway:**
```
npx prisma generate && npx prisma db push && node prisma/seed.js && node src/index.js
```

**Health check:** `/health` → `{"success":true,"message":"OK"}` ✅

**Live URL:** `https://jobs-production-7093.up.railway.app`

**Role:** Hosts the full backend REST API. The web frontend is supposed to call it but currently does not.

---

## 1.9 Vercel Deployment

**Production branch:** `main`

**No `vercel.json`** — using defaults. Vercel detects Next.js automatically.

**Custom next.config.ts settings:**
- `assetPrefix: '/_s'` in production — hides `/_next/` pattern (security obfuscation)
- Rewrites `/_s/*` → `/_next/*` so assets still work
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- Removes `X-Powered-By` header

**Live URL:** Redirects `uaecareer.ae` → `www.uaecareer.ae` (Vercel handles www redirect)

---

## 1.10 Supabase

**Finding: Supabase is used only as a Postgres host (connection string).** There is NO Supabase SDK, no Supabase Auth, no Supabase Storage, no RLS policies from Supabase's side. The API uses Prisma directly against the Postgres connection string.

The `.env` in the repo contains a local Prisma Postgres dev URL, not the real Supabase URL (which should be in Railway's env vars).

**Supabase role:** PostgreSQL database host only.

---

## 1.11 Live Site Route Test Results

```
200  https://www.uaecareer.ae/                    ✅ Homepage loads
200  https://www.uaecareer.ae/jobs                ✅ Job listing (empty, no real jobs)
500  https://www.uaecareer.ae/jobs/job-1          ❌ Job detail crashes (SSR error — likely route params issue on deployed version)
200  https://www.uaecareer.ae/admin               ✅ Loads (redirects to secure portal)
404  https://www.uaecareer.ae/api/health          ❌ Next.js API ≠ Railway API (separate host)
200  https://www.uaecareer.ae/sitemap.xml         ✅
200  https://www.uaecareer.ae/robots.txt          ✅
200  https://www.uaecareer.ae/secure-portal-9x4m7k ✅ Admin login
```

**Note:** The deployed job detail page (`/jobs/job-1`) returns 500. This is because the current code on `main` has the `[country]` route using `useParams()` but the deployed build may be catching a SSR error on the route rename from `[slug]` → `[country]`.

---

## 1.12 Dead Code, Demo Data, Issues

### Dead Code
- `src/app/admin/login/page.tsx` — duplicate admin login page (real login is at `/secure-portal-9x4m7k`)
- `src/lib/api.ts` — axios API client is defined but never imported anywhere in the web app
- `src/app/dashboard/page.tsx` — user dashboard stub, unknown state
- `src/app/profile/page.tsx` — user profile stub, unknown state

### Demo / Hardcoded Data
- `src/lib/admin-data.ts` — 6 fake jobs, 10 fake users, 10 fake employers (entire admin panel runs on this)
- `src/app/jobs/[country]/page.tsx` — 20 inline mock jobs for job detail pages
- `src/app/secure-portal-9x4m7k/page.tsx` — hardcoded admin credentials (`admin@uaecareer.ae` / `Applesec22@u`)
- `src/app/admin/profile/page.tsx` — hardcoded password check
- All admin pages — hardcoded arrays for categories, countries, CMS content, SEO settings, products

### Console Logs (cleaned — confirmed removed)
- `auth/login`, `auth/register`, `employer/post-job` — removed in QA audit

### TODOs / Stubs
- Multiple admin pages show UI only with no save/API functionality
- `admin/cms`, `admin/seo`, `admin/settings`, `admin/countries` — UI shells with no backend wiring
- `employer/post-job` — form exists, no API submission
- WhatsApp signup form — submits to Google Apps Script webhook (no-cors, no confirmation possible)
- Apply modal — submits to Google Apps Script webhook (same limitation)

---

## 1.13 Mobile App

**Status:** Development only — not deployed, no CI/CD, no app store listing found.

**Stack:** Expo + React Native + expo-router (tabs layout)

**Features built:**
- Tab navigation: Home, Search, Saved, Profile
- Auth: Login, Register screens
- Job detail: `app/jobs/[id].tsx`
- Employer: Post job
- Components: `JobCard`, `FraudNotice`, `AdBanner`

**API connection:** `src/lib/api.ts` references Railway API URL. No evidence it's wired to the real backend yet.

---

## Summary of Gaps / Critical Issues

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Frontend and backend are completely disconnected | 🔴 Critical | Site shows only fake data |
| 2 | `/jobs/job-1` returns 500 on live site | 🔴 Critical | Job detail unusable |
| 3 | Admin panel runs entirely on hardcoded mock data | 🔴 Critical | Admin can't manage real jobs/users |
| 4 | Hardcoded admin password in source code | 🔴 Critical | Security risk |
| 5 | Railway DB is empty — no jobs, no users | 🔴 Critical | No content to show |
| 6 | `NEXT_PUBLIC_API_URL` fallback is wrong URL | 🔴 Critical | API calls would fail even if wired |
| 7 | ~50% of web dependencies unused | 🟡 Medium | Bundle bloat |
| 8 | No real auth in web (localStorage only) | 🟡 Medium | Apply/save/profile don't work |
| 9 | WhatsApp/Google Sheets as apply backend | 🟡 Medium | No structured data capture |
| 10 | Mobile app not deployed | 🟢 Low | Not launched yet |
| 11 | Twilio/Stripe/B2 keys not configured | 🟢 Low | Features disabled |

---

## Recommendation for Phase 2

The **minimal path to a working MVP** is:

1. **Fix the `/jobs/[country]` 500** — one-line fix in the deployed build
2. **Wire `NEXT_PUBLIC_API_URL` correctly** to the Railway URL in Vercel env vars
3. **Connect the job listing and job detail pages** to the Railway API
4. **Seed real job data** via the admin panel or directly via Prisma
5. **Connect the admin panel** to the Railway API (replace mock data imports)
6. **Move hardcoded admin credentials** to Railway/DB (admin user in Postgres)

The backend API is well-structured and ready. The gap is purely the frontend–backend connection.
