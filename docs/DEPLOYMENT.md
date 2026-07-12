# Deployment Guide (Free Tier)

This platform is designed to run entirely on free hosting tiers:
**Frontend → GitHub Pages**, **Backend → Render**, **Database → Supabase**.

## 1. Backend → Render (free tier)

1. Push this repository to GitHub (see main README).
2. Go to https://render.com and sign up (free, no card required for free tier).
3. **New → Web Service**, connect your GitHub repo.
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install --prefix ../.. && npm run build --workspace=@platform/shared && npm run build --workspace=@platform/api`
   - **Start Command**: `npm run start --workspace=@platform/api`
   - **Instance Type**: Free
5. Add environment variables (same as `apps/api/.env`): `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
   `FIREBASE_PRIVATE_KEY`, `ADMIN_EMAILS`, `CORS_ORIGIN` (set this to your
   GitHub Pages URL, e.g. `https://yourusername.github.io`).
6. Deploy. Render will give you a URL like `https://your-api.onrender.com`.

**Free tier limitation**: Render free web services sleep after ~15 minutes of
inactivity and take 30-50 seconds to cold-start on the next request. This is
a real tradeoff of using $0 hosting — there is no workaround without a paid
plan, but it doesn't affect correctness, only first-request latency after idle.

## 2. Frontend → GitHub Pages

1. In your GitHub repo, go to **Settings → Pages** and set source to
   **GitHub Actions** (the workflow below handles the build+deploy).
2. Add repository secrets (**Settings → Secrets and variables → Actions**):
   - `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
     `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
     `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Push to `main` — the `.github/workflows/deploy-web.yml` workflow builds
   and publishes `apps/web/out` to GitHub Pages automatically.
4. Your site will be live at `https://yourusername.github.io/your-repo-name/`.

If your repo name differs from the base path you want, the workflow passes
`NEXT_PUBLIC_BASE_PATH=/your-repo-name` automatically using the repo name.

## 3. Database → Supabase

Already free by default — no separate deployment step. Just make sure the
schema from `apps/api/src/db/schema.sql` has been run in your Supabase
project's SQL Editor (see [SETUP.md](SETUP.md)).

## 4. Post-deployment checklist

- [ ] Visit the deployed frontend URL and confirm the dashboard loads live data.
- [ ] Sign in (Firebase) and confirm watchlist/portfolio persist across reloads.
- [ ] Update `CORS_ORIGIN` on Render to match your exact GitHub Pages URL
      (including `https://`, no trailing slash) or auth-gated API calls
      will be blocked by CORS.
- [ ] Add your Supabase Firebase Admin email to `ADMIN_EMAILS` on Render and
      confirm `/admin` loads for you and is blocked (403) for other accounts.
- [ ] Run a Lighthouse audit in Chrome DevTools against the live URL and
      address any critical issues (this project targets high scores but
      results should be verified against the live deployment, not assumed).

## Updating environment variables later

- Render: **Dashboard → your service → Environment** — changes trigger an
  automatic redeploy.
- GitHub Pages: update the repository secret and re-run the
  `deploy-web` workflow (**Actions tab → deploy-web → Run workflow**), since
  `NEXT_PUBLIC_*` values are baked into the static build at build time.
