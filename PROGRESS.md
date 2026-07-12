# Stock Research Platform — Progress Tracker

> Read this FIRST in any new session before continuing work. Update after
> every completed milestone.

Last updated: 2026-07-12 (session 2 — corrected after discovering prior work)

## IMPORTANT: repo layout (do not recreate server/ or web/ at root!)
Actual monorepo structure (npm workspaces):
```
stock-research-platform/
  apps/
    api/        <- Express backend (@platform/api) - COMPLETE, tested
    web/        <- Next.js frontend (@platform/web) - IN PROGRESS
  packages/
    shared/     <- shared types/logic (@platform/shared) - COMPLETE, tested
  supabase/schema.sql   <- consolidate with apps/api/src/db/schema.sql (duplicate, need to reconcile)
  chrome-extension/     <- empty, Phase 4
  flutter-app/          <- empty, Phase 5
  docs/                 <- empty
  .github/workflows/    <- empty, Phase 6
```
Root package.json workspaces = ["apps/*", "packages/*"]. Use
`npm run dev:api` / `npm run dev:web` / `npm run test` from repo root.

NOTE: A duplicate `server/` folder using yahoo-finance2+technicalindicators
was mistakenly created in session 2 before this was discovered — it has been
DELETED. apps/api uses raw fetch against Yahoo's public JSON endpoints
directly (services/yahooFinance.ts), NOT the yahoo-finance2 npm package
(which is ESM-only in recent versions and would conflict with apps/api's
CommonJS setup). Do not reintroduce yahoo-finance2.

## Legal / scope guardrails (do not violate)
- No investment advice claims. Every prediction/rating/AI output carries a
  disclaimer via packages/shared/src/disclaimers.ts.
- No paid APIs required for core functionality.
- No copying of Groww/Zerodha/Moneycontrol UI or branding.
- Data: Yahoo Finance public JSON endpoints (delayed ~15min, unofficial,
  documented limitation in code comments). No official NSE/BSE scraping.

## Tech stack actually in use
- Frontend: Next.js 14 (App Router, static export for GitHub Pages) + TS + Tailwind
- Backend: Express (CommonJS) on Node, deployed to Render free tier
- DB: Supabase (Postgres) via service-role key, RLS bypassed by backend which
  enforces user scoping itself via verified Firebase ID tokens
- Auth: Firebase Auth (client SDK in web, firebase-admin in api)
- Charts: TradingView Lightweight Charts (dynamically imported client-side)
- Shared logic package: @platform/shared (types, indicators, prediction,
  valuation, aiAnalysis, calculators, screener, disclaimers)

## Status by area

### packages/shared — COMPLETE
9 modules: types, disclaimers, indicators, prediction, valuation, aiAnalysis,
calculators, screener (+ testUtils, not exported). 60 tests passing.

### apps/api — COMPLETE for Phase 1+2 scope
Routes: stocks, market, screener, compare, calculators, watchlist, portfolio,
alerts, chatbot, admin. Services: marketData, yahooFinance (raw fetch),
cache, chatbot, firebaseAdmin, supabaseClient, movers, news, requestLogger.
23 tests passing (symbols, calculators, watchlist auth-gating).
KNOWN GAPS: roce and faceValue fields intentionally null (free data doesn't
expose them — documented, not a bug). Most services/routes lack dedicated
unit tests beyond the 3 test files that exist — could add more coverage.
Need to verify `npm run build && npm start` (production CJS build) actually
works, not just `tsx watch` dev mode (node-fetch v3 is ESM-only — flagged
risk, not yet confirmed broken or working).

### apps/web — Phase 1 pages COMPLETE, verified building
DONE:
- Dashboard page (/) — index ticker, movers, 52wk levels, recently viewed, quick links
- Stock detail page (/stock/[symbol]) — FIXED session 2 (was broken, missing
  StockDetailClient.tsx — now built, composes all existing stock/* components).
  Statically pre-renders 28 NIFTY-50-ish symbols + client-side fetch fallback.
- /calculators — all 7 calculators (SIP, Lumpsum, EMI, SWP, Brokerage, Compound
  Interest, Retirement) wired to existing backend, tabbed UI.
- /screener — full filter form (sector, PE, PB, market cap, ROE, ROCE,
  debt/equity, dividend yield, price, RSI) + results table.
- /compare — 2-5 symbol side-by-side comparison table (price, fundamentals, technicals).
- /login — email/password + Google sign-in via firebaseClient, redirects home when signed in.
- /watchlist — add/remove symbols, requires auth, sign-in prompt if not authed.
- /portfolio — add/remove holdings, P&L summary cards, requires auth.
- /chatbot — chat UI wired to rule-based backend chatbot, quick-suggestion chips.
- /market — key indices, market breadth (advancing/declining), sector indices, global markets.
- /economy — gold/silver/USDINR/crude indicators from backend.
- /news — general market news list with sentiment tags.
- /heatmap — market-cap-sized, color-coded tile grid linking to stock pages.
- All presentational components + lib utilities (pre-existing, unchanged).
- `npm run build:web` verified passing: all 12 new pages + dashboard + stock
  detail compile with zero TS errors, 43 static pages generated total.

REMAINING for apps/web:
- [ ] Search bar in Header exists and works (routes to /stock/[symbol] on submit)
      but doesn't show live autocomplete suggestions from /api/stocks/search — could enhance later.
- [ ] Admin panel UI (backend /api/admin exists, no frontend yet)
- [ ] PWA manifest + service worker (not yet added)
- [ ] No test files exist under apps/web despite vitest+RTL being installed
- [ ] NEXT_PUBLIC_API_BASE_URL / Firebase env vars need real values to test
      auth-gated pages (watchlist/portfolio) and live data end-to-end locally.

### Not started
- [ ] Admin panel UI (backend /api/admin exists, no frontend)
- [ ] Chrome Extension (Phase 4)
- [ ] Flutter Android app (Phase 5)
- [ ] CI/CD (.github/workflows is empty)
- [ ] Consolidate duplicate schema.sql files (apps/api/src/db/schema.sql vs supabase/schema.sql)
- [ ] README / setup / deployment docs (docs/ is empty)
- [ ] Live deployment (GitHub Pages + Render) — nothing deployed yet

## Decisions log
- apps/api uses raw fetch to Yahoo Finance public endpoints (chart,
  quoteSummary, search) rather than yahoo-finance2 npm package, to stay
  CommonJS-compatible and avoid the ESM-only breaking change in
  yahoo-finance2 v2.14+.
- Static export (output: 'export') for Next.js so it can be hosted on
  GitHub Pages with zero server cost; dynamic stock symbol pages use
  generateStaticParams for a curated list + client-side fetch fallback.

## Session 3 update (continued from session 2)

Completed this session:
- Verified apps/api PRODUCTION build (not just tsx dev mode) actually runs
  and serves real live data — started compiled dist/server.js, hit /health
  and /api/stocks/RELIANCE/quote, both returned correct real data. The
  node-fetch v3 ESM risk flagged earlier is NOT an issue in practice.
- Deleted the duplicate/stale supabase/schema.sql at repo root; added
  supabase/README.md pointing to apps/api/src/db/schema.sql as the single
  source of truth.
- Added PWA support: apps/web/src/app/manifest.ts (Next.js App Router
  manifest convention, basePath-aware for GitHub Pages), apps/web/public/sw.js
  (service worker — caches app shell, never caches /api/ responses so stock
  data is never stale), apps/web/public/icons/icon.svg, registered via
  ServiceWorkerRegistrar component in layout.tsx (production-only).
- Built the Admin Panel UI at /admin (apps/web/src/app/admin/) — dashboard
  tab (request monitoring stats, user/watchlist/portfolio counts), logs tab,
  errors tab, users tab. Gated client-side by requiring sign-in; server
  enforces the real ADMIN_EMAILS allowlist check (403 if not admin). Added
  to Sidebar nav.
- Wrote docs/SETUP.md and docs/DEPLOYMENT.md (Supabase/Firebase setup,
  local dev, Render + GitHub Pages deployment steps, troubleshooting).
- Wrote root README.md.
- Added .github/workflows/ci.yml (build+test all 3 workspaces on push/PR)
  and .github/workflows/deploy-web.yml (static export -> GitHub Pages via
  actions/deploy-pages, reads NEXT_PUBLIC_* from repo secrets).
- Added apps/web test infra (vitest.config.ts + vitest.setup.ts + jsdom +
  @vitejs/plugin-react — none of this existed before) and 4 real test files
  (format.test.ts, recentlyViewed.test.ts, PriceChange.test.tsx,
  DisclaimerBox.test.tsx) — 22 tests, all passing.
  NOTE: hit and fixed a real environment bug — Node 22+'s native global
  `localStorage` shadows jsdom's implementation under vitest 1.6.0, leaving
  `localStorage` undefined in tests. Fix lives in vitest.setup.ts: pulls the
  real jsdom Storage instance off `globalThis.jsdom` (which vitest exposes)
  and rebinds it onto `globalThis.localStorage`/`sessionStorage`. If vitest
  is ever upgraded past 1.x, re-verify this workaround is still needed.
- Full verification: `npm run test` → 105/105 tests passing (60 shared + 23
  api + 22 web). `npm run build:shared`, `build:api`, `build:web` all clean,
  45 static pages generated.

### BLOCKED — needs user action (cannot be automated by the agent)
- Local git repo was initialized (`git init` in repo root) but there is
  **no git identity configured** (`git config --global user.name/user.email`
  both empty) and **no GitHub CLI login** (`gh auth status` fails). Cannot
  commit or push until the user runs:
  ```
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  gh auth login
  ```
  Once done, next step is: stage files (excluding node_modules/.next/out/.env
  per .gitignore, already correct), commit, `gh repo create` or push to an
  existing remote, and push to a feature branch (never main directly, per
  git safety rules) — then open a PR or push branch to be reviewed.

## Session 4 update — real Supabase project connected

- User created a real Supabase project (org: uddaedda-collab's Org, project:
  "uddaedda-collab's Project", region ap-southeast-2/Sydney) via GitHub login.
- Filled apps/api/.env with real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
  (using Supabase's new `sb_secret_...` key format). This file is gitignored,
  never committed.
- Agent connected directly to the Supabase Postgres instance using the `pg`
  npm package and the database password, and ran apps/api/src/db/schema.sql
  programmatically (via the session pooler host
  aws-0-ap-southeast-2.pooler.supabase.com:5432 — the direct db.<ref>.supabase.co
  host did not resolve via DNS, pooler host did). Verified via
  information_schema query: all 5 tables exist (api_logs, portfolio_holdings,
  price_alerts, user_profiles, watchlist_items). Temporary one-off scripts
  used for this were deleted afterward — not part of the committed codebase.
- Repo pushed to GitHub: https://github.com/uddaedda-collab/stocksense-research
  (private repo, main branch, CI workflow active).
- Git identity set to uddaedda-collab / GitHub noreply email (no public
  name/email was set on the GitHub profile).

## Session 5 update — real Firebase project connected, backend fully live-tested

- User created a real Firebase project ("stocksense-research", Spark/free
  plan) via Google login. Enabled Email/Password + Google sign-in providers.
- User registered a web app in Firebase console, agent extracted the config
  (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
  from the on-screen snippet and wrote apps/web/.env.local directly — no
  manual file editing needed from the user.
- User downloaded the Firebase Admin SDK service account JSON (private key)
  and placed it in the workspace root (~/Desktop/kiro/). Agent read it,
  extracted project_id/client_email/private_key into apps/api/.env, then
  DELETED the downloaded JSON file from disk (private keys must never sit
  around as loose files — value is now only in the gitignored .env).
- Verified end-to-end: rebuilt apps/api (npm run build:api), ran the compiled
  production server, confirmed zero env warnings (both Supabase and Firebase
  admin credentials loaded correctly), and hit a real live data endpoint
  (/api/stocks/TCS/quote) — returned real current TCS price/volume data.
- Agent set all 6 NEXT_PUBLIC_FIREBASE_* values as GitHub Actions repository
  secrets via `gh secret set` (used for the deploy-web.yml workflow) — no
  manual GitHub UI steps needed from the user for this part.

## Session 6 update — FRONTEND IS LIVE

- User confirmed repo could go public (re-verified via `git ls-files` that
  no .env/.env.local/service-account JSON was ever committed — only
  package.json/tsconfig.json matched a `.json` filename grep, both harmless).
- Agent made the repo public via `gh repo edit --visibility public`.
- Agent enabled GitHub Pages via `gh api -X POST .../pages -f build_type=workflow`.
- Agent triggered the deploy-web.yml workflow via `gh workflow run` — build
  and deploy jobs both succeeded (52s + 8s).
- **Live URL confirmed working (HTTP 200): https://uddaedda-collab.github.io/stocksense-research/**
- Frontend UI is fully live and browsable. Live stock data will not appear
  yet because NEXT_PUBLIC_API_BASE_URL still points to localhost (baked in
  at build time) — backend is not deployed yet, see below.

## Session 7 update — real Supabase & Firebase creds wired end-to-end, Render build bug fixed

- User created the Supabase service account keys correctly and provided them;
  agent wrote apps/api/.env with real SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY,
  FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY (extracted from a downloaded
  service-account JSON, which was deleted from disk immediately after reading
  — private keys must never sit around as loose files).
- Verified locally: rebuilt apps/api, ran the compiled prod server, zero env
  warnings, confirmed a real live data endpoint returns correct data.
- Set all 6 NEXT_PUBLIC_FIREBASE_* values as GitHub Actions repo secrets via
  `gh secret set` — no manual GitHub UI steps needed from the user.
- Made the repo public (re-verified via `git ls-files` first that no .env/
  service-account JSON was ever committed) and enabled GitHub Pages via
  `gh api -X POST .../pages -f build_type=workflow`.
- Triggered deploy-web.yml — **frontend is live and confirmed working (HTTP 200)
  at https://uddaedda-collab.github.io/stocksense-research/**. UI/pages all
  render; live stock data not yet visible because backend isn't deployed.
- User began Render backend deployment (New Web Service, connected GitHub
  repo, filled in Root Directory=apps/api, Build/Start commands, Free
  instance, all 9 env vars including FIREBASE_PRIVATE_KEY). First deploy
  attempt FAILED at build time.

### Bug found & fixed: TypeScript build failure on Render
Render's fresh `npm install` on Linux errored with:
`tsconfig.json: error TS5102: Option 'moduleResolution=node' is deprecated
and will stop functioning in TypeScript 7.0`
Root cause: explicit `"moduleResolution": "Node"` in apps/api/tsconfig.json
and packages/shared/tsconfig.json is a legacy/deprecated setting as of newer
TypeScript minor versions, even though the pinned `typescript` version
(5.5.4) is identical locally and on Render — the deprecation warning
threshold changed in a TS 5.5.x patch release, and it wasn't caught locally
because cached local node_modules avoided a truly fresh resolution.
Fix: removed the `moduleResolution` line entirely from both tsconfig.json
files (module: "CommonJS" alone is sufficient for TS to infer the correct
resolution strategy — this is the cleaner, version-proof fix vs. adding
`ignoreDeprecations`, which was tried first but is just a band-aid).
Verified: clean `npm install` (deleted all node_modules first), rebuilt
shared+api+web, reran full test suite (83/83 passing), all green.
Committed and will be pushed — Render should be manually redeployed
(or will auto-deploy on next push if auto-deploy is enabled) to pick up the fix.

### Second Render build failure & fix
After the moduleResolution fix, Render's build progressed further but then
failed with `TS2307: Cannot find module 'vitest'` inside the *.test.ts files
under packages/shared/src. Root cause: `tsc` was compiling test files too
(tsconfig had `"include": ["src"]` with no exclude), and vitest types aren't
installed in a production-only environment on Render, whereas locally
devDependencies (including vitest) were present so it silently worked.
Fix: added `"exclude": ["src/**/*.test.ts", "node_modules", "dist"]` to both
apps/api/tsconfig.json and packages/shared/tsconfig.json — test files should
never have been part of the production tsc build in the first place; vitest
runs them directly and doesn't need them pre-compiled via tsc.
Verified: clean rebuild of both packages succeeds, full test suite (83/83)
still passes via `npm run test`. Committed and pushed.

### Still needed from the user (cannot be automated)
- [ ] Retry/trigger the Render deploy now that BOTH tsconfig fixes are pushed
      (Render dashboard -> service -> "Manual Deploy" -> "Deploy latest commit").
- [ ] Once Render deploy succeeds, copy the resulting service URL
      (looks like https://stocksense-research.onrender.com) and give it to
      the agent, which will: set it as NEXT_PUBLIC_API_BASE_URL GitHub
      secret via `gh secret set`, and re-run the deploy-web workflow so the
      frontend's static build points at the real backend.
- [ ] Double check CORS_ORIGIN env var on Render is exactly
      `https://uddaedda-collab.github.io` (no trailing slash) — already
      set this way during initial service creation, just confirm after deploy.
- [ ] Chrome Extension (Phase 4) — folder still empty
- [ ] Flutter Android app (Phase 5) — folder still empty
- [ ] Lighthouse audit against a live URL (can't run meaningfully against
      localhost/static files the same way; needs real deployment first)

## Next step (session 4+)
1. Once git identity + gh auth are set up by the user: commit and push.
2. Set up real Supabase project + Firebase project, fill in .env files.
3. Deploy: web -> GitHub Pages (workflow ready), api -> Render free tier
   (manual setup per docs/DEPLOYMENT.md, no workflow file needed since
   Render auto-deploys from a connected GitHub repo).
4. Run Lighthouse against the live URL, fix any flagged issues.
5. Chrome Extension (Phase 4), Flutter app (Phase 5).
