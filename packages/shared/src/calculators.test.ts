import { describe, expect, it } from 'vitest';
import {
  calculateBrokerage,
  calculateCompoundInterest,
  calculateEMI,
  calculateLumpsum,
  calculateRetirement,
  calculateSIP,
  calculateSWP,
} from './calculators';

describe('calculateSIP', () => {
  it('grows total value above invested amount for positive returns', () => {
    const result = calculateSIP(5000, 12, 10);
    expect(result.investedAmount).toBe(600000);
    expect(result.totalValue).toBeGreaterThan(result.investedAmount);
    expect(result.monthlyBreakdown).toHaveLength(120);
  });

  it('equals invested amount for zero return', () => {
    const result = calculateSIP(1000, 0, 1);
    expect(result.totalValue).toBeCloseTo(result.investedAmount, 1);
  });
});

describe('calculateLumpsum', () => {
  it('computes compounded growth correctly', () => {
    const result = calculateLumpsum(100000, 10, 1);
    expect(result.totalValue).toBeCloseTo(110000, 1);
  });
});

describe('calculateBrokerage', () => {
  it('computes zero brokerage for delivery trades (discount broker model)', () => {
    const result = calculateBrokerage(100, 110, 10, 'delivery');
    expect(result.brokerage).toBe(0);
    expect(result.totalCharges).toBeGreaterThan(0);
  });

  it('computes nonzero brokerage for intraday trades', () => {
    const result = calculateBrokerage(100, 105, 100, 'intraday');
    expect(result.brokerage).toBeGreaterThan(0);
  });

  it('net amount reflects gross P&L minus charges', () => {
    const result = calculateBrokerage(100, 120, 10, 'delivery');
    const grossPnl = (120 - 100) * 10;
    expect(result.netAmount).toBeLessThan(grossPnl);
  });
});

describe('calculateCompoundInterest', () => {
  it('matches simple annual compounding formula', () => {
    const result = calculateCompoundInterest(10000, 10, 2, 1);
    expect(result.totalValue).toBeCloseTo(12100, 1);
  });
});

describe('calculateRetirement', () => {
  it('produces a positive corpus requirement and projected corpus', () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 60,
      monthlyExpensesToday: 50000,
      inflationPercent: 6,
      postRetirementYears: 25,
      expectedReturnPercent: 12,
      currentSavings: 500000,
      monthlyInvestment: 15000,
    });
    expect(result.totalCorpusRequired).toBeGreaterThan(0);
    expect(result.projectedCorpus).toBeGreaterThan(0);
  });
});

describe('calculateSWP', () => {
  it('depletes corpus and reports the depletion month when withdrawals exceed growth', () => {
    const result = calculateSWP(100000, 20000, 6, 5);
    expect(result.corpusDepletedAtMonth).not.toBeNull();
    expect(result.finalCorpus).toBe(0);
  });

  it('sustains corpus when withdrawals are modest relative to returns', () => {
    const result = calculateSWP(10000000, 10000, 10, 5);
    expect(result.corpusDepletedAtMonth).toBeNull();
    expect(result.finalCorpus).toBeGreaterThan(0);
  });
});

describe('calculateEMI', () => {
  it('computes a positive EMI and fully amortizes the loan to zero balance', () => {
    const result = calculateEMI(1000000, 8.5, 20);
    expect(result.emi).toBeGreaterThan(0);
    expect(result.amortization).toHaveLength(240);
    expect(result.amortization[result.amortization.length - 1].balance).toBeCloseTo(0, 1);
  });

  it('handles zero interest rate correctly', () => {
    const result = calculateEMI(120000, 0, 1);
    expect(result.emi).toBeCloseTo(10000, 1);
  });
});
