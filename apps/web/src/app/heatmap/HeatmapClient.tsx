'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/useApi';
import { formatCompactNumber } from '@/lib/format';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface HeatmapCell {
  symbol: string;
  name: string;
  changePercent: number;
  marketCap: number | null;
  price: number;
}

function colorFor(changePercent: number): string {
  if (changePercent >= 3) return 'bg-green-700 text-white';
  if (changePercent >= 1.5) return 'bg-green-600 text-white';
  if (changePercent >= 0.3) return 'bg-green-400 text-green-950';
  if (changePercent > -0.3) return 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  if (changePercent > -1.5) return 'bg-red-400 text-red-950';
  if (changePercent > -3) return 'bg-red-600 text-white';
  return 'bg-red-700 text-white';
}

export function HeatmapClient() {
  const { data, loading, error } = useApi<{ cells: HeatmapCell[] }>('/api/market/heatmap');

  const sortedCells = useMemo(() => {
    if (!data) return [];
    return [...data.cells].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market Heatmap</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tile size reflects relative market capitalization; color reflects today&apos;s price change.
      </p>

      {loading && <CardSkeleton />}
      {error && <p className="text-sm text-red-600">Heatmap data is temporarily unavailable.</p>}

      {data && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {sortedCells.map((cell) => (
            <Link
              key={cell.symbol}
              href={`/stock/${cell.symbol}`}
              className={`flex flex-col justify-between rounded-lg p-3 text-xs font-medium transition hover:opacity-90 ${colorFor(
                cell.changePercent
              )}`}
              style={{ minHeight: '80px' }}
            >
              <span className="font-bold">{cell.symbol}</span>
              <span>{cell.changePercent >= 0 ? '+' : ''}{cell.changePercent.toFixed(2)}%</span>
              <span className="text-[10px] opacity-80">{formatCompactNumber(cell.marketCap)}</span>
            </Link>
          ))}
        </div>
      )}

      <DisclaimerBox text="Heatmap reflects delayed free market data. Not investment advice." />
    </div>
  );
}
