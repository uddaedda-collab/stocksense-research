'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
}

export function WatchlistClient() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [adding, setAdding] = useState(false);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ items: WatchlistItem[] }>('/api/watchlist', { auth: true });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load watchlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadWatchlist();
  }, [user, loadWatchlist]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) return;
    setAdding(true);
    setError(null);
    try {
      await apiFetch('/api/watchlist', { method: 'POST', auth: true, body: { symbol } });
      setNewSymbol('');
      await loadWatchlist();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to add stock.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await apiFetch(`/api/watchlist/${id}`, { method: 'DELETE', auth: true });
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to remove stock.');
    }
  }

  if (authLoading) return <CardSkeleton />;

  if (!user) {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold">My Watchlist</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sign in to create and sync your watchlist across devices.
        </p>
        <Link href="/login" className="btn-primary inline-block w-fit">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Watchlist</h1>

      <form onSubmit={handleAdd} className="card flex gap-2">
        <input
          type="text"
          className="input-field"
          placeholder="Add symbol (e.g. RELIANCE)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={adding}>
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <CardSkeleton />
      ) : items && items.length > 0 ? (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <Link href={`/stock/${item.symbol}`} className="font-semibold text-brand-600 hover:underline">
                {item.symbol}
              </Link>
              <button
                onClick={() => handleRemove(item.id)}
                aria-label={`Remove ${item.symbol} from watchlist`}
                className="btn-secondary"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-gray-500">Your watchlist is empty. Add stocks using the form above.</p>
        </div>
      )}

      <DisclaimerBox text="Watchlist is for personal tracking only and does not constitute investment advice." />
    </div>
  );
}
