import type { MarketMovers, Quote, ScreenerResultRow } from '@platform/shared';
import { rsi } from '@platform/shared';
import { env } from '../config/env';
import { cached } from './cache';
import { NIFTY50_SYMBOLS } from '../data/symbols';
import { getFundamentals, getHistoricalBars, getQuote } from './marketData';

/** Fetches quotes for the full NIFTY 50 universe (used for movers/heatmap/screener). */
export async function getUniverseQuotes(): Promise<Quote[]> {
  return cached('universe:quotes', env.CACHE_TTL_QUOTE_SECONDS, async () => {
    const results = await Promise.allSettled(NIFTY50_SYMBOLS.map((s) => getQuote(s.symbol)));
    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
      .map((r) => r.value);
  });
}

export async function getMarketMovers(): Promise<MarketMovers> {
  const quotes = await getUniverseQuotes();
  const sorted = [...quotes];

  const topGainers = [...sorted].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10);
  const topLosers = [...sorted].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10);
  const mostActive = [...sorted].sort((a, b) => b.volume - a.volume).slice(0, 10);
  const near52WeekHigh = [...sorted]
    .filter((q) => q.fiftyTwoWeekHigh > 0)
    .sort((a, b) => a.price / a.fiftyTwoWeekHigh < b.price / b.fiftyTwoWeekHigh ? 1 : -1)
    .slice(0, 10);
  const near52WeekLow = [...sorted]
    .filter((q) => q.fiftyTwoWeekLow > 0)
    .sort((a, b) => a.price / a.fiftyTwoWeekLow > b.price / b.fiftyTwoWeekLow ? 1 : -1)
    .slice(0, 10);

  return { topGainers, topLosers, mostActive, near52WeekHigh, near52WeekLow };
}

/**
 * Builds the full screener universe by combining quotes, fundamentals, and a
 * quick RSI calculation for every NIFTY 50 constituent. Cached for an hour
 * since fundamentals rarely change intraday.
 */
export async function getScreenerUniverse(): Promise<ScreenerResultRow[]> {
  return cached('screener:universe', env.CACHE_TTL_HISTORY_SECONDS, async () => {
    const rows = await Promise.allSettled(
      NIFTY50_SYMBOLS.map(async (meta) => {
        const [quote, fundamentals, bars] = await Promise.all([
          getQuote(meta.symbol),
          getFundamentals(meta.symbol),
          getHistoricalBars(meta.symbol, { range: '3mo', interval: '1d' }),
        ]);
        const closes = bars.map((b) => b.close);
        const row: ScreenerResultRow = {
          symbol: meta.symbol,
          displaySymbol: meta.displaySymbol,
          name: meta.name,
          sector: meta.sector,
          price: quote.price,
          peRatio: fundamentals.peRatio,
          pbRatio: fundamentals.pbRatio,
          marketCap: fundamentals.marketCap,
          roe: fundamentals.roe,
          roce: fundamentals.roce,
          debtToEquity: fundamentals.debtToEquity,
          dividendYield: fundamentals.dividendYield,
          rsi14: rsi(closes, 14),
        };
        return row;
      })
    );
    return rows
      .filter((r): r is PromiseFulfilledResult<ScreenerResultRow> => r.status === 'fulfilled')
      .map((r) => r.value);
  });
}
