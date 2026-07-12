// Simplified DCF / intrinsic value estimation using free-cash-flow proxy.
// This is a simplified educational model, not a professional valuation.
// It deliberately uses conservative, transparent assumptions.

export interface DCFInputs {
  freeCashFlowPerShare: number; // latest FCF/share (approximate, from EPS if FCF unavailable)
  growthRatePercent: number; // expected annual growth for next 5 years
  terminalGrowthPercent: number; // perpetual growth rate after year 5
  discountRatePercent: number; // required rate of return / WACC proxy
  projectionYears?: number;
}

export interface DCFResult {
  intrinsicValuePerShare: number;
  projectedCashFlows: number[];
  terminalValue: number;
  assumptions: DCFInputs;
}

export function calculateDCF(inputs: DCFInputs): DCFResult {
  const years = inputs.projectionYears ?? 5;
  const growth = inputs.growthRatePercent / 100;
  const terminalGrowth = inputs.terminalGrowthPercent / 100;
  const discountRate = inputs.discountRatePercent / 100;

  const projectedCashFlows: number[] = [];
  let cf = inputs.freeCashFlowPerShare;
  let presentValueSum = 0;

  for (let year = 1; year <= years; year++) {
    cf = cf * (1 + growth);
    const discounted = cf / Math.pow(1 + discountRate, year);
    projectedCashFlows.push(Number(cf.toFixed(2)));
    presentValueSum += discounted;
  }

  const terminalCashFlow = cf * (1 + terminalGrowth);
  const terminalValueUndiscounted =
    discountRate > terminalGrowth
      ? terminalCashFlow / (discountRate - terminalGrowth)
      : terminalCashFlow / 0.01; // safety floor to avoid division issues
  const terminalValueDiscounted = terminalValueUndiscounted / Math.pow(1 + discountRate, years);

  const intrinsicValuePerShare = presentValueSum + terminalValueDiscounted;

  return {
    intrinsicValuePerShare: Number(intrinsicValuePerShare.toFixed(2)),
    projectedCashFlows,
    terminalValue: Number(terminalValueDiscounted.toFixed(2)),
    assumptions: inputs,
  };
}

/**
 * Estimates a reasonable default DCF using EPS as a proxy for FCF/share when
 * real free-cash-flow data isn't available from free sources, and a
 * conservative growth/discount rate assumption set.
 */
export function estimateIntrinsicValue(eps: number | null, currentGrowthPercent: number | null): number | null {
  if (eps === null || eps <= 0) return null;
  const growth = currentGrowthPercent !== null ? Math.max(0, Math.min(currentGrowthPercent, 25)) : 8;
  const result = calculateDCF({
    freeCashFlowPerShare: eps,
    growthRatePercent: growth,
    terminalGrowthPercent: 4,
    discountRatePercent: 12,
  });
  return result.intrinsicValuePerShare;
}

export function valuationLabel(
  currentPrice: number | null,
  intrinsicValue: number | null
): 'undervalued' | 'fairly valued' | 'overvalued' | 'unknown' {
  if (currentPrice === null || intrinsicValue === null || intrinsicValue <= 0) return 'unknown';
  const ratio = currentPrice / intrinsicValue;
  if (ratio < 0.85) return 'undervalued';
  if (ratio > 1.15) return 'overvalued';
  return 'fairly valued';
}
