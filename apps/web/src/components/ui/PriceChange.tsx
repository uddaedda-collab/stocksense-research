import { formatPercent } from '@/lib/format';

export function PriceChange({ changePercent }: { changePercent: number }) {
  const isGain = changePercent >= 0;
  return (
    <span className={isGain ? 'badge-gain' : 'badge-loss'}>
      {isGain ? '▲' : '▼'} {formatPercent(changePercent)}
    </span>
  );
}
