import { Router } from 'express';
import { computeTechnicalIndicators } from '@platform/shared';
import { getFundamentals, getHistoricalBars, getQuote } from '../services/marketData';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const compareRouter = Router();

compareRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const symbolsParam = String(req.query.symbols ?? '');
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symbols.length < 2 || symbols.length > 5) {
      throw new ApiError(400, 'Provide between 2 and 5 comma-separated symbols to compare.');
    }

    const rows = await Promise.all(
      symbols.map(async (symbol) => {
        const [quote, fundamentals, bars] = await Promise.all([
          getQuote(symbol),
          getFundamentals(symbol),
          getHistoricalBars(symbol, { range: '1y', interval: '1d' }),
        ]);
        const indicators = computeTechnicalIndicators(bars);
        const oneYearReturn =
          bars.length > 1 ? ((bars[bars.length - 1].close - bars[0].close) / bars[0].close) * 100 : null;

        return {
          symbol: quote.displaySymbol,
          name: quote.name,
          quote,
          fundamentals,
          technicals: {
            rsi14: indicators.rsi14,
            trend: indicators.trend,
            sma50: indicators.sma50,
            sma200: indicators.sma200,
          },
          oneYearReturnPercent: oneYearReturn !== null ? Number(oneYearReturn.toFixed(2)) : null,
        };
      })
    );

    res.json({ comparison: rows });
  })
);
