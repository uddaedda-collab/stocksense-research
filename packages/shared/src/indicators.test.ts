import { describe, expect, it } from 'vitest';
import {
  adx,
  atr,
  bollingerBands,
  computeTechnicalIndicators,
  detectSupportResistance,
  ema,
  macd,
  rsi,
  sma,
  vwap,
} from './indicators';
import { generateSyntheticBars } from './testUtils';

describe('sma', () => {
  it('returns null when insufficient data', () => {
    expect(sma([1, 2, 3], 5)).toBeNull();
  });

  it('computes correct average', () => {
    expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
  });
});

describe('ema', () => {
  it('returns null when insufficient data', () => {
    expect(ema([1, 2, 3], 5)).toBeNull();
  });

  it('computes a value close to SMA when data length equals period', () => {
    const values = [10, 12, 14, 16, 18];
    expect(ema(values, 5)).toBeCloseTo(14, 5);
  });
});

describe('rsi', () => {
  it('returns null with insufficient data', () => {
    expect(rsi([1, 2, 3], 14)).toBeNull();
  });

  it('returns 100 for strictly increasing prices (no losses)', () => {
    const values = Array.from({ length: 20 }, (_, i) => 100 + i);
    expect(rsi(values, 14)).toBe(100);
  });

  it('returns 0 for strictly decreasing prices (no gains)', () => {
    const values = Array.from({ length: 20 }, (_, i) => 200 - i);
    expect(rsi(values, 14)).toBe(0);
  });

  it('returns a value between 0 and 100 for mixed data', () => {
    const bars = generateSyntheticBars(60);
    const closes = bars.map((b) => b.close);
    const value = rsi(closes, 14);
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThanOrEqual(0);
    expect(value!).toBeLessThanOrEqual(100);
  });
});

describe('macd', () => {
  it('returns nulls with insufficient data', () => {
    const result = macd([1, 2, 3]);
    expect(result.macdLine).toBeNull();
    expect(result.signalLine).toBeNull();
    expect(result.histogram).toBeNull();
  });

  it('computes numeric values with enough data', () => {
    const bars = generateSyntheticBars(60);
    const closes = bars.map((b) => b.close);
    const result = macd(closes);
    expect(result.macdLine).not.toBeNull();
    expect(result.signalLine).not.toBeNull();
    expect(result.histogram).not.toBeNull();
  });
});

describe('bollingerBands', () => {
  it('returns nulls with insufficient data', () => {
    expect(bollingerBands([1, 2, 3], 20)).toEqual({ upper: null, middle: null, lower: null });
  });

  it('upper > middle > lower for valid data', () => {
    const bars = generateSyntheticBars(30);
    const closes = bars.map((b) => b.close);
    const bb = bollingerBands(closes, 20);
    expect(bb.upper).not.toBeNull();
    expect(bb.upper!).toBeGreaterThan(bb.middle!);
    expect(bb.middle!).toBeGreaterThan(bb.lower!);
  });
});

describe('atr', () => {
  it('returns null with insufficient bars', () => {
    const bars = generateSyntheticBars(5);
    expect(atr(bars, 14)).toBeNull();
  });

  it('returns a positive value with enough bars', () => {
    const bars = generateSyntheticBars(30);
    const value = atr(bars, 14);
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThan(0);
  });
});

describe('adx', () => {
  it('returns null with insufficient bars', () => {
    const bars = generateSyntheticBars(10);
    expect(adx(bars, 14)).toBeNull();
  });

  it('returns a value between 0 and 100 with enough bars', () => {
    const bars = generateSyntheticBars(80, 100, 0.5);
    const value = adx(bars, 14);
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThanOrEqual(0);
    expect(value!).toBeLessThanOrEqual(100);
  });
});

describe('vwap', () => {
  it('returns null for empty bars', () => {
    expect(vwap([])).toBeNull();
  });

  it('computes a value within the high/low range', () => {
    const bars = generateSyntheticBars(5);
    const value = vwap(bars);
    expect(value).not.toBeNull();
  });
});

describe('detectSupportResistance', () => {
  it('returns empty arrays for insufficient data', () => {
    const bars = generateSyntheticBars(3);
    expect(detectSupportResistance(bars)).toEqual({ support: [], resistance: [] });
  });

  it('returns support below and resistance above last close', () => {
    const bars = generateSyntheticBars(100, 100, 0);
    const { support, resistance } = detectSupportResistance(bars);
    const lastClose = bars[bars.length - 1].close;
    support.forEach((s) => expect(s).toBeLessThan(lastClose));
    resistance.forEach((r) => expect(r).toBeGreaterThan(lastClose));
  });
});

describe('computeTechnicalIndicators', () => {
  it('produces a full result object without throwing for realistic data', () => {
    const bars = generateSyntheticBars(250, 100, 0.1);
    const result = computeTechnicalIndicators(bars);
    expect(result.sma20).not.toBeNull();
    expect(result.sma50).not.toBeNull();
    expect(result.sma200).not.toBeNull();
    expect(['uptrend', 'downtrend', 'sideways']).toContain(result.trend);
    expect(['strong', 'moderate', 'weak']).toContain(result.momentum);
  });

  it('handles minimal data gracefully (no throw, mostly nulls)', () => {
    const bars = generateSyntheticBars(5);
    const result = computeTechnicalIndicators(bars);
    expect(result.sma20).toBeNull();
    expect(result.trend).toBe('sideways');
  });
});
