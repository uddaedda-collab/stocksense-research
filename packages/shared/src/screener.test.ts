import { describe, expect, it } from 'vitest';
import { applyScreenerFilters } from './screener';
import type { ScreenerResultRow } from './types';

const rows: ScreenerResultRow[] = [
  {
    symbol: 'A.NS', displaySymbol: 'A', name: 'Alpha', sector: 'IT', price: 100,
    peRatio: 15, pbRatio: 2, marketCap: 1000, roe: 20, roce: 22, debtToEquity: 0.1, dividendYield: 2, rsi14: 55,
  },
  {
    symbol: 'B.NS', displaySymbol: 'B', name: 'Beta', sector: 'Banking', price: 500,
    peRatio: 40, pbRatio: 5, marketCap: 5000, roe: 8, roce: 6, debtToEquity: 2.5, dividendYield: 0, rsi14: 80,
  },
  {
    symbol: 'C.NS', displaySymbol: 'C', name: 'Gamma', sector: 'IT', price: 50,
    peRatio: null, pbRatio: null, marketCap: 200, roe: null, roce: null, debtToEquity: null, dividendYield: null, rsi14: null,
  },
];

describe('applyScreenerFilters', () => {
  it('returns all rows when no filters are applied', () => {
    expect(applyScreenerFilters(rows, {})).toHaveLength(3);
  });

  it('filters by sector', () => {
    const result = applyScreenerFilters(rows, { sector: 'IT' });
    expect(result.map((r) => r.symbol)).toEqual(['A.NS', 'C.NS']);
  });

  it('filters by PE range, excluding rows with null PE', () => {
    const result = applyScreenerFilters(rows, { minPE: 10, maxPE: 20 });
    expect(result.map((r) => r.symbol)).toEqual(['A.NS']);
  });

  it('filters by minROE excluding null values', () => {
    const result = applyScreenerFilters(rows, { minROE: 15 });
    expect(result.map((r) => r.symbol)).toEqual(['A.NS']);
  });

  it('filters by maxDebtToEquity', () => {
    const result = applyScreenerFilters(rows, { maxDebtToEquity: 1 });
    expect(result.map((r) => r.symbol)).toEqual(['A.NS']);
  });

  it('filters by RSI range', () => {
    const result = applyScreenerFilters(rows, { minRSI: 70 });
    expect(result.map((r) => r.symbol)).toEqual(['B.NS']);
  });

  it('combines multiple filters with AND logic', () => {
    const result = applyScreenerFilters(rows, { sector: 'IT', minPE: 10 });
    expect(result.map((r) => r.symbol)).toEqual(['A.NS']);
  });
});
