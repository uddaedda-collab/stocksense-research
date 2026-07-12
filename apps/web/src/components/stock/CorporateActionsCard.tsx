import type { CorporateActions } from '@platform/shared';
import { formatDate } from '@/lib/format';

export function CorporateActionsCard({ data }: { data: CorporateActions }) {
  const hasAny = data.dividends.length > 0 || data.splits.length > 0;

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Corporate Actions</h3>
      {!hasAny && <p className="text-sm text-gray-500">No dividend or split history found in the last 10 years.</p>}

      {data.dividends.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Dividend History</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="py-1 pr-3">Date</th>
                  <th className="py-1 pr-3">Amount per Share</th>
                </tr>
              </thead>
              <tbody>
                {data.dividends.slice(0, 10).map((d, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-1 pr-3">{formatDate(d.date)}</td>
                    <td className="py-1 pr-3">₹{d.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.splits.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Stock Splits / Bonus</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="py-1 pr-3">Date</th>
                  <th className="py-1 pr-3">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {data.splits.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-1 pr-3">{formatDate(s.date)}</td>
                    <td className="py-1 pr-3">{s.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
