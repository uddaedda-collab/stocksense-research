import { Router } from 'express';
import { applyScreenerFilters, type ScreenerFilters } from '@platform/shared';
import { getScreenerUniverse } from '../services/movers';
import { asyncHandler } from '../middleware/asyncHandler';

export const screenerRouter = Router();

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

screenerRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = req.query;
    const filters: ScreenerFilters = {
      sector: typeof q.sector === 'string' && q.sector.length > 0 ? q.sector : undefined,
      minPE: parseNumber(q.minPE),
      maxPE: parseNumber(q.maxPE),
      minPB: parseNumber(q.minPB),
      maxPB: parseNumber(q.maxPB),
      minMarketCap: parseNumber(q.minMarketCap),
      maxMarketCap: parseNumber(q.maxMarketCap),
      minROE: parseNumber(q.minROE),
      minROCE: parseNumber(q.minROCE),
      maxDebtToEquity: parseNumber(q.maxDebtToEquity),
      minDividendYield: parseNumber(q.minDividendYield),
      minPrice: parseNumber(q.minPrice),
      maxPrice: parseNumber(q.maxPrice),
      minRSI: parseNumber(q.minRSI),
      maxRSI: parseNumber(q.maxRSI),
    };
    const universe = await getScreenerUniverse();
    const results = applyScreenerFilters(universe, filters);
    res.json({ count: results.length, results });
  })
);

screenerRouter.get(
  '/sectors',
  asyncHandler(async (_req, res) => {
    const universe = await getScreenerUniverse();
    const sectors = [...new Set(universe.map((r) => r.sector).filter((s): s is string => !!s))].sort();
    res.json({ sectors });
  })
);
