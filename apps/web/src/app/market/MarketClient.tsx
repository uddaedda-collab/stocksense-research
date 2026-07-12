'use client';

import type { IndexQuote } from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { formatNumber } from '@/lib/format';
import { PriceChange } from '@/components/ui/PriceChange';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { IndexTicker } from '@/components/widgets/IndexTicker';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface Breadth {
  advancing: number;
  declining: number;
  unchanged: number;
  total: number;
}

export function MarketClient() {
  const { data: sectorData, loading: sectorLoading } = useApi<{ indices: IndexQuote[] }>('/api/market/sector-indices');
  const { data: breadth, loading: breadthLoading } = useApi<Breadth>('/api/market/breadth');
  const { data: globalData, loading: globalLoading } = useApi<{ markets: IndexQuote[] }>('/api/market/global');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market Overview</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Key Indices</h2>
        <IndexTicker />
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Market Breadth</h2>
        {breadthLoading || !breadth ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{breadth.advancing}</p>
              <p className="text-xs text-gray-500">Advancing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{breadth.declining}</p>
              <p className="text-xs text-gray-500">Declining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">{breadth.unchanged}</p>
              <p className="text-xs text-gray-500">Unchanged</p>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Sector Indices</h2>
        {sectorLoading || !sectorData ? (
          <CardSkeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {sectorData.indices.map((idx) => (
              <div key={idx.symbol} className="card">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{idx.name}</p>
                <p className="mt-1 text-lg font-bold">{formatNumber(idx.value)}</p>
                <PriceChange changePercent={idx.changePercent} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Global Markets</h2>
        {globalLoading || !globalData ? (
          <CardSkeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {globalData.markets.map((idx) => (
              <div key={idx.symbol} className="card">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{idx.name}</p>
                <p className="mt-1 text-lg font-bold">{formatNumber(idx.value)}</p>
                <PriceChange changePercent={idx.changePercent} />
              </div>
            ))}
          </div>
        )}
      </section>

      <DisclaimerBox text="All market data shown is delayed and sourced from free public feeds. Not investment advice." />
    </div>
  );
}
