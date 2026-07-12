'use client';

import type { EconomyIndicator } from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { formatDate, formatNumber } from '@/lib/format';
import { PriceChange } from '@/components/ui/PriceChange';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

export function EconomyClient() {
  const { data, loading, error } = useApi<{ indicators: EconomyIndicator[] }>('/api/market/economy');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Economy</h1>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {error && <p className="text-sm text-red-600">Economic indicators are temporarily unavailable.</p>}

      {data && (
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          {data.indicators.map((indicator) => (
            <div key={indicator.name} className="card">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{indicator.name}</p>
              <p className="mt-1 text-xl font-bold">
                {formatNumber(indicator.value)} <span className="text-sm text-gray-500">{indicator.unit}</span>
              </p>
              {indicator.changePercent !== null && <PriceChange changePercent={indicator.changePercent} />}
              <p className="mt-1 text-xs text-gray-400">as of {formatDate(indicator.asOf)}</p>
            </div>
          ))}
          {data.indicators.length === 0 && (
            <p className="text-sm text-gray-500">No economic indicators available right now.</p>
          )}
        </div>
      )}

      <DisclaimerBox text="Economic data is sourced from free public feeds and may be delayed. Not investment or financial advice." />
    </div>
  );
}
