'use client';

import { useState } from 'react';
import type { FundamentalSnapshot, Quote } from '@platform/shared';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatCompactNumber, formatINR, formatNumber, formatPercent } from '@/lib/format';
import { PriceChange } from '@/components/ui/PriceChange';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface CompareRow {
  symbol: string;
  name: string;
  quote: Quote;
  fundamentals: FundamentalSnapshot;
  technicals: { rsi14: number | null; trend: string; sma50: number | null; sma200: number | null };
  oneYearReturnPercent: number | null;
}

export function CompareClient() {
  const [inputs, setInputs] = useState<string[]>(['RELIANCE', 'TCS']);
  const [rows, setRows] = useState<CompareRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateInput(index: number, value: string) {
    setInputs((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addSlot() {
    if (inputs.length < 5) setInputs((prev) => [...prev, '']);
  }

  function removeSlot(index: number) {
    if (inputs.length > 2) setInputs((prev) => prev.filter((_, i) => i !== index));
  }

  async function runCompare(e: React.FormEvent) {
    e.preventDefault();
    const symbols = inputs.map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (symbols.length < 2) {
      setError('Enter at least 2 stock symbols to compare.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ comparison: CompareRow[] }>(
        `/api/compare?symbols=${encodeURIComponent(symbols.join(','))}`
      );
      setRows(data.comparison);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to compare stocks.');
      setRows(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compare Stocks</h1>

      <form onSubmit={runCompare} className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          {inputs.map((value, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                className="input-field w-40"
                value={value}
                placeholder={`Symbol ${i + 1}`}
                onChange={(e) => updateInput(i, e.target.value)}
              />
              {inputs.length > 2 && (
                <button
                  type="button"
                  aria-label={`Remove symbol ${i + 1}`}
                  className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => removeSlot(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {inputs.length < 5 && (
            <button type="button" className="btn-secondary" onClick={addSlot}>
              + Add Stock
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {loading && <CardSkeleton />}

      {rows && !loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="py-2 pr-3">Metric</th>
                {rows.map((r) => (
                  <th key={r.symbol} className="py-2 pr-3">
                    {r.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRowLine label="Price" cells={rows.map((r) => formatINR(r.quote.price))} />
              <CompareRowLine
                label="Day Change"
                cells={rows.map((r) => r.quote.changePercent)}
                render={(v) => <PriceChange changePercent={v as number} />}
              />
              <CompareRowLine label="1Y Return" cells={rows.map((r) => formatPercent(r.oneYearReturnPercent))} />
              <CompareRowLine label="Market Cap" cells={rows.map((r) => formatCompactNumber(r.fundamentals.marketCap))} />
              <CompareRowLine label="P/E Ratio" cells={rows.map((r) => formatNumber(r.fundamentals.peRatio))} />
              <CompareRowLine label="P/B Ratio" cells={rows.map((r) => formatNumber(r.fundamentals.pbRatio))} />
              <CompareRowLine label="EPS" cells={rows.map((r) => (r.fundamentals.eps !== null ? formatINR(r.fundamentals.eps) : '—'))} />
              <CompareRowLine label="ROE" cells={rows.map((r) => formatPercent(r.fundamentals.roe))} />
              <CompareRowLine label="Debt/Equity" cells={rows.map((r) => formatNumber(r.fundamentals.debtToEquity))} />
              <CompareRowLine label="Dividend Yield" cells={rows.map((r) => formatPercent(r.fundamentals.dividendYield))} />
              <CompareRowLine label="RSI (14)" cells={rows.map((r) => formatNumber(r.technicals.rsi14, 1))} />
              <CompareRowLine label="Technical Trend" cells={rows.map((r) => r.technicals.trend)} />
              <CompareRowLine label="Sector" cells={rows.map((r) => r.fundamentals.sector ?? '—')} />
            </tbody>
          </table>
        </div>
      )}

      <DisclaimerBox text="Comparison figures are based on delayed free data. This is not investment advice — please do your own research before investing." />
    </div>
  );
}

function CompareRowLine({
  label,
  cells,
  render,
}: {
  label: string;
  cells: (string | number | null)[];
  render?: (v: string | number | null) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0 dark:border-gray-800">
      <td className="py-2 pr-3 font-medium text-gray-600 dark:text-gray-300">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="py-2 pr-3 capitalize">
          {render ? render(c) : c}
        </td>
      ))}
    </tr>
  );
}
