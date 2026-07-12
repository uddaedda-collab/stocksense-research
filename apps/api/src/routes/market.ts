import { Router } from 'express';
import { generateAllHorizonPredictions } from '@platform/shared';
import { getHistoricalBars, getIndexQuotes } from '../services/marketData';
import { getMarketMovers, getUniverseQuotes } from '../services/movers';
import { fetchMarketNews, fetchSectorNews } from '../services/news';
import { fetchQuote } from '../services/yahooFinance';
import { cached } from '../services/cache';
import { env } from '../config/env';
import {
  ECONOMY_SYMBOLS,
  GLOBAL_MARKET_SYMBOLS,
  SECTOR_INDEX_SYMBOLS,
} from '../data/symbols';
import { asyncHandler } from '../middleware/asyncHandler';

export const marketRouter = Router();

marketRouter.get(
  '/indices',
  asyncHandler(async (_req, res) => {
    const indices = await getIndexQuotes();
    res.json({ indices });
  })
);

marketRouter.get(
  '/sector-indices',
  asyncHandler(async (_req, res) => {
    const results = await cached('market:sector-indices', env.CACHE_TTL_QUOTE_SECONDS, async () => {
      const settled = await Promise.allSettled(
        SECTOR_INDEX_SYMBOLS.map((s) => fetchQuote(s.symbol, s.name, s.name, 'NSE'))
      );
      return settled
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>> => r.status === 'fulfilled')
        .map((r) => ({
          name: r.value.name,
          symbol: r.value.symbol,
          value: r.value.price,
          change: r.value.change,
          changePercent: r.value.changePercent,
        }));
    });
    res.json({ indices: results });
  })
);

marketRouter.get(
  '/movers',
  asyncHandler(async (_req, res) => {
    const movers = await getMarketMovers();
    res.json(movers);
  })
);

marketRouter.get(
  '/heatmap',
  asyncHandler(async (_req, res) => {
    const quotes = await getUniverseQuotes();
    res.json({
      cells: quotes.map((q) => ({
        symbol: q.displaySymbol,
        name: q.name,
        changePercent: q.changePercent,
        marketCap: q.marketCap,
        price: q.price,
      })),
    });
  })
);

marketRouter.get(
  '/breadth',
  asyncHandler(async (_req, res) => {
    const quotes = await getUniverseQuotes();
    const advancing = quotes.filter((q) => q.changePercent > 0).length;
    const declining = quotes.filter((q) => q.changePercent < 0).length;
    const unchanged = quotes.length - advancing - declining;
    res.json({ advancing, declining, unchanged, total: quotes.length });
  })
);

marketRouter.get(
  '/global',
  asyncHandler(async (_req, res) => {
    const results = await cached('market:global', env.CACHE_TTL_QUOTE_SECONDS, async () => {
      const settled = await Promise.allSettled(
        GLOBAL_MARKET_SYMBOLS.map((s) => fetchQuote(s.symbol, s.name, s.name, 'NSE'))
      );
      return settled
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>> => r.status === 'fulfilled')
        .map((r) => ({
          name: r.value.name,
          symbol: r.value.symbol,
          value: r.value.price,
          change: r.value.change,
          changePercent: r.value.changePercent,
        }));
    });
    res.json({ markets: results });
  })
);

marketRouter.get(
  '/economy',
  asyncHandler(async (_req, res) => {
    const results = await cached('market:economy', env.CACHE_TTL_QUOTE_SECONDS, async () => {
      const settled = await Promise.allSettled(
        ECONOMY_SYMBOLS.map(async (s) => {
          const quote = await fetchQuote(s.symbol, s.name, s.name, 'NSE');
          return {
            name: s.name,
            value: quote.price,
            unit: s.unit,
            changePercent: quote.changePercent,
            asOf: quote.asOf,
          };
        })
      );
      return settled
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);
    });
    res.json({ indicators: results });
  })
);

marketRouter.get(
  '/news',
  asyncHandler(async (_req, res) => {
    const news = await fetchMarketNews();
    res.json({ news });
  })
);

marketRouter.get(
  '/direction',
  asyncHandler(async (_req, res) => {
    const direction = await cached('market:direction', env.CACHE_TTL_HISTORY_SECONDS, async () => {
      const [niftyBars, sensexBars] = await Promise.all([
        getHistoricalBars('^NSEI', { range: '2y', interval: '1d' }),
        getHistoricalBars('^BSESN', { range: '2y', interval: '1d' }),
      ]);

      const niftyPredictions = generateAllHorizonPredictions(niftyBars);
      const sensexPredictions = generateAllHorizonPredictions(sensexBars);

      // Legal, free pre-market sentiment proxy: since GIFT Nifty (NSE IX,
      // GIFT City) has no free/public data feed, we use the same signal
      // traders read GIFT Nifty for - overnight moves in US futures/indices
      // and other Asian markets that are open before/around NSE's opening
      // bell - to gauge likely opening sentiment. This is clearly labeled
      // as a proxy, not GIFT Nifty itself.
      const globalSettled = await Promise.allSettled(
        GLOBAL_MARKET_SYMBOLS.map((s) => fetchQuote(s.symbol, s.name, s.name, 'NSE'))
      );
      const globalQuotes = globalSettled
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchQuote>>> => r.status === 'fulfilled')
        .map((r) => r.value);
      const globalAvgChangePercent =
        globalQuotes.length > 0
          ? globalQuotes.reduce((sum, q) => sum + q.changePercent, 0) / globalQuotes.length
          : 0;
      const preMarketBias: 'positive' | 'negative' | 'neutral' =
        globalAvgChangePercent > 0.3 ? 'positive' : globalAvgChangePercent < -0.3 ? 'negative' : 'neutral';

      // Combine NIFTY + SENSEX per-horizon views into one blended view per horizon.
      const horizons: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];
      const blended = horizons.map((horizon) => {
        const n = niftyPredictions.find((p) => p.horizon === horizon)!;
        const s = sensexPredictions.find((p) => p.horizon === horizon)!;
        const avgProbability = Math.round((n.probabilityScore + s.probabilityScore) / 2);
        const avgConfidence = Math.round((n.confidencePercent + s.confidencePercent) / 2);
        let direction: 'bullish' | 'bearish' | 'sideways' = 'sideways';
        if (n.direction === s.direction) direction = n.direction;
        else if (avgProbability > 58) direction = 'bullish';
        else if (avgProbability < 42) direction = 'bearish';

        return {
          horizon,
          direction,
          probabilityScore: avgProbability,
          confidencePercent: avgConfidence,
          niftyView: { direction: n.direction, probabilityScore: n.probabilityScore },
          sensexView: { direction: s.direction, probabilityScore: s.probabilityScore },
          factors: [...new Set([...n.factors, ...s.factors])].slice(0, 6),
        };
      });

      return {
        asOf: new Date().toISOString(),
        preMarketBias,
        preMarketAvgGlobalChangePercent: Number(globalAvgChangePercent.toFixed(2)),
        preMarketNote:
          'GIFT Nifty (NSE IX) has no free public data feed, so this uses overnight US/Asian market moves as a proxy for pre-market sentiment - the same signal GIFT Nifty is typically used for.',
        horizons: blended,
        disclaimer:
          'This market direction outlook is a probabilistic, rule-based technical estimate derived from NIFTY 50 and SENSEX price history. It is not investment advice and does not guarantee future market movement.',
      };
    });
    res.json(direction);
  })
);

marketRouter.get(
  '/news/sector/:sector',
  asyncHandler(async (req, res) => {
    const news = await fetchSectorNews(req.params.sector);
    res.json({ news });
  })
);
