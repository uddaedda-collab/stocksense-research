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

interface HorizonView {
  horizon: 'short' | 'medium' | 'long';
  direction: 'bullish' | 'bearish' | 'sideways';
  probabilityScore: number;
  confidencePercent: number;
  niftyView: { direction: string; probabilityScore: number };
  sensexView: { direction: string; probabilityScore: number };
  factors: string[];
}

interface MarketDirection {
  asOf: string;
  preMarketBias: 'positive' | 'negative' | 'neutral';
  preMarketAvgGlobalChangePercent: number;
  preMarketNote: string;
  horizons: HorizonView[];
  disclaimer: string;
}

const HORIZON_LABELS: Record<string, string> = {
  short: 'Short Term (days-2 weeks)',
  medium: 'Medium Term (1-3 months)',
  long: 'Long Term (6-12 months)',
};

const DIRECTION_COLOR: Record<string, string> = {
  bullish: 'text-green-600',
  bearish: 'text-red-600',
  sideways: 'text-amber-600',
};

const BIAS_COLOR: Record<string, string> = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-500',
};

export function MarketClient() {
  const { data: sectorData, loading: sectorLoading } = useApi<{ indices: IndexQuote[] }>('/api/market/sector-indices');
  const { data: breadth, loading: breadthLoading } = useApi<Breadth>('/api/market/breadth');
  const { data: globalData, loading: globalLoading } = useApi<{ markets: IndexQuote[] }>('/api/market/global');
  const { data: direction, loading: directionLoading, error: directionError } = useApi<MarketDirection>(
    '/api/market/direction'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market Overview</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Key Indices</h2>
        <IndexTicker />
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Market Direction Outlook</h2>
          {direction && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Pre-market bias:{' '}
              <span className={`font-semibold capitalize ${BIAS_COLOR[direction.preMarketBias]}`}>
                {direction.preMarketBias}
              </span>
            </span>
          )}
        </div>

        {directionLoading && <CardSkeleton />}
        {directionError && <p className="text-sm text-red-600">Market direction outlook is temporarily unavailable.</p>}

        {direction && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">{direction.preMarketNote}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {direction.horizons.map((h) => (
                <div key={h.horizon} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{HORIZON_LABELS[h.horizon]}</p>
                  <p className={`mt-1 text-xl font-bold capitalize ${DIRECTION_COLOR[h.direction]}`}>{h.direction}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Probability lean: {h.probabilityScore}% · Confidence: {h.confidencePercent}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    NIFTY: <span className="capitalize">{h.niftyView.direction}</span> ({h.niftyView.probabilityScore}%) ·
                    {' '}SENSEX: <span className="capitalize">{h.sensexView.direction}</span> ({h.sensexView.probabilityScore}%)
                  </p>
                  {h.factors.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-xs text-gray-600 dark:text-gray-300">
                      {h.factors.slice(0, 3).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <DisclaimerBox text={direction.disclaimer} />
          </>
        )}
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
