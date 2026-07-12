'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MarketMovers } from '@platform/shared';
import { useApi } from '@/lib/useApi';
import { IndexTicker } from '@/components/widgets/IndexTicker';
import { MoversList } from '@/components/widgets/MoversList';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { getRecentlyViewed } from '@/lib/recentlyViewed';

export default function DashboardPage() {
  const { data: movers, loading } = useApi<MarketMovers>('/api/market/movers');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentlyViewed());
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-3 text-2xl font-bold">Market Overview</h1>
        <IndexTicker />
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Recently Viewed</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((symbol) => (
              <Link
                key={symbol}
                href={`/stock/${symbol}`}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {symbol}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Market Movers</h2>
        {loading || !movers ? (
          <div className="grid gap-4 md:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <MoversList title="Top Gainers" quotes={movers.topGainers} />
            <MoversList title="Top Losers" quotes={movers.topLosers} />
            <MoversList title="Most Active (Volume)" quotes={movers.mostActive} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">52-Week Levels</h2>
        {loading || !movers ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <MoversList title="Near 52-Week High" quotes={movers.near52WeekHigh} />
            <MoversList title="Near 52-Week Low" quotes={movers.near52WeekLow} />
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { href: '/screener', label: 'Screener', icon: '🔍', desc: 'Filter stocks by fundamentals & technicals' },
          { href: '/compare', label: 'Compare Stocks', icon: '⚖️', desc: 'Compare up to 5 stocks side by side' },
          { href: '/calculators', label: 'Calculators', icon: '🧮', desc: 'SIP, EMI, SWP, and more' },
          { href: '/chatbot', label: 'AI Chatbot', icon: '🤖', desc: 'Ask about ratios, charts, and risk' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-animated hover:border-brand-500">
            <div className="text-2xl">{item.icon}</div>
            <p className="mt-2 font-semibold">{item.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </section>

      <DisclaimerBox text="All data shown is delayed and sourced from free public feeds. This platform is an independent educational research tool, not a SEBI-registered investment adviser." />
    </div>
  );
}
