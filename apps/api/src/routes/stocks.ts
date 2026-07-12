import { Router } from 'express';
import {
  generateAIAnalysis,
  generateAllHorizonPredictions,
} from '@platform/shared';
import {
  getCompanyProfile,
  getFundamentals,
  getHistoricalBars,
  getQuote,
} from '../services/marketData';
import { fetchStockNews } from '../services/news';
import { searchSymbols } from '../services/yahooFinance';
import { asyncHandler } from '../middleware/asyncHandler';

export const stocksRouter = Router();

stocksRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) {
      res.json({ results: [] });
      return;
    }
    const results = await searchSymbols(q);
    res.json({ results });
  })
);

stocksRouter.get(
  '/:symbol/quote',
  asyncHandler(async (req, res) => {
    const quote = await getQuote(req.params.symbol);
    res.json(quote);
  })
);

stocksRouter.get(
  '/:symbol/profile',
  asyncHandler(async (req, res) => {
    const profile = await getCompanyProfile(req.params.symbol);
    res.json(profile);
  })
);

stocksRouter.get(
  '/:symbol/fundamentals',
  asyncHandler(async (req, res) => {
    const fundamentals = await getFundamentals(req.params.symbol);
    res.json(fundamentals);
  })
);

stocksRouter.get(
  '/:symbol/history',
  asyncHandler(async (req, res) => {
    const range = (req.query.range as any) ?? '5y';
    const interval = (req.query.interval as any) ?? '1d';
    const bars = await getHistoricalBars(req.params.symbol, { range, interval });
    res.json({ symbol: req.params.symbol, range, interval, bars });
  })
);

stocksRouter.get(
  '/:symbol/technicals',
  asyncHandler(async (req, res) => {
    const bars = await getHistoricalBars(req.params.symbol, { range: '2y', interval: '1d' });
    const { computeTechnicalIndicators } = await import('@platform/shared');
    const indicators = computeTechnicalIndicators(bars);
    res.json(indicators);
  })
);

stocksRouter.get(
  '/:symbol/predictions',
  asyncHandler(async (req, res) => {
    const bars = await getHistoricalBars(req.params.symbol, { range: '2y', interval: '1d' });
    const predictions = generateAllHorizonPredictions(bars);
    res.json({ symbol: req.params.symbol, predictions });
  })
);

stocksRouter.get(
  '/:symbol/ai-analysis',
  asyncHandler(async (req, res) => {
    const [quote, fundamentals, bars, profile] = await Promise.all([
      getQuote(req.params.symbol),
      getFundamentals(req.params.symbol),
      getHistoricalBars(req.params.symbol, { range: '2y', interval: '1d' }),
      getCompanyProfile(req.params.symbol),
    ]);
    const news = await fetchStockNews(quote.displaySymbol, profile.name).catch(() => []);
    const analysis = generateAIAnalysis({
      symbol: quote.displaySymbol,
      fundamentals,
      bars,
      news,
      currentPrice: quote.price,
    });
    res.json(analysis);
  })
);

stocksRouter.get(
  '/:symbol/news',
  asyncHandler(async (req, res) => {
    const profile = await getCompanyProfile(req.params.symbol);
    const news = await fetchStockNews(req.params.symbol, profile.name);
    res.json({ news });
  })
);
