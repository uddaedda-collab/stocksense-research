'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { formatDate, formatINR } from '@/lib/format';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  triggered: boolean;
  created_at: string;
}

export function AlertsClient() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState(100);
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ alerts: PriceAlert[] }>('/api/alerts', { auth: true });
      setAlerts(data.alerts);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/alerts', {
        method: 'POST',
        auth: true,
        body: { symbol: trimmed, targetPrice, direction },
      });
      setSymbol('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create alert.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await apiFetch(`/api/alerts/${id}`, { method: 'DELETE', auth: true });
      setAlerts((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to remove alert.');
    }
  }

  if (authLoading) return <CardSkeleton />;

  if (!user) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">Price Alerts</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sign in to create price alerts that sync across devices.
        </p>
        <Link href="/login" className="btn-primary inline-block w-fit">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Price Alerts</h1>

      <form onSubmit={handleAdd} className="card space-y-4">
        <h2 className="font-semibold">Create Alert</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Symbol</span>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. RELIANCE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Target Price (₹)</span>
            <input
              type="number"
              min={0.01}
              step="0.01"
              className="input-field"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Trigger When Price Is</span>
            <select
              className="input-field"
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            >
              <option value="above">Above target</option>
              <option value="below">Below target</option>
            </select>
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Alert'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <CardSkeleton />
      ) : alerts && alerts.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="py-2 pr-3">Symbol</th>
                <th className="py-2 pr-3">Condition</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="py-2 pr-3 font-medium">
                    <Link href={`/stock/${a.symbol}`} className="text-brand-600 hover:underline">
                      {a.symbol}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 capitalize">
                    Price {a.direction} {formatINR(a.target_price)}
                  </td>
                  <td className="py-2 pr-3">
                    {a.triggered ? (
                      <span className="badge-gain">Triggered</span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{formatDate(a.created_at)}</td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => handleRemove(a.id)}
                      aria-label={`Remove alert for ${a.symbol}`}
                      className="btn-secondary"
                    >
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
          <p className="text-sm text-gray-500">No alerts yet. Create one above.</p>
        </div>
      )}

      <DisclaimerBox text="Alerts are based on delayed free market data and checked periodically, not in real time. Do not rely on alerts for time-sensitive trading decisions. Not investment advice." />
    </div>
  );
}
