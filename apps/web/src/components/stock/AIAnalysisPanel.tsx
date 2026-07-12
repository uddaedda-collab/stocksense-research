import type { AIAnalysis } from '@platform/shared';
import { formatINR } from '@/lib/format';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

export function AIAnalysisPanel({ data }: { data: AIAnalysis }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AI Analysis</h3>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          Overall Rating: {data.overallRating}/5
        </span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300">{data.summary}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreBadge label="Financial Health" score={data.financialHealthScore} />
        <ScoreBadge label="Growth" score={data.growthScore} />
        <ScoreBadge label="Risk" score={data.riskAnalysis.riskScore} inverse />
        <ScoreBadge label="Sentiment" score={(data.sentimentScore + 100) / 2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-sm font-semibold text-green-700 dark:text-green-400">Strengths</h4>
          <ul className="list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
            {data.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">Weaknesses</h4>
          <ul className="list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
            {data.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="mb-1 text-sm font-semibold">Moat Analysis</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{data.moatAnalysis}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <p>
          Valuation: <span className="font-semibold capitalize">{data.valuationLabel}</span>
        </p>
        <p>
          Technical Trend: <span className="font-semibold capitalize">{data.technicalTrendLabel}</span>
        </p>
        {data.intrinsicValueEstimate !== null && (
          <p className="col-span-2">
            Estimated Intrinsic Value (simplified DCF): <span className="font-semibold">{formatINR(data.intrinsicValueEstimate)}</span>
          </p>
        )}
      </div>

      <DisclaimerBox text={data.disclaimer} />
    </div>
  );
}

function ScoreBadge({ label, score, inverse = false }: { label: string; score: number; inverse?: boolean }) {
  const effective = inverse ? 100 - score : score;
  const color = effective >= 65 ? 'text-green-600' : effective >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{Math.round(score)}</p>
    </div>
  );
}
