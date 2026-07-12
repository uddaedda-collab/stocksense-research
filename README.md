# StockSense Research

A free, AI-assisted research platform for Indian stock markets (NSE/BSE) —
dashboards, fundamentals, technicals, screener, comparisons, a virtual
portfolio/watchlist, calculators, and a rule-based research chatbot. Built
entirely on free tiers with delayed public market data.

**This is an educational/research tool. It is NOT investment advice and is
not a SEBI-registered investment adviser.** See [DISCLAIMER](#disclaimer).

## Features

- 📊 Dashboard — index ticker, top gainers/losers/most active, 52-week levels
- 🏢 Stock detail pages — profile, fundamentals, technicals, AI-generated
  analysis, probabilistic predictions (short/medium/long term), news
- 🔍 Screener — filter by P/E, P/B, market cap, ROE, ROCE, debt/equity,
  dividend yield, price, RSI
- ⚖️ Compare — 2 to 5 stocks side by side
- ⭐ Watchlist & 💼 virtual portfolio (Firebase-authenticated, Supabase-backed)
- 🧮 Calculators — SIP, Lumpsum, EMI, SWP, Brokerage, Compound Interest, Retirement
- 🤖 AI chatbot — explains ratios, indicators, and financial concepts
- 🗺️ Sector/market heatmap, 🌍 economy indicators, 📰 market news
- 🛠️ Admin panel — request monitoring, error logs, user stats (email-allowlisted)
- 🌗 Dark/light mode, 📱 installable PWA

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, static export), TypeScript, TailwindCSS |
| Backend | Node.js, Express (CommonJS) |
| Database | Supabase (Postgres, free tier) |
| Auth | Firebase Authentication |
| Charts | TradingView Lightweight Charts |
| Market data | Yahoo Finance public JSON endpoints (unofficial, free, ~15min delayed) |
| Hosting | Frontend → GitHub Pages · Backend → Render (free tier) · DB → Supabase |

## Monorepo structure

```
stock-research-platform/
  apps/
    api/            Express backend (@platform/api)
    web/             Next.js frontend (@platform/web)
  packages/
    shared/          Shared types, indicators, calculators, AI logic (@platform/shared)
  supabase/          Database setup instructions (schema lives in apps/api/src/db)
  chrome-extension/  Browser extension (Manifest V3) — planned
  flutter-app/       Android app — planned
  docs/              Setup & deployment guides
  .github/workflows/ CI/CD pipelines
```

## Quick start (local development)

See [docs/SETUP.md](docs/SETUP.md) for full instructions. Short version:

```bash
npm install
npm run build --workspace=@platform/shared
cp apps/api/.env.example apps/api/.env      # fill in Supabase/Firebase keys
npm run dev:api      # http://localhost:4000
npm run dev:web       # http://localhost:3000 (in a second terminal)
```

## Testing

```bash
npm run test          # runs shared + api + web test suites
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deploying the frontend to
GitHub Pages and the backend to Render, both on free tiers.

## Disclaimer

All data on this platform is sourced from free, publicly accessible, delayed
market data feeds. Nothing on this platform — including AI-generated ratings,
summaries, or predictions — constitutes investment advice, a recommendation,
or a guarantee of future performance. Always consult a SEBI-registered
investment adviser before making investment decisions.

## License

This project is provided for educational purposes. See individual package
licenses for third-party dependencies.
