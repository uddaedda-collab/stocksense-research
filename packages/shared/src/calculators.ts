// Standard Indian retail-investing financial calculators.
// All formulas are well-established public finance math (no proprietary logic).

export interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  monthlyBreakdown: { month: number; invested: number; value: number }[];
}

/** Systematic Investment Plan future value calculator (monthly compounding). */
export function calculateSIP(
  monthlyInvestment: number,
  annualReturnPercent: number,
  years: number
): SIPResult {
  const months = Math.round(years * 12);
  const monthlyRate = annualReturnPercent / 100 / 12;
  const monthlyBreakdown: SIPResult['monthlyBreakdown'] = [];
  let value = 0;
  let invested = 0;

  for (let m = 1; m <= months; m++) {
    value = (value + monthlyInvestment) * (1 + monthlyRate);
    invested += monthlyInvestment;
    monthlyBreakdown.push({ month: m, invested, value: Number(value.toFixed(2)) });
  }

  return {
    investedAmount: Number(invested.toFixed(2)),
    estimatedReturns: Number((value - invested).toFixed(2)),
    totalValue: Number(value.toFixed(2)),
    monthlyBreakdown,
  };
}

export interface LumpsumResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

export function calculateLumpsum(
  principal: number,
  annualReturnPercent: number,
  years: number
): LumpsumResult {
  const totalValue = principal * Math.pow(1 + annualReturnPercent / 100, years);
  return {
    investedAmount: Number(principal.toFixed(2)),
    estimatedReturns: Number((totalValue - principal).toFixed(2)),
    totalValue: Number(totalValue.toFixed(2)),
  };
}

export interface BrokerageResult {
  turnover: number;
  brokerage: number;
  stt: number;
  transactionCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  totalCharges: number;
  netAmount: number;
}

export type TradeType = 'delivery' | 'intraday';

/**
 * Approximate discount-broker-style brokerage calculator using commonly
 * published free-tier rates and standard Indian regulatory charges.
 * Rates are approximate and for educational estimation only, not official quotes.
 */
export function calculateBrokerage(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  tradeType: TradeType
): BrokerageResult {
  const buyTurnover = buyPrice * quantity;
  const sellTurnover = sellPrice * quantity;
  const turnover = buyTurnover + sellTurnover;

  // Flat discount-broker style brokerage: min(0.03% of turnover, Rs 20) per executed order, or free for delivery
  const brokeragePerOrder = (orderTurnover: number) =>
    tradeType === 'delivery' ? 0 : Math.min(orderTurnover * 0.0003, 20);
  const brokerage = brokeragePerOrder(buyTurnover) + brokeragePerOrder(sellTurnover);

  // STT: delivery 0.1% on both buy & sell; intraday 0.025% on sell side only
  const stt =
    tradeType === 'delivery'
      ? (buyTurnover + sellTurnover) * 0.001
      : sellTurnover * 0.00025;

  // Exchange transaction charges (~0.00297% NSE approx for equity)
  const transactionCharges = turnover * 0.0000297;

  // SEBI charges: Rs 10 per crore
  const sebiCharges = (turnover / 10000000) * 10;

  // GST: 18% on (brokerage + transaction charges + sebi charges)
  const gst = (brokerage + transactionCharges + sebiCharges) * 0.18;

  // Stamp duty: 0.015% on buy side for delivery, 0.003% for intraday (approx)
  const stampDuty = tradeType === 'delivery' ? buyTurnover * 0.00015 : buyTurnover * 0.00003;

  const totalCharges = brokerage + stt + transactionCharges + gst + sebiCharges + stampDuty;
  const grossPnl = sellTurnover - buyTurnover;
  const netAmount = grossPnl - totalCharges;

  return {
    turnover: Number(turnover.toFixed(2)),
    brokerage: Number(brokerage.toFixed(2)),
    stt: Number(stt.toFixed(2)),
    transactionCharges: Number(transactionCharges.toFixed(2)),
    gst: Number(gst.toFixed(2)),
    sebiCharges: Number(sebiCharges.toFixed(2)),
    stampDuty: Number(stampDuty.toFixed(2)),
    totalCharges: Number(totalCharges.toFixed(2)),
    netAmount: Number(netAmount.toFixed(2)),
  };
}

export interface CompoundInterestResult {
  principal: number;
  totalInterest: number;
  totalValue: number;
}

export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingFrequencyPerYear = 1
): CompoundInterestResult {
  const n = compoundingFrequencyPerYear;
  const totalValue = principal * Math.pow(1 + annualRatePercent / 100 / n, n * years);
  return {
    principal: Number(principal.toFixed(2)),
    totalInterest: Number((totalValue - principal).toFixed(2)),
    totalValue: Number(totalValue.toFixed(2)),
  };
}

export interface RetirementResult {
  totalCorpusRequired: number;
  projectedCorpus: number;
  shortfallOrSurplus: number;
  monthlyInvestmentNeeded: number;
}

export function calculateRetirement(params: {
  currentAge: number;
  retirementAge: number;
  monthlyExpensesToday: number;
  inflationPercent: number;
  postRetirementYears: number;
  expectedReturnPercent: number;
  currentSavings: number;
  monthlyInvestment: number;
}): RetirementResult {
  const yearsToRetirement = params.retirementAge - params.currentAge;
  const inflationFactor = Math.pow(1 + params.inflationPercent / 100, yearsToRetirement);
  const monthlyExpensesAtRetirement = params.monthlyExpensesToday * inflationFactor;
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

  // Corpus required using a real-return annuity approximation over post-retirement years
  const realReturn = Math.max(
    0.01,
    (1 + params.expectedReturnPercent / 100) / (1 + params.inflationPercent / 100) - 1
  );
  const totalCorpusRequired =
    realReturn > 0
      ? (annualExpensesAtRetirement * (1 - Math.pow(1 + realReturn, -params.postRetirementYears))) / realReturn
      : annualExpensesAtRetirement * params.postRetirementYears;

  const sipFV = calculateSIP(params.monthlyInvestment, params.expectedReturnPercent, yearsToRetirement).totalValue;
  const lumpsumFV = calculateLumpsum(params.currentSavings, params.expectedReturnPercent, yearsToRetirement).totalValue;
  const projectedCorpus = sipFV + lumpsumFV;

  const shortfallOrSurplus = projectedCorpus - totalCorpusRequired;

  // Solve monthly investment needed to close any shortfall (simple iterative approximation)
  let monthlyInvestmentNeeded = params.monthlyInvestment;
  if (shortfallOrSurplus < 0 && yearsToRetirement > 0) {
    const monthlyRate = params.expectedReturnPercent / 100 / 12;
    const months = yearsToRetirement * 12;
    const futureValueFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
    const remainingCorpusNeeded = totalCorpusRequired - lumpsumFV;
    monthlyInvestmentNeeded = futureValueFactor > 0 ? Math.max(0, remainingCorpusNeeded / futureValueFactor) : params.monthlyInvestment;
  }

  return {
    totalCorpusRequired: Number(totalCorpusRequired.toFixed(2)),
    projectedCorpus: Number(projectedCorpus.toFixed(2)),
    shortfallOrSurplus: Number(shortfallOrSurplus.toFixed(2)),
    monthlyInvestmentNeeded: Number(monthlyInvestmentNeeded.toFixed(2)),
  };
}

export interface SWPResult {
  monthlyBreakdown: { month: number; withdrawal: number; remainingValue: number }[];
  totalWithdrawn: number;
  finalCorpus: number;
  corpusDepletedAtMonth: number | null;
}

export function calculateSWP(
  initialInvestment: number,
  monthlyWithdrawal: number,
  annualReturnPercent: number,
  years: number
): SWPResult {
  const months = Math.round(years * 12);
  const monthlyRate = annualReturnPercent / 100 / 12;
  let value = initialInvestment;
  let totalWithdrawn = 0;
  let depletedAtMonth: number | null = null;
  const monthlyBreakdown: SWPResult['monthlyBreakdown'] = [];

  for (let m = 1; m <= months; m++) {
    value = value * (1 + monthlyRate);
    const withdrawal = Math.min(monthlyWithdrawal, Math.max(0, value));
    value -= withdrawal;
    totalWithdrawn += withdrawal;
    monthlyBreakdown.push({ month: m, withdrawal: Number(withdrawal.toFixed(2)), remainingValue: Number(value.toFixed(2)) });
    if (value <= 0 && depletedAtMonth === null) {
      depletedAtMonth = m;
    }
  }

  return {
    monthlyBreakdown,
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
    finalCorpus: Number(Math.max(0, value).toFixed(2)),
    corpusDepletedAtMonth: depletedAtMonth,
  };
}

export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortization: { month: number; principalPaid: number; interestPaid: number; balance: number }[];
}

export function calculateEMI(
  loanAmount: number,
  annualInterestRatePercent: number,
  tenureYears: number
): EMIResult {
  const monthlyRate = annualInterestRatePercent / 100 / 12;
  const months = Math.round(tenureYears * 12);
  const emi =
    monthlyRate === 0
      ? loanAmount / months
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  let balance = loanAmount;
  const amortization: EMIResult['amortization'] = [];
  let totalInterest = 0;

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = emi - interestPaid;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interestPaid;
    amortization.push({
      month: m,
      principalPaid: Number(principalPaid.toFixed(2)),
      interestPaid: Number(interestPaid.toFixed(2)),
      balance: Number(balance.toFixed(2)),
    });
  }

  return {
    emi: Number(emi.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayment: Number((loanAmount + totalInterest).toFixed(2)),
    amortization,
  };
}
