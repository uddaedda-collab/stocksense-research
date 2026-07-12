import type { NewsItem } from '@platform/shared';
import { formatDate } from '@/lib/format';

const SENTIMENT_BADGE: Record<string, string> = {
  positive: 'badge-gain',
  negative: 'badge-loss',
  neutral: 'inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export function NewsList({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return <p className="text-sm text-gray-500">No recent news found.</p>;
  }
  return (
    <ul className="space-y-3">
      {news.map((item, i) => (
        <li key={i} className="border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-brand-600"
          >
            {item.title}
          </a>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{item.source}</span>
            <span>·</span>
            <span>{formatDate(item.publishedAt)}</span>
            <span className={SENTIMENT_BADGE[item.sentiment]}>{item.sentiment}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
