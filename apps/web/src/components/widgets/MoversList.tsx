'use client';

import Link from 'next/link';
import type { Quote } from '@platform/shared';
import { formatINR } from '@/lib/format';
import { PriceChange } from '@/components/ui/PriceChange';

export function MoversList({ title, quotes }: { title: string; quotes: Quote[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {quotes.slice(0, 6).map((q) => (
          <li key={q.symbol} className="flex items-center justify-between py-2">
            <Link href={`/stock/${q.displaySymbol}`} className="text-sm font-medium hover:text-brand-600">
              {q.displaySymbol}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{formatINR(q.price)}</span>
              <PriceChange changePercent={q.changePercent} />
            </div>
          </li>
        ))}
        {quotes.length === 0 && <li className="py-2 text-sm text-gray-500">No data available.</li>}
      </ul>
    </div>
  );
}
