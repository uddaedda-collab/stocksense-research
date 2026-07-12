import { describe, expect, it } from 'vitest';
import { formatCompactNumber, formatDate, formatINR, formatNumber, formatPercent } from './format';

describe('formatINR', () => {
  it('formats a positive number as INR currency', () => {
    expect(formatINR(1234.5)).toBe('₹1,234.50');
  });

  it('returns em dash for null/undefined/NaN', () => {
    expect(formatINR(null)).toBe('—');
    expect(formatINR(undefined)).toBe('—');
    expect(formatINR(NaN)).toBe('—');
  });

  it('respects the decimals parameter', () => {
    expect(formatINR(1000, 0)).toBe('₹1,000');
  });
});

describe('formatNumber', () => {
  it('formats numbers with Indian grouping', () => {
    expect(formatNumber(1234567.891, 2)).toBe('12,34,567.89');
  });

  it('returns em dash for missing values', () => {
    expect(formatNumber(null)).toBe('—');
  });
});

describe('formatCompactNumber', () => {
  it('formats large market caps in crores', () => {
    expect(formatCompactNumber(1_500_000_000)).toBe('₹150 Cr');
  });

  it('formats trillions', () => {
    expect(formatCompactNumber(2_000_000_000_000)).toBe('₹2.00T');
  });

  it('returns em dash for null', () => {
    expect(formatCompactNumber(null)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('adds a plus sign for positive values', () => {
    expect(formatPercent(5.25)).toBe('+5.25%');
  });

  it('does not add a plus sign for negative values', () => {
    expect(formatPercent(-3.1)).toBe('-3.10%');
  });

  it('returns em dash for null', () => {
    expect(formatPercent(null)).toBe('—');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-01-15T00:00:00.000Z')).toBe('15 Jan 2026');
  });

  it('returns em dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});
