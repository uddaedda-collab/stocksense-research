import type { ScreenerFilters, ScreenerResultRow } from './types';

/**
 * Applies screener filters to a list of candidate rows. Pure function so it
 * can run identically on the API (server-side filtering) and in tests.
 */
export function applyScreenerFilters(
  rows: ScreenerResultRow[],
  filters: ScreenerFilters
): ScreenerResultRow[] {
  return rows.filter((row) => {
    if (filters.sector && row.sector !== filters.sector) return false;
    if (filters.minPE !== undefined && (row.peRatio === null || row.peRatio < filters.minPE)) return false;
    if (filters.maxPE !== undefined && (row.peRatio === null || row.peRatio > filters.maxPE)) return false;
    if (filters.minPB !== undefined && (row.pbRatio === null || row.pbRatio < filters.minPB)) return false;
    if (filters.maxPB !== undefined && (row.pbRatio === null || row.pbRatio > filters.maxPB)) return false;
    if (filters.minMarketCap !== undefined && (row.marketCap === null || row.marketCap < filters.minMarketCap)) return false;
    if (filters.maxMarketCap !== undefined && (row.marketCap === null || row.marketCap > filters.maxMarketCap)) return false;
    if (filters.minROE !== undefined && (row.roe === null || row.roe < filters.minROE)) return false;
    if (filters.minROCE !== undefined && (row.roce === null || row.roce < filters.minROCE)) return false;
    if (filters.maxDebtToEquity !== undefined && (row.debtToEquity === null || row.debtToEquity > filters.maxDebtToEquity)) return false;
    if (filters.minDividendYield !== undefined && (row.dividendYield === null || row.dividendYield < filters.minDividendYield)) return false;
    if (filters.minPrice !== undefined && row.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && row.price > filters.maxPrice) return false;
    if (filters.minRSI !== undefined && (row.rsi14 === null || row.rsi14 < filters.minRSI)) return false;
    if (filters.maxRSI !== undefined && (row.rsi14 === null || row.rsi14 > filters.maxRSI)) return false;
    return true;
  });
}
