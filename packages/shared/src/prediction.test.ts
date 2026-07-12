import { describe, expect, it } from 'vitest';
import { generateAllHorizonPredictions, generatePrediction } from './prediction';
import { generateSyntheticBars } from './testUtils';

describe('generatePrediction', () => {
  it('returns a low-confidence sideways result with insufficient data', () => {
    const bars = generateSyntheticBars(10);
    const result = generatePrediction(bars, 'short');
    expect(result.direction).toBe('sideways');
    expect(result.confidencePercent).toBeLessThan(20);
    expect(result.disclaimer).toContain('probabilistic');
  });

  it('never reports probabilityScore above 90 (never claims certainty)', () => {
    const bars = generateSyntheticBars(250, 100, 2); // strong uptrend
    for (const horizon of ['short', 'medium', 'long'] as const) {
      const result = generatePrediction(bars, horizon);
      expect(result.probabilityScore).toBeLessThanOrEqual(90);
      expect(result.probabilityScore).toBeGreaterThanOrEqual(50);
    }
  });

  it('leans bullish for a strong sustained uptrend', () => {
    const bars = generateSyntheticBars(250, 100, 1.5);
    const result = generatePrediction(bars, 'medium');
    expect(result.direction).toBe('bullish');
  });

  it('leans bearish for a strong sustained downtrend', () => {
    const bars = generateSyntheticBars(250, 500, -1.5);
    const result = generatePrediction(bars, 'medium');
    expect(result.direction).toBe('bearish');
  });

  it('always includes the prediction disclaimer', () => {
    const bars = generateSyntheticBars(100);
    const result = generatePrediction(bars, 'short');
    expect(result.disclaimer.length).toBeGreaterThan(0);
  });

  it('generateAllHorizonPredictions returns exactly 3 horizons', () => {
    const bars = generateSyntheticBars(250, 100, 0.3);
    const results = generateAllHorizonPredictions(bars);
    expect(results.map((r) => r.horizon)).toEqual(['short', 'medium', 'long']);
  });
});
