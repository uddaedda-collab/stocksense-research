'use client';

import type { IndexQuote } from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { formatNumber } from '@/lib/format';
import { PriceChange } from '@/components/ui/PriceChange';
import { CardSkeleton } from '@/components/ui/Skeleton';

export function IndexTicker() {
  const { data, loading, error } = useApi<{ indices: IndexQuote[] }>('/api/market/indices');

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-gray-500">Market indices are temporarily unavailable.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {data.indices.map((idx) => (
        <div key={idx.symbol} className="card-animated">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{idx.name}</p>
          <p className="mt-1 text-lg font-bold">{formatNumber(idx.value)}</p>
          <PriceChange changePercent={idx.changePercent} />
        </div>
      ))}
    </div>
  );
}
