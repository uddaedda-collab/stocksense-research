import type {
  AIAnalysis,
  FundamentalSnapshot,
  HistoricalBar,
  NewsItem,
  RiskAnalysis,
  TechnicalIndicatorResult,
} from './types';
import { AI_RATING_DISCLAIMER } from './disclaimers';
import { computeTechnicalIndicators } from './indicators';
import { estimateIntrinsicValue, valuationLabel } from './valuation';

// ---------------------------------------------------------------------------
// Rule-based AI analysis engine. All scores are transparent, explainable
// heuristics built from public fundamental/technical data - not a black-box
// ML model, and not a guarantee of anything. Every field is deterministic and
// testable, matching this project's "no unexplainable predictions" principle.
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeFinancialHealthScore(f: FundamentalSnapshot): number {
  let score = 50;
  if (f.debtToEquity !== null) {
    if (f.debtToEquity < 0.3) score += 20;
    else if (f.debtToEquity < 1) score += 10;
    else if (f.debtToEquity < 2) score -= 5;
    else score -= 20;
  }
  if (f.roe !== null) {
    if (f.roe > 20) score += 15;
    else if (f.roe > 12) score += 8;
    else if (f.roe < 5) score -= 10;
  }
  if (f.roce !== null) {
    if (f.roce > 20) score += 10;
    else if (f.roce > 12) score += 5;
    else if (f.roce < 5) score -= 10;
  }
  return Math.round(clamp(score, 0, 100));
}

export function computeGrowthScore(
  f: FundamentalSnapshot,
  epsGrowthPercent: number | null
): number {
  let score = 50;
  if (epsGrowthPercent !== null) {
    if (epsGrowthPercent > 20) score += 25;
    else if (epsGrowthPercent > 10) score += 12;
    else if (epsGrowthPercent < 0) score -= 20;
    else if (epsGrowthPercent < 5) score -= 5;
  }
  if (f.roe !== null && f.roe > 15) score += 10;
  return Math.round(clamp(score, 0, 100));
}

export function computeRiskAnalysis(
  f: FundamentalSnapshot,
  bars: HistoricalBar[],
  indicators: TechnicalIndicatorResult
): RiskAnalysis {
  const factors: string[] = [];
  let riskScore = 40;

  // Volatility via standard deviation of daily returns (annualized-ish proxy)
  let volatilityLabel: RiskAnalysis['volatilityLabel'] = 'moderate';
  if (bars.length >= 20) {
    const returns: number[] = [];
    for (let i = 1; i < bars.length; i++) {
      returns.push((bars[i].close - bars[i - 1].close) / bars[i - 1].close);
    }
    const recentReturns = returns.slice(-60);
    const mean = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
    const variance =
      recentReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / recentReturns.length;
    const dailyStdDev = Math.sqrt(variance);
    const annualizedVol = dailyStdDev * Math.sqrt(252) * 100;

    if (annualizedVol < 20) {
      volatilityLabel = 'low';
      riskScore -= 10;
    } else if (annualizedVol < 35) {
      volatilityLabel = 'moderate';
    } else if (annualizedVol < 55) {
      volatilityLabel = 'high';
      riskScore += 15;
    } else {
      volatilityLabel = 'very high';
      riskScore += 30;
    }
    factors.push(`Annualized volatility is approximately ${annualizedVol.toFixed(1)}%`);
  }

  let debtRisk: RiskAnalysis['debtRisk'] = 'unknown';
  if (f.debtToEquity !== null) {
    if (f.debtToEquity < 0.5) debtRisk = 'low';
    else if (f.debtToEquity < 1.5) debtRisk = 'moderate';
    else debtRisk = 'high';
    if (debtRisk === 'high') riskScore += 15;
    if (debtRisk === 'low') riskScore -= 10;
    factors.push(`Debt-to-Equity ratio is ${f.debtToEquity.toFixed(2)} (${debtRisk} debt risk)`);
  }

  let liquidityRisk: RiskAnalysis['liquidityRisk'] = 'moderate';
  const avgVolume = bars.length > 0
    ? bars.slice(-20).reduce((sum, b) => sum + b.volume, 0) / Math.min(20, bars.length)
    : 0;
  if (avgVolume > 500000) {
    liquidityRisk = 'low';
    riskScore -= 5;
  } else if (avgVolume > 50000) {
    liquidityRisk = 'moderate';
  } else {
    liquidityRisk = 'high';
    riskScore += 10;
  }
  factors.push(`Average daily volume (20D) is approximately ${Math.round(avgVolume).toLocaleString('en-IN')} shares`);

  if (indicators.rsi14 !== null && indicators.rsi14 >= 75) {
    factors.push('RSI indicates strongly overbought conditions, raising short-term pullback risk');
    riskScore += 10;
  }

  return {
    riskScore: Math.round(clamp(riskScore, 0, 100)),
    volatilityLabel,
    debtRisk,
    liquidityRisk,
    factors,
  };
}

export function computeSentimentScore(news: NewsItem[]): number {
  if (news.length === 0) return 0;
  const scoreMap: Record<NewsItem['sentiment'], number> = {
    positive: 1,
    negative: -1,
    neutral: 0,
  };
  const total = news.reduce((sum, n) => sum + scoreMap[n.sentiment], 0);
  return Math.round((total / news.length) * 100);
}

function buildStrengthsWeaknesses(
  f: FundamentalSnapshot,
  indicators: TechnicalIndicatorResult,
  risk: RiskAnalysis
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (f.roe !== null && f.roe > 15) strengths.push(`Strong Return on Equity of ${f.roe.toFixed(1)}%`);
  else if (f.roe !== null && f.roe < 8) weaknesses.push(`Low Return on Equity of ${f.roe.toFixed(1)}%`);

  if (f.debtToEquity !== null && f.debtToEquity < 0.5) strengths.push('Low debt burden relative to equity');
  else if (f.debtToEquity !== null && f.debtToEquity > 1.5) weaknesses.push('High debt-to-equity ratio increases financial risk');

  if (f.dividendYield !== null && f.dividendYield > 2) strengths.push(`Attractive dividend yield of ${f.dividendYield.toFixed(2)}%`);

  if (f.peRatio !== null && f.peRatio > 0 && f.peRatio < 15) strengths.push('Trading at a relatively low P/E multiple');
  else if (f.peRatio !== null && f.peRatio > 40) weaknesses.push('High P/E ratio suggests rich valuation relative to earnings');

  if (indicators.trend === 'uptrend') strengths.push('Price is in a confirmed technical uptrend');
  else if (indicators.trend === 'downtrend') weaknesses.push('Price is in a confirmed technical downtrend');

  if (risk.liquidityRisk === 'high') weaknesses.push('Low trading volume may cause higher liquidity risk');
  if (risk.volatilityLabel === 'very high') weaknesses.push('Very high price volatility recently');

  if (strengths.length === 0) strengths.push('No standout strengths identified from available public data');
  if (weaknesses.length === 0) weaknesses.push('No major red flags identified from available public data');

  return { strengths, weaknesses };
}

function buildMoatAnalysis(f: FundamentalSnapshot): string {
  if (f.roe !== null && f.roce !== null && f.roe > 18 && f.roce > 18) {
    return (
      'Consistently high ROE and ROCE over available data may indicate a durable competitive ' +
      'advantage (economic moat), such as brand strength, cost leadership, or market dominance. ' +
      'This is an automated inference from ratios, not a qualitative business review.'
    );
  }
  if (f.roe !== null && f.roe < 8) {
    return (
      'Low returns on equity suggest limited pricing power or a highly competitive industry ' +
      'structure. Automated inference only - verify with the company\u2019s Business/Industry section.'
    );
  }
  return (
    'Available ratio data does not show a clearly strong or weak competitive moat. ' +
    'Review the Business, Sector, and Competitors information for qualitative context.'
  );
}

function overallRatingFromScores(
  financialHealth: number,
  growth: number,
  risk: RiskAnalysis,
  valuation: ReturnType<typeof valuationLabel>
): number {
  let score = (financialHealth * 0.4 + growth * 0.3 + (100 - risk.riskScore) * 0.3) / 20; // 0-5
  if (valuation === 'undervalued') score += 0.3;
  if (valuation === 'overvalued') score -= 0.3;
  return Math.round(clamp(score, 1, 5) * 10) / 10;
}

export interface AIAnalysisInput {
  symbol: string;
  fundamentals: FundamentalSnapshot;
  bars: HistoricalBar[];
  news: NewsItem[];
  currentPrice: number | null;
  epsGrowthPercent?: number | null;
}

export function generateAIAnalysis(input: AIAnalysisInput): AIAnalysis {
  const indicators = computeTechnicalIndicators(input.bars);
  const financialHealthScore = computeFinancialHealthScore(input.fundamentals);
  const growthScore = computeGrowthScore(input.fundamentals, input.epsGrowthPercent ?? null);
  const riskAnalysis = computeRiskAnalysis(input.fundamentals, input.bars, indicators);
  const sentimentScore = computeSentimentScore(input.news);
  const intrinsicValueEstimate = estimateIntrinsicValue(
    input.fundamentals.eps,
    input.epsGrowthPercent ?? null
  );
  const valuation = valuationLabel(input.currentPrice, intrinsicValueEstimate);
  const technicalTrendLabel: AIAnalysis['technicalTrendLabel'] =
    indicators.trend === 'uptrend' ? 'bullish' : indicators.trend === 'downtrend' ? 'bearish' : 'neutral';
  const { strengths, weaknesses } = buildStrengthsWeaknesses(input.fundamentals, indicators, riskAnalysis);
  const moatAnalysis = buildMoatAnalysis(input.fundamentals);
  const overallRating = overallRatingFromScores(financialHealthScore, growthScore, riskAnalysis, valuation);

  const summary =
    `${input.symbol} shows a financial health score of ${financialHealthScore}/100 and a growth score of ` +
    `${growthScore}/100. The stock is currently technically ${technicalTrendLabel} and appears ${valuation} ` +
    `relative to its estimated intrinsic value. Overall risk is scored ${riskAnalysis.riskScore}/100 ` +
    `(${riskAnalysis.volatilityLabel} volatility). This summary is generated from public data using ` +
    `automated heuristics and should be one input among several in your own research process.`;

  return {
    symbol: input.symbol,
    summary,
    financialHealthScore,
    growthScore,
    valuationLabel: valuation,
    technicalTrendLabel,
    riskAnalysis,
    sentimentScore,
    overallRating,
    strengths,
    weaknesses,
    moatAnalysis,
    intrinsicValueEstimate,
    disclaimer: AI_RATING_DISCLAIMER,
  };
}
