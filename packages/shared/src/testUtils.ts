import type { HistoricalBar } from './types';

/**
 * Generates synthetic OHLCV bars for testing indicator/prediction math.
 * `trend` is the average daily drift added on top of randomized noise.
 */
export function generateSyntheticBars(
  count: number,
  startPrice = 100,
  trend = 0,
  seed = 42
): HistoricalBar[] {
  let rngState = seed;
  const rand = () => {
    // simple deterministic LCG for reproducible tests
    rngState = (rngState * 1103515245 + 12345) % 2147483648;
    return rngState / 2147483648;
  };

  const bars: HistoricalBar[] = [];
  let price = startPrice;
  const baseDate = new Date('2024-01-01T00:00:00Z');

  for (let i = 0; i < count; i++) {
    const noise = (rand() - 0.5) * 2; // -1..1
    price = Math.max(1, price + trend + noise);
    const open = price - noise * 0.5;
    const high = Math.max(open, price) + Math.abs(noise);
    const low = Math.min(open, price) - Math.abs(noise);
    const volume = Math.round(100000 + rand() * 900000);
    const date = new Date(baseDate.getTime() + i * 86400000);
    bars.push({
      date: date.toISOString().slice(0, 10),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(price.toFixed(2)),
      volume,
    });
  }
  return bars;
}
