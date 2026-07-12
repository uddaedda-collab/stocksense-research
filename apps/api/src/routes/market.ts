import { Router } from 'express';
import { getIndexQuotes } from '../services/marketData';
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
  '/news/sector/:sector',
  asyncHandler(async (req, res) => {
    const news = await fetchSectorNews(req.params.sector);
    res.json({ news });
  })
);
