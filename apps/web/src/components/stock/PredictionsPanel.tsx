import type { PredictionResult } from '@platform/shared';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

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

export function PredictionsPanel({ predictions }: { predictions: PredictionResult[] }) {
  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">AI Predictions (Probabilistic)</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {predictions.map((p) => (
          <div key={p.horizon} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{HORIZON_LABELS[p.horizon]}</p>
            <p className={`mt-1 text-xl font-bold capitalize ${DIRECTION_COLOR[p.direction]}`}>{p.direction}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Probability lean: {p.probabilityScore}% · Confidence: {p.confidencePercent}%
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{p.explanation}</p>
            {p.factors.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-gray-600 dark:text-gray-300">
                {p.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <DisclaimerBox text={predictions[0]?.disclaimer ?? 'These predictions are probabilistic estimates, not guarantees.'} />
    </div>
  );
}
