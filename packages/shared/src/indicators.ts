import type { HistoricalBar, TechnicalIndicatorResult } from './types';

// ---------------------------------------------------------------------------
// All indicator functions are pure and operate on ascending-date-ordered bars.
// They return `null` when there isn't enough history for a reliable value,
// rather than a misleading fabricated number.
// ---------------------------------------------------------------------------

function closes(bars: HistoricalBar[]): number[] {
  return bars.map((b) => b.close);
}

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

export function smaSeries(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i + 1 < period) {
      out.push(null);
      continue;
    }
    const slice = values.slice(i + 1 - period, i + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return out;
}

export function emaSeries(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  if (values.length < period) return values.map(() => null);
  const k = 2 / (period + 1);
  let prevEma: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i + 1 < period) {
      out.push(null);
      continue;
    }
    if (prevEma === null) {
      // seed with SMA of first `period` values
      const seed = values.slice(i + 1 - period, i + 1).reduce((a, b) => a + b, 0) / period;
      prevEma = seed;
      out.push(seed);
      continue;
    }
    prevEma = values[i] * k + prevEma * (1 - k);
    out.push(prevEma);
  }
  return out;
}

export function ema(values: number[], period: number): number | null {
  const series = emaSeries(values, period);
  return series[series.length - 1] ?? null;
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function macd(
  values: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: number | null; signalLine: number | null; histogram: number | null } {
  if (values.length < slowPeriod + signalPeriod) {
    return { macdLine: null, signalLine: null, histogram: null };
  }
  const fastEmaSeries = emaSeries(values, fastPeriod);
  const slowEmaSeries = emaSeries(values, slowPeriod);
  const macdSeries: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const f = fastEmaSeries[i];
    const s = slowEmaSeries[i];
    if (f !== null && s !== null) macdSeries.push(f - s);
  }
  const signalSeries = emaSeries(macdSeries, signalPeriod);
  const macdLine = macdSeries[macdSeries.length - 1] ?? null;
  const signalLine = signalSeries[signalSeries.length - 1] ?? null;
  const histogram = macdLine !== null && signalLine !== null ? macdLine - signalLine : null;
  return { macdLine, signalLine, histogram };
}

export function bollingerBands(
  values: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: number | null; middle: number | null; lower: number | null } {
  if (values.length < period) return { upper: null, middle: null, lower: null };
  const slice = values.slice(values.length - period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: mean + stdDevMultiplier * stdDev,
    middle: mean,
    lower: mean - stdDevMultiplier * stdDev,
  };
}

export function atr(bars: HistoricalBar[], period = 14): number | null {
  if (bars.length < period + 1) return null;
  const trueRanges: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const cur = bars[i];
    const prevClose = bars[i - 1].close;
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prevClose),
      Math.abs(cur.low - prevClose)
    );
    trueRanges.push(tr);
  }
  const relevant = trueRanges.slice(trueRanges.length - period);
  return relevant.reduce((a, b) => a + b, 0) / period;
}

export function adx(bars: HistoricalBar[], period = 14): number | null {
  if (bars.length < period * 2) return null;
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trList: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    const upMove = bars[i].high - bars[i - 1].high;
    const downMove = bars[i - 1].low - bars[i].low;
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    );
    trList.push(tr);
  }

  const smoothedTR = wilderSmooth(trList, period);
  const smoothedPlusDM = wilderSmooth(plusDM, period);
  const smoothedMinusDM = wilderSmooth(minusDM, period);

  const dxValues: number[] = [];
  for (let i = 0; i < smoothedTR.length; i++) {
    const tr = smoothedTR[i];
    if (tr === 0) {
      dxValues.push(0);
      continue;
    }
    const plusDI = (smoothedPlusDM[i] / tr) * 100;
    const minusDI = (smoothedMinusDM[i] / tr) * 100;
    const sum = plusDI + minusDI;
    dxValues.push(sum === 0 ? 0 : (Math.abs(plusDI - minusDI) / sum) * 100);
  }

  if (dxValues.length < period) return null;
  const adxSeries = smaSeries(dxValues, period);
  return adxSeries[adxSeries.length - 1] ?? null;
}

function wilderSmooth(values: number[], period: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      sum += values[i];
      if (i === period - 1) out.push(sum);
      continue;
    }
    const prev = out[out.length - 1];
    const next = prev - prev / period + values[i];
    out.push(next);
  }
  return out;
}

export function vwap(bars: HistoricalBar[]): number | null {
  if (bars.length === 0) return null;
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  for (const bar of bars) {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    cumulativeTPV += typicalPrice * bar.volume;
    cumulativeVolume += bar.volume;
  }
  if (cumulativeVolume === 0) return null;
  return cumulativeTPV / cumulativeVolume;
}

/**
 * Detects support/resistance levels using local swing highs/lows (fractal method).
 * Returns up to 3 nearest support levels (below current price) and 3 resistance
 * levels (above current price), sorted by proximity to the last close.
 */
export function detectSupportResistance(
  bars: HistoricalBar[],
  lookback = 2
): { support: number[]; resistance: number[] } {
  if (bars.length < lookback * 2 + 1) return { support: [], resistance: [] };
  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  for (let i = lookback; i < bars.length - lookback; i++) {
    const window = bars.slice(i - lookback, i + lookback + 1);
    const current = bars[i];
    const isHigh = window.every((b) => b.high <= current.high);
    const isLow = window.every((b) => b.low >= current.low);
    if (isHigh) swingHighs.push(current.high);
    if (isLow) swingLows.push(current.low);
  }

  const lastClose = bars[bars.length - 1].close;
  const support = [...new Set(swingLows)]
    .filter((v) => v < lastClose)
    .sort((a, b) => b - a)
    .slice(0, 3);
  const resistance = [...new Set(swingHighs)]
    .filter((v) => v > lastClose)
    .sort((a, b) => a - b)
    .slice(0, 3);

  return { support, resistance };
}

export function determineTrend(values: number[]): 'uptrend' | 'downtrend' | 'sideways' {
  const sma20Val = sma(values, 20);
  const sma50Val = sma(values, 50);
  const last = values[values.length - 1];
  if (sma20Val === null || sma50Val === null) return 'sideways';
  const diffPercent = ((sma20Val - sma50Val) / sma50Val) * 100;
  if (diffPercent > 1.5 && last >= sma20Val) return 'uptrend';
  if (diffPercent < -1.5 && last <= sma20Val) return 'downtrend';
  return 'sideways';
}

export function determineMomentum(rsiValue: number | null, adxValue: number | null): 'strong' | 'moderate' | 'weak' {
  if (adxValue === null) return 'weak';
  if (adxValue >= 40) return 'strong';
  if (adxValue >= 20) return 'moderate';
  return 'weak';
}

/**
 * Computes the full technical indicator suite for a stock from its historical bars.
 * Bars MUST be sorted ascending by date.
 */
export function computeTechnicalIndicators(bars: HistoricalBar[]): TechnicalIndicatorResult {
  const closeValues = closes(bars);
  const macdResult = macd(closeValues);
  const bb = bollingerBands(closeValues);
  const rsiValue = rsi(closeValues);
  const adxValue = adx(bars);
  const { support, resistance } = detectSupportResistance(bars);

  return {
    sma20: sma(closeValues, 20),
    sma50: sma(closeValues, 50),
    sma200: sma(closeValues, 200),
    ema12: ema(closeValues, 12),
    ema26: ema(closeValues, 26),
    rsi14: rsiValue,
    macd: macdResult,
    bollinger: bb,
    atr14: atr(bars),
    adx14: adxValue,
    vwap: vwap(bars.slice(-1)), // session VWAP uses most recent bar; for daily bars this approximates typical price
    support,
    resistance,
    trend: determineTrend(closeValues),
    momentum: determineMomentum(rsiValue, adxValue),
  };
}
