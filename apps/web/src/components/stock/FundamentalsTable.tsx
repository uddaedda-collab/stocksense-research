import type { FundamentalSnapshot } from '@platform/shared';
import { formatCompactNumber, formatNumber, formatPercent } from '@/lib/format';

export function FundamentalsTable({ data }: { data: FundamentalSnapshot }) {
  const rows: [string, string][] = [
    ['Market Cap', formatCompactNumber(data.marketCap)],
    ['P/E Ratio', formatNumber(data.peRatio)],
    ['P/B Ratio', formatNumber(data.pbRatio)],
    ['EPS', data.eps !== null ? `₹${formatNumber(data.eps)}` : '—'],
    ['Dividend Yield', formatPercent(data.dividendYield)],
    ['ROE', formatPercent(data.roe)],
    ['ROCE', formatPercent(data.roce)],
    ['Debt to Equity', formatNumber(data.debtToEquity)],
    ['Book Value', data.bookValue !== null ? `₹${formatNumber(data.bookValue)}` : '—'],
    ['Sector', data.sector ?? '—'],
    ['Industry', data.industry ?? '—'],
  ];

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Key Fundamentals</h3>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
