'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { apiFetch, ApiClientError } from '@/lib/apiClient';

export function WatchlistButton({ symbol }: { symbol: string }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    if (!user) {
      setMessage('Sign in to add stocks to your watchlist.');
      return;
    }
    setStatus('saving');
    setMessage(null);
    try {
      await apiFetch('/api/watchlist', { method: 'POST', auth: true, body: { symbol } });
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiClientError ? err.message : 'Failed to add to watchlist.');
    }
  }

  return (
    <div>
      <button onClick={handleAdd} disabled={status === 'saving' || status === 'saved'} className="btn-secondary">
        {status === 'saved' ? '✓ In Watchlist' : status === 'saving' ? 'Adding...' : '⭐ Add to Watchlist'}
      </button>
      {message && <p className="mt-1 text-xs text-amber-600">{message}</p>}
    </div>
  );
}
