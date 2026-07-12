'use client';

import { useEffect } from 'react';
import type {
  AIAnalysis,
  CompanyProfile,
  FundamentalSnapshot,
  HistoricalBar,
  NewsItem,
  PredictionResult,
  Quote,
  TechnicalIndicatorResult,
} from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { formatDate, formatINR } from '@/lib/format';
import { addRecentlyViewed } from '@/lib/recentlyViewed';
import { LightweightChart } from '@/components/charts/LightweightChart';
import { CompanyProfileCard } from '@/components/stock/CompanyProfileCard';
import { FundamentalsTable } from '@/components/stock/FundamentalsTable';
import { TechnicalsPanel } from '@/components/stock/TechnicalsPanel';
import { PredictionsPanel } from '@/components/stock/PredictionsPanel';
import { AIAnalysisPanel } from '@/components/stock/AIAnalysisPanel';
import { WatchlistButton } from '@/components/stock/WatchlistButton';
import { PriceChange } from '@/components/ui/PriceChange';
import { NewsList } from '@/components/ui/NewsList';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface HistoryResponse {
  symbol: string;
  range: string;
  interval: string;
  bars: HistoricalBar[];
}

export function StockDetailClient({ symbol }: { symbol: string }) {
  useEffect(() => {
    addRecentlyViewed(symbol);
  }, [symbol]);

  const { data: quote, loading: quoteLoading, error: quoteError } = useApi<Quote>(`/api/stocks/${symbol}/quote`);
  const { data: profile } = useApi<CompanyProfile>(`/api/stocks/${symbol}/profile`);
  const { data: fundamentals } = useApi<FundamentalSnapshot>(`/api/stocks/${symbol}/fundamentals`);
  const { data: history } = useApi<HistoryResponse>(`/api/stocks/${symbol}/history?range=2y&interval=1d`);
  const { data: technicals } = useApi<TechnicalIndicatorResult>(`/api/stocks/${symbol}/technicals`);
  const { data: predictionsRes } = useApi<{ symbol: string; predictions: PredictionResult[] }>(
    `/api/stocks/${symbol}/predictions`
  );
  const { data: aiAnalysis } = useApi<AIAnalysis>(`/api/stocks/${symbol}/ai-analysis`);
  const { data: newsRes } = useApi<{ news: NewsItem[] }>(`/api/stocks/${symbol}/news`);

  if (quoteError) {
    return (
      <div className="card">
        <p className="text-sm text-red-600">
          Could not load data for &quot;{symbol}&quot;. It may not be a supported NSE/BSE symbol, or the free data
          source is temporarily unavailable. ({quoteError})
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card">
        {quoteLoading || !quote ? (
          <CardSkeleton />
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {quote.name} <span className="text-gray-400">({quote.displaySymbol})</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {quote.exchange} · As of {formatDate(quote.asOf)} · Delayed data
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatINR(quote.price)}</span>
                <PriceChange changePercent={quote.changePercent} />
              </div>
            </div>
            <WatchlistButton symbol={quote.displaySymbol} />
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Price Chart (2 Years)</h2>
        {history ? <LightweightChart bars={history.bars} /> : <CardSkeleton />}
      </section>

      {profile ? <CompanyProfileCard profile={profile} /> : <CardSkeleton />}
      {fundamentals ? <FundamentalsTable data={fundamentals} /> : <CardSkeleton />}
      {technicals ? <TechnicalsPanel data={technicals} /> : <CardSkeleton />}
      {predictionsRes ? <PredictionsPanel predictions={predictionsRes.predictions} /> : <CardSkeleton />}
      {aiAnalysis ? <AIAnalysisPanel data={aiAnalysis} /> : <CardSkeleton />}

      <section className="card">
        <h2 className="mb-3 font-semibold">Recent News</h2>
        {newsRes ? <NewsList news={newsRes.news} /> : <CardSkeleton />}
      </section>

      <DisclaimerBox text="All figures on this page are estimates from free, delayed public data sources and automated analysis. This is not investment advice." />
    </div>
  );
}
