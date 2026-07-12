import type {
  HistoricalBar,
  PredictionResult,
  PredictionHorizon,
  TechnicalIndicatorResult,
} from './types';
import { PREDICTION_DISCLAIMER } from './disclaimers';
import { computeTechnicalIndicators } from './indicators';

// ---------------------------------------------------------------------------
// Rule-based, explainable probabilistic prediction engine.
// This intentionally avoids "black box" ML claims. Every score is derived
// from a weighted combination of trend, momentum, and volatility signals,
// with full factor breakdown so users can see WHY a score was produced.
// This is NOT a guarantee of future price movement.
// ---------------------------------------------------------------------------

interface SignalScore {
  label: string;
  score: number; // -1 (bearish) to +1 (bullish)
  weight: number;
}

function collectSignals(
  indicators: TechnicalIndicatorResult,
  bars: HistoricalBar[],
  horizon: PredictionHorizon
): SignalScore[] {
  const signals: SignalScore[] = [];
  const lastClose = bars[bars.length - 1]?.close ?? 0;

  // Trend signal (SMA20 vs SMA50 vs SMA200)
  if (indicators.sma20 !== null && indicators.sma50 !== null) {
    const diff = (indicators.sma20 - indicators.sma50) / indicators.sma50;
    signals.push({
      label:
        diff > 0
          ? 'Short-term average (SMA20) is above medium-term average (SMA50), suggesting upward momentum'
          : 'Short-term average (SMA20) is below medium-term average (SMA50), suggesting downward pressure',
      score: Math.max(-1, Math.min(1, diff * 20)),
      weight: horizon === 'short' ? 1.5 : 1,
    });
  }

  if (indicators.sma50 !== null && indicators.sma200 !== null) {
    const diff = (indicators.sma50 - indicators.sma200) / indicators.sma200;
    signals.push({
      label:
        diff > 0
          ? 'Price structure is in a long-term uptrend (Golden Cross zone: SMA50 > SMA200)'
          : 'Price structure is in a long-term downtrend (Death Cross zone: SMA50 < SMA200)',
      score: Math.max(-1, Math.min(1, diff * 15)),
      weight: horizon === 'long' ? 2 : 0.8,
    });
  }

  // RSI signal
  if (indicators.rsi14 !== null) {
    let rsiScore = 0;
    let label = `RSI(14) is ${indicators.rsi14.toFixed(1)}, indicating neutral momentum`;
    if (indicators.rsi14 >= 70) {
      rsiScore = -0.6;
      label = `RSI(14) is ${indicators.rsi14.toFixed(1)}, indicating overbought conditions`;
    } else if (indicators.rsi14 <= 30) {
      rsiScore = 0.6;
      label = `RSI(14) is ${indicators.rsi14.toFixed(1)}, indicating oversold conditions`;
    } else if (indicators.rsi14 > 50) {
      rsiScore = 0.3;
      label = `RSI(14) is ${indicators.rsi14.toFixed(1)}, indicating mild bullish momentum`;
    } else {
      rsiScore = -0.3;
      label = `RSI(14) is ${indicators.rsi14.toFixed(1)}, indicating mild bearish momentum`;
    }
    signals.push({ label, score: rsiScore, weight: horizon === 'short' ? 1.4 : 0.9 });
  }

  // MACD signal
  if (indicators.macd.histogram !== null) {
    const histScore = Math.max(-1, Math.min(1, indicators.macd.histogram * 5));
    signals.push({
      label:
        indicators.macd.histogram > 0
          ? 'MACD histogram is positive, suggesting bullish momentum building'
          : 'MACD histogram is negative, suggesting bearish momentum building',
      score: histScore,
      weight: 1.2,
    });
  }

  // ADX / trend strength
  if (indicators.adx14 !== null) {
    const strength = indicators.adx14 >= 25 ? 1 : indicators.adx14 >= 20 ? 0.5 : 0.1;
    const directional = indicators.trend === 'uptrend' ? strength : indicators.trend === 'downtrend' ? -strength : 0;
    signals.push({
      label: `ADX(14) is ${indicators.adx14.toFixed(1)}, indicating ${
        indicators.adx14 >= 25 ? 'a strong' : 'a weak'
      } ${indicators.trend}`,
      score: directional,
      weight: 1,
    });
  }

  // Bollinger position
  if (indicators.bollinger.upper !== null && indicators.bollinger.lower !== null) {
    const range = indicators.bollinger.upper - indicators.bollinger.lower;
    if (range > 0) {
      const position = (lastClose - indicators.bollinger.lower) / range; // 0 to 1
      let bScore = 0;
      if (position > 0.9) bScore = -0.4; // near upper band, possible pullback
      else if (position < 0.1) bScore = 0.4; // near lower band, possible bounce
      signals.push({
        label: `Price is at ${(position * 100).toFixed(0)}% of the Bollinger Band range`,
        score: bScore,
        weight: 0.7,
      });
    }
  }

  return signals;
}

function scoreToDirection(score: number): 'bullish' | 'bearish' | 'sideways' {
  if (score > 0.15) return 'bullish';
  if (score < -0.15) return 'bearish';
  return 'sideways';
}

export function generatePrediction(
  bars: HistoricalBar[],
  horizon: PredictionHorizon
): PredictionResult {
  if (bars.length < 30) {
    return {
      horizon,
      direction: 'sideways',
      probabilityScore: 50,
      confidencePercent: 10,
      explanation:
        'Not enough historical data is available yet to generate a meaningful prediction. ' +
        'At least 30 trading days of history are required.',
      factors: [],
      disclaimer: PREDICTION_DISCLAIMER,
    };
  }

  const indicators = computeTechnicalIndicators(bars);
  const signals = collectSignals(indicators, bars, horizon);

  if (signals.length === 0) {
    return {
      horizon,
      direction: 'sideways',
      probabilityScore: 50,
      confidencePercent: 15,
      explanation: 'Insufficient indicator data to form a confident view.',
      factors: [],
      disclaimer: PREDICTION_DISCLAIMER,
    };
  }

  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore =
    signals.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight; // -1 to 1

  const direction = scoreToDirection(weightedScore);

  // probabilityScore: how far the weighted signal leans toward the direction, mapped to 50-90 range
  // Never claim >90% probability - markets are inherently uncertain.
  const magnitude = Math.min(Math.abs(weightedScore), 1);
  const probabilityScore = Math.round(50 + magnitude * 40);

  // confidence: agreement between signals (low variance among signal scores = higher confidence)
  const mean = signals.reduce((sum, s) => sum + s.score, 0) / signals.length;
  const variance =
    signals.reduce((sum, s) => sum + (s.score - mean) ** 2, 0) / signals.length;
  const agreement = Math.max(0, 1 - variance); // variance near 0 => high agreement
  const confidencePercent = Math.round(30 + agreement * 60);

  const horizonLabel =
    horizon === 'short' ? 'next few days to 2 weeks' : horizon === 'medium' ? 'next 1-3 months' : 'next 6-12 months';

  const explanation =
    `Based on ${signals.length} technical signals, the stock shows a ${direction} bias for the ${horizonLabel}. ` +
    `This is a probabilistic estimate (${probabilityScore}% weighted lean, ${confidencePercent}% signal agreement), ` +
    `not a certainty. Always combine this with fundamental research and your own risk assessment.`;

  return {
    horizon,
    direction,
    probabilityScore,
    confidencePercent,
    explanation,
    factors: signals.map((s) => s.label),
    disclaimer: PREDICTION_DISCLAIMER,
  };
}

export function generateAllHorizonPredictions(bars: HistoricalBar[]): PredictionResult[] {
  const horizons: PredictionHorizon[] = ['short', 'medium', 'long'];
  return horizons.map((h) => generatePrediction(bars, h));
}
