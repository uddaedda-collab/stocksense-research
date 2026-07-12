// Core domain types shared between API and Web.
// All data in this platform is sourced from free, publicly accessible feeds
// (delayed quotes) and is provided strictly for research/education purposes.
// Nothing here constitutes investment advice (see disclaimers.ts).

export interface HistoricalBar {
  date: string; // ISO date (YYYY-MM-DD)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string; // e.g. RELIANCE.NS
  displaySymbol: string; // e.g. RELIANCE
  name: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  averageVolume: number;
  marketCap: number | null;
  currency: string;
  asOf: string; // ISO timestamp
  delayed: true; // always true - free data is delayed, never claim real-time
}

export interface FundamentalSnapshot {
  symbol: string;
  peRatio: number | null;
  pbRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  bookValue: number | null;
  faceValue: number | null;
  marketCap: number | null;
  sector: string | null;
  industry: string | null;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  employees: number | null;
  exchange: 'NSE' | 'BSE';
}

export interface TechnicalIndicatorResult {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd: {
    macdLine: number | null;
    signalLine: number | null;
    histogram: number | null;
  };
  bollinger: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
  };
  atr14: number | null;
  adx14: number | null;
  vwap: number | null;
  support: number[];
  resistance: number[];
  trend: 'uptrend' | 'downtrend' | 'sideways';
  momentum: 'strong' | 'moderate' | 'weak';
}

export type PredictionHorizon = 'short' | 'medium' | 'long';
export type PredictionDirection = 'bullish' | 'bearish' | 'sideways';

export interface PredictionResult {
  horizon: PredictionHorizon;
  direction: PredictionDirection;
  probabilityScore: number; // 0-100, probabilistic, never certainty
  confidencePercent: number; // 0-100, based on signal agreement
  explanation: string;
  factors: string[];
  disclaimer: string;
}

export interface RiskAnalysis {
  riskScore: number; // 0-100, higher = riskier
  volatilityLabel: 'low' | 'moderate' | 'high' | 'very high';
  debtRisk: 'low' | 'moderate' | 'high' | 'unknown';
  liquidityRisk: 'low' | 'moderate' | 'high';
  factors: string[];
}

export interface AIAnalysis {
  symbol: string;
  summary: string;
  financialHealthScore: number; // 0-100
  growthScore: number; // 0-100
  valuationLabel: 'undervalued' | 'fairly valued' | 'overvalued' | 'unknown';
  technicalTrendLabel: 'bullish' | 'bearish' | 'neutral';
  riskAnalysis: RiskAnalysis;
  sentimentScore: number; // -100 to 100
  overallRating: number; // 1-5
  strengths: string[];
  weaknesses: string[];
  moatAnalysis: string;
  intrinsicValueEstimate: number | null;
  disclaimer: string;
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ScreenerFilters {
  sector?: string;
  minPE?: number;
  maxPE?: number;
  minPB?: number;
  maxPB?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minROE?: number;
  minROCE?: number;
  maxDebtToEquity?: number;
  minDividendYield?: number;
  minPrice?: number;
  maxPrice?: number;
  minRSI?: number;
  maxRSI?: number;
  near52WeekHigh?: boolean;
  near52WeekLow?: boolean;
}

export interface ScreenerResultRow {
  symbol: string;
  displaySymbol: string;
  name: string;
  sector: string | null;
  price: number;
  peRatio: number | null;
  pbRatio: number | null;
  marketCap: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  rsi14: number | null;
}

export interface MarketMovers {
  topGainers: Quote[];
  topLosers: Quote[];
  mostActive: Quote[];
  near52WeekHigh: Quote[];
  near52WeekLow: Quote[];
}

export interface IndexQuote {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface EconomyIndicator {
  name: string;
  value: number;
  unit: string;
  changePercent: number | null;
  asOf: string;
}

export interface DividendEvent {
  date: string; // ISO date the dividend was paid/recorded
  amount: number; // per-share amount in the stock's local currency
}

export interface SplitEvent {
  date: string; // ISO date the split took effect
  numerator: number;
  denominator: number;
  ratio: string; // e.g. "2:1"
}

export interface CorporateActions {
  symbol: string;
  dividends: DividendEvent[];
  splits: SplitEvent[];
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  addedAt: string;
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  buyDate: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: string;
}
