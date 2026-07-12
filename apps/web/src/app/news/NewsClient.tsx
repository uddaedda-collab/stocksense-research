'use client';

import type { NewsItem } from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { NewsList } from '@/components/ui/NewsList';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

export function NewsClient() {
  const { data, loading, error } = useApi<{ news: NewsItem[] }>('/api/market/news');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Market News</h1>

      <div className="card">
        {loading && <CardSkeleton />}
        {error && <p className="text-sm text-red-600">News is temporarily unavailable.</p>}
        {data && <NewsList news={data.news} />}
      </div>

      <DisclaimerBox text="News headlines are aggregated from public feeds with automated sentiment tagging. Sentiment tags are algorithmic estimates, not professional analysis. Not investment advice." />
    </div>
  );
}
