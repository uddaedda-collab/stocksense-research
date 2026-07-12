'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ScreenerResultRow } from '@platform/shared';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatCompactNumber, formatNumber, formatPercent } from '@/lib/format';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface Filters {
  sector: string;
  minPE: string;
  maxPE: string;
  minPB: string;
  maxPB: string;
  minMarketCap: string;
  maxMarketCap: string;
  minROE: string;
  minROCE: string;
  maxDebtToEquity: string;
  minDividendYield: string;
  minPrice: string;
  maxPrice: string;
  minRSI: string;
  maxRSI: string;
}

const EMPTY_FILTERS: Filters = {
  sector: '',
  minPE: '',
  maxPE: '',
  minPB: '',
  maxPB: '',
  minMarketCap: '',
  maxMarketCap: '',
  minROE: '',
  minROCE: '',
  maxDebtToEquity: '',
  minDividendYield: '',
  minPrice: '',
  maxPrice: '',
  minRSI: '',
  maxRSI: '',
};

export function ScreenerClient() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [results, setResults] = useState<ScreenerResultRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  async function runScreener(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim() !== '') params.set(key, value.trim());
      });
      const data = await apiFetch<{ count: number; results: ScreenerResultRow[] }>(
        `/api/screener?${params.toString()}`
      );
      setResults(data.results);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to run screener.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setResults(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Screener</h1>

      <form onSubmit={runScreener} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <TextField label="Sector" value={filters.sector} onChange={(v) => updateFilter('sector', v)} placeholder="e.g. Information Technology" />
          <RangeField label="P/E Ratio" min={filters.minPE} max={filters.maxPE} onMinChange={(v) => updateFilter('minPE', v)} onMaxChange={(v) => updateFilter('maxPE', v)} />
          <RangeField label="P/B Ratio" min={filters.minPB} max={filters.maxPB} onMinChange={(v) => updateFilter('minPB', v)} onMaxChange={(v) => updateFilter('maxPB', v)} />
          <RangeField label="Market Cap (₹)" min={filters.minMarketCap} max={filters.maxMarketCap} onMinChange={(v) => updateFilter('minMarketCap', v)} onMaxChange={(v) => updateFilter('maxMarketCap', v)} />
          <NumberField label="Min ROE (%)" value={filters.minROE} onChange={(v) => updateFilter('minROE', v)} />
          <NumberField label="Min ROCE (%)" value={filters.minROCE} onChange={(v) => updateFilter('minROCE', v)} />
          <NumberField label="Max Debt/Equity" value={filters.maxDebtToEquity} onChange={(v) => updateFilter('maxDebtToEquity', v)} />
          <NumberField label="Min Dividend Yield (%)" value={filters.minDividendYield} onChange={(v) => updateFilter('minDividendYield', v)} />
          <RangeField label="Price (₹)" min={filters.minPrice} max={filters.maxPrice} onMinChange={(v) => updateFilter('minPrice', v)} onMaxChange={(v) => updateFilter('maxPrice', v)} />
          <RangeField label="RSI (14)" min={filters.minRSI} max={filters.maxRSI} onMinChange={(v) => updateFilter('minRSI', v)} onMaxChange={(v) => updateFilter('maxRSI', v)} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Screening...' : 'Run Screener'}
          </button>
          <button type="button" className="btn-secondary" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {results && !loading && (
        <div className="card overflow-x-auto">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{results.length} stocks match your filters.</p>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No stocks matched. Try widening your filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="py-2 pr-3">Symbol</th>
                  <th className="py-2 pr-3">Sector</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">P/E</th>
                  <th className="py-2 pr-3">P/B</th>
                  <th className="py-2 pr-3">Market Cap</th>
                  <th className="py-2 pr-3">ROE</th>
                  <th className="py-2 pr-3">Debt/Equity</th>
                  <th className="py-2 pr-3">Div Yield</th>
                  <th className="py-2 pr-3">RSI</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.symbol} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-2 pr-3 font-medium">
                      <Link href={`/stock/${row.displaySymbol}`} className="text-brand-600 hover:underline">
                        {row.displaySymbol}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{row.sector ?? '—'}</td>
                    <td className="py-2 pr-3">₹{formatNumber(row.price)}</td>
                    <td className="py-2 pr-3">{formatNumber(row.peRatio)}</td>
                    <td className="py-2 pr-3">{formatNumber(row.pbRatio)}</td>
                    <td className="py-2 pr-3">{formatCompactNumber(row.marketCap)}</td>
                    <td className="py-2 pr-3">{formatPercent(row.roe)}</td>
                    <td className="py-2 pr-3">{formatNumber(row.debtToEquity)}</td>
                    <td className="py-2 pr-3">{formatPercent(row.dividendYield)}</td>
                    <td className="py-2 pr-3">{formatNumber(row.rsi14, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <DisclaimerBox text="Screener results are based on delayed free data and automated calculations. Verify figures independently before making any decisions. Not investment advice." />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600 dark:text-gray-300">{label}</span>
      <input type="text" className="input-field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600 dark:text-gray-300">{label}</span>
      <input type="number" className="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function RangeField({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  return (
    <div className="block text-sm">
      <span className="mb-1 block text-gray-600 dark:text-gray-300">{label}</span>
      <div className="flex gap-2">
        <input type="number" className="input-field" placeholder="Min" value={min} onChange={(e) => onMinChange(e.target.value)} />
        <input type="number" className="input-field" placeholder="Max" value={max} onChange={(e) => onMaxChange(e.target.value)} />
      </div>
    </div>
  );
}
