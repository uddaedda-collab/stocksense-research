# Local Setup Guide

## Prerequisites

- Node.js 20+ and npm 10+
- A free [Supabase](https://supabase.com) account
- A free [Firebase](https://firebase.google.com) project (Spark/free plan)
- Git

## 1. Clone and install

```bash
git clone <your-repo-url>
cd stock-research-platform
npm install
npm run build --workspace=@platform/shared
```

The `@platform/shared` package must be built once before `apps/api` or
`apps/web` can resolve its compiled types/logic (it's a workspace dependency,
not published to npm).

## 2. Set up Supabase

1. Create a new project at https://supabase.com (free tier).
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste the contents of `apps/api/src/db/schema.sql` and run it.
4. Go to **Project Settings → API** and note:
   - `Project URL`
   - `service_role` secret key (⚠️ never expose this to the frontend)

## 3. Set up Firebase Authentication

1. Create a project at https://console.firebase.google.com (free Spark plan).
2. Enable **Authentication → Sign-in method → Email/Password** and **Google**.
3. Go to **Project Settings → General → Your apps → Web app** and copy the
   config values (`apiKey`, `authDomain`, `projectId`, etc.) for the frontend.
4. Go to **Project Settings → Service Accounts → Generate new private key**
   and download the JSON — you'll need `project_id`, `client_email`, and
   `private_key` from it for the backend.

## 4. Configure environment variables

### Backend (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep the `\n` escapes as-is
or wrap in quotes), and `ADMIN_EMAILS` (your own email, comma-separated if
multiple, to access `/admin`).

### Frontend (`apps/web/.env.local`)

Create `apps/web/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

If you skip Firebase config, the site still works but sign-in, watchlist, and
portfolio features will show a "not configured" message instead of crashing.

## 5. Run locally

```bash
npm run dev:api    # terminal 1 — http://localhost:4000
npm run dev:web    # terminal 2 — http://localhost:3000
```

Visit http://localhost:3000.

## 6. Run tests

```bash
npm run test              # all workspaces
npm run test:shared
npm run test:api
npm run test:web
```

## Troubleshooting

- **"Missing required env var SUPABASE_URL"** warning on API startup: the
  server still runs, but watchlist/portfolio/admin routes will fail until you
  set real Supabase credentials.
- **Firebase sign-in fails**: double check `NEXT_PUBLIC_FIREBASE_*` values
  match your Firebase web app config exactly, and that Email/Password +
  Google providers are enabled in the Firebase console.
- **Yahoo Finance requests failing/rate limited**: the backend uses Yahoo's
  public unofficial endpoints with in-memory caching; if you hit rate limits
  during heavy local testing, wait a minute and retry — this is expected
  behavior for a free, keyless data source.
