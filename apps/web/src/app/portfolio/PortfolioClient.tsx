'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatINR, formatPercent } from '@/lib/format';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  average_buy_price: number;
  buy_date: string;
  currentPrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioSummary {
  totalInvested: number;
  totalCurrent: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export function PortfolioClient() {
  const { user, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [averageBuyPrice, setAverageBuyPrice] = useState(100);
  const [buyDate, setBuyDate] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ holdings: Holding[]; summary: PortfolioSummary | null }>('/api/portfolio', {
        auth: true,
      });
      setHoldings(data.holdings);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/portfolio', {
        method: 'POST',
        auth: true,
        body: { symbol: symbol.trim().toUpperCase(), quantity, averageBuyPrice, buyDate },
      });
      setSymbol('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add holding.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await apiFetch(`/api/portfolio/${id}`, { method: 'DELETE', auth: true });
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to remove holding.');
    }
  }

  if (authLoading) return <CardSkeleton />;

  if (!user) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">My Portfolio</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sign in to track your virtual portfolio, P&amp;L, and allocation.
        </p>
        <Link href="/login" className="btn-primary inline-block w-fit">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Portfolio</h1>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Invested" value={formatINR(summary.totalInvested, 0)} />
          <SummaryCard label="Current Value" value={formatINR(summary.totalCurrent, 0)} />
          <SummaryCard
            label="Total P&L"
            value={formatINR(summary.totalPnl, 0)}
            positive={summary.totalPnl >= 0}
          />
          <SummaryCard
            label="Returns"
            value={formatPercent(summary.totalPnlPercent)}
            positive={summary.totalPnlPercent >= 0}
          />
        </div>
      )}

      <form onSubmit={handleAdd} className="card space-y-4">
        <h2 className="font-semibold">Add Holding</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Symbol</span>
            <input type="text" className="input-field" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Quantity</span>
            <input
              type="number"
              min={1}
              className="input-field"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Avg Buy Price (₹)</span>
            <input
              type="number"
              min={0.01}
              step="0.01"
              className="input-field"
              value={averageBuyPrice}
              onChange={(e) => setAverageBuyPrice(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Buy Date</span>
            <input type="date" className="input-field" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} />
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Holding'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <CardSkeleton />
      ) : holdings && holdings.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="py-2 pr-3">Symbol</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Avg Buy</th>
                <th className="py-2 pr-3">Current Price</th>
                <th className="py-2 pr-3">Invested</th>
                <th className="py-2 pr-3">Current Value</th>
                <th className="py-2 pr-3">P&amp;L</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="py-2 pr-3 font-medium">
                    <Link href={`/stock/${h.symbol}`} className="text-brand-600 hover:underline">
                      {h.symbol}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{h.quantity}</td>
                  <td className="py-2 pr-3">{formatINR(h.average_buy_price)}</td>
                  <td className="py-2 pr-3">{formatINR(h.currentPrice)}</td>
                  <td className="py-2 pr-3">{formatINR(h.investedValue, 0)}</td>
                  <td className="py-2 pr-3">{formatINR(h.currentValue, 0)}</td>
                  <td className={`py-2 pr-3 ${h.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatINR(h.pnl, 0)} ({formatPercent(h.pnlPercent)})
                  </td>
                  <td className="py-2 pr-3">
                    <button onClick={() => handleRemove(h.id)} className="btn-secondary">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-gray-500">No holdings yet. Add your first holding above.</p>
        </div>
      )}

      <DisclaimerBox text="This is a virtual portfolio tracker for personal record-keeping only. It does not execute real trades and is not investment advice." />
    </div>
  );
}

function SummaryCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const colorClass =
    positive === undefined ? '' : positive ? 'text-green-600' : 'text-red-600';
  return (
    <div className="card">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
