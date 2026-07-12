import { describe, expect, it } from 'vitest';
import { calculateDCF, estimateIntrinsicValue, valuationLabel } from './valuation';

describe('calculateDCF', () => {
  it('produces a positive intrinsic value for positive inputs', () => {
    const result = calculateDCF({
      freeCashFlowPerShare: 10,
      growthRatePercent: 8,
      terminalGrowthPercent: 4,
      discountRatePercent: 12,
    });
    expect(result.intrinsicValuePerShare).toBeGreaterThan(0);
    expect(result.projectedCashFlows).toHaveLength(5);
  });

  it('increases intrinsic value with higher growth assumptions', () => {
    const low = calculateDCF({
      freeCashFlowPerShare: 10,
      growthRatePercent: 5,
      terminalGrowthPercent: 3,
      discountRatePercent: 12,
    });
    const high = calculateDCF({
      freeCashFlowPerShare: 10,
      growthRatePercent: 15,
      terminalGrowthPercent: 3,
      discountRatePercent: 12,
    });
    expect(high.intrinsicValuePerShare).toBeGreaterThan(low.intrinsicValuePerShare);
  });
});

describe('estimateIntrinsicValue', () => {
  it('returns null for null or non-positive EPS', () => {
    expect(estimateIntrinsicValue(null, 10)).toBeNull();
    expect(estimateIntrinsicValue(0, 10)).toBeNull();
    expect(estimateIntrinsicValue(-5, 10)).toBeNull();
  });

  it('returns a positive number for valid EPS', () => {
    const value = estimateIntrinsicValue(25, 12);
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThan(0);
  });
});

describe('valuationLabel', () => {
  it('returns unknown when inputs are missing', () => {
    expect(valuationLabel(null, 100)).toBe('unknown');
    expect(valuationLabel(100, null)).toBe('unknown');
  });

  it('labels undervalued when price well below intrinsic value', () => {
    expect(valuationLabel(70, 100)).toBe('undervalued');
  });

  it('labels overvalued when price well above intrinsic value', () => {
    expect(valuationLabel(130, 100)).toBe('overvalued');
  });

  it('labels fairly valued when price is close to intrinsic value', () => {
    expect(valuationLabel(100, 100)).toBe('fairly valued');
  });
});
