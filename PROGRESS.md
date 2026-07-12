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

### Still not started
- [ ] Real Supabase + Firebase projects with actual keys filled into .env
      (needed to test watchlist/portfolio/admin/auth end-to-end, not just
      via automated tests which mock/bypass auth)
- [ ] Actual live deployment (nothing is hosted anywhere yet — code only)
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
