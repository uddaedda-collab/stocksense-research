import { generateAIAnalysis, generateAllHorizonPredictions } from '@platform/shared';
import { findSymbolMeta, NIFTY50_SYMBOLS } from '../data/symbols';
import { getFundamentals, getHistoricalBars, getQuote } from './marketData';

// ---------------------------------------------------------------------------
// Free, rule-based/retrieval chatbot. Deliberately NOT wired to a paid LLM API
// so the whole platform runs on free infrastructure. It combines:
//  1. A glossary of financial term explanations (ratios, indicators, reports)
//  2. Symbol detection + live data retrieval for "explain this stock" queries
//  3. Template-based responses grounded in real computed data (no hallucinated
//     numbers - every figure quoted comes directly from the data pipeline)
// This can be swapped for a hosted open-source LLM later without changing the
// route contract.
// ---------------------------------------------------------------------------

const GLOSSARY: Record<string, string> = {
  pe: 'P/E (Price-to-Earnings) ratio shows how much investors pay per rupee of earnings. A lower P/E can indicate an undervalued stock, while a very high P/E may mean the market expects strong future growth (or the stock is overvalued). Compare it against sector peers rather than in isolation.',
  pb: 'P/B (Price-to-Book) ratio compares market price to the company\u2019s book value (net assets). A P/B below 1 can indicate undervaluation, but is also common for asset-heavy, low-growth businesses.',
  roe: 'ROE (Return on Equity) measures how efficiently a company generates profit from shareholders\u2019 equity. Consistently high ROE (15%+) over multiple years can indicate a well-run, capital-efficient business.',
  roce: 'ROCE (Return on Capital Employed) measures returns generated on all capital used (debt + equity), useful for comparing capital-intensive businesses.',
  eps: 'EPS (Earnings Per Share) is net profit divided by number of outstanding shares. Growing EPS over time is generally a healthy sign.',
  'debt to equity': 'Debt-to-Equity compares total debt to shareholder equity. Lower ratios (below 0.5-1) generally indicate lower financial risk; higher ratios mean more leverage and interest-rate sensitivity.',
  rsi: 'RSI (Relative Strength Index) measures momentum on a 0-100 scale. Above 70 is often considered overbought (possible pullback), below 30 oversold (possible bounce). It works best combined with trend context, not alone.',
  macd: 'MACD (Moving Average Convergence Divergence) tracks the relationship between two EMAs to spot momentum shifts. A MACD line crossing above the signal line is often read as bullish momentum building, and vice versa for bearish.',
  'bollinger bands': 'Bollinger Bands plot a moving average with upper/lower bands based on volatility (standard deviation). Price hugging the upper band can suggest strong momentum or overbought conditions; hugging the lower band can suggest oversold conditions.',
  atr: 'ATR (Average True Range) measures how much a stock typically moves per day, used to gauge volatility rather than direction.',
  adx: 'ADX (Average Directional Index) measures trend strength (not direction). Above 25 typically signals a strong trend; below 20 suggests a weak or range-bound market.',
  vwap: 'VWAP (Volume Weighted Average Price) shows the average price a stock traded at, weighted by volume. It\u2019s often used as a fair-value benchmark for the trading session.',
  dividend: 'Dividend yield shows annual dividend payout as a percentage of share price. Higher yields can be attractive for income investors, but unusually high yields can also signal financial stress or an unsustainable payout.',
  'balance sheet': 'The Balance Sheet is a snapshot of what a company owns (assets) and owes (liabilities) at a point in time, plus shareholder equity. It helps assess financial stability and leverage.',
  'profit and loss': 'The Profit & Loss (Income) Statement shows revenue, expenses, and profit over a period. It reveals whether a business is growing revenue and managing costs effectively.',
  'cash flow': 'The Cash Flow Statement tracks actual cash moving in and out across operating, investing, and financing activities. Positive operating cash flow is a strong signal of real business health beyond reported accounting profit.',
  moat: 'An economic moat refers to a durable competitive advantage (brand, network effects, cost leadership, switching costs) that helps a company defend its profits from competitors over the long term.',
  intrinsic: 'Intrinsic value is an estimate of what a stock is really worth based on its expected future cash flows, discounted back to today (see DCF). It\u2019s compared to the market price to judge over/undervaluation.',
  dcf: 'DCF (Discounted Cash Flow) valuation projects a company\u2019s future free cash flows and discounts them to present value using a required rate of return, to estimate intrinsic value per share.',
};

function findGlossaryMatch(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [term, explanation] of Object.entries(GLOSSARY)) {
    if (lower.includes(term)) return explanation;
  }
  return null;
}

function detectSymbol(message: string): string | null {
  const upper = message.toUpperCase();
  for (const meta of NIFTY50_SYMBOLS) {
    if (upper.includes(meta.displaySymbol)) return meta.symbol;
  }
  return null;
}

export interface ChatbotResponse {
  reply: string;
  relatedSymbol: string | null;
  disclaimer: string;
}

export async function answerChatbotQuery(message: string): Promise<ChatbotResponse> {
  const disclaimer =
    'This chatbot explains public data and general financial concepts. It does not provide personalized investment advice.';

  const symbol = detectSymbol(message);
  const lower = message.toLowerCase();

  if (symbol && (lower.includes('predict') || lower.includes('forecast') || lower.includes('outlook'))) {
    const bars = await getHistoricalBars(symbol, { range: '2y', interval: '1d' });
    const predictions = generateAllHorizonPredictions(bars);
    const meta = findSymbolMeta(symbol);
    const lines = predictions.map(
      (p) => `${p.horizon}-term: ${p.direction} bias (${p.probabilityScore}% weighted lean, ${p.confidencePercent}% signal agreement)`
    );
    return {
      reply: `Here's the current probabilistic outlook for ${meta?.displaySymbol ?? symbol}:\n${lines.join('\n')}\n\nRemember, these are probabilistic technical estimates, not guarantees.`,
      relatedSymbol: symbol,
      disclaimer,
    };
  }

  if (symbol && (lower.includes('risk') || lower.includes('health') || lower.includes('analysis') || lower.includes('rating') || lower.includes('summary'))) {
    const [quote, fundamentals, bars] = await Promise.all([
      getQuote(symbol),
      getFundamentals(symbol),
      getHistoricalBars(symbol, { range: '1y', interval: '1d' }),
    ]);
    const analysis = generateAIAnalysis({
      symbol: quote.displaySymbol,
      fundamentals,
      bars,
      news: [],
      currentPrice: quote.price,
    });
    return {
      reply: `${analysis.summary}\n\nStrengths: ${analysis.strengths.join('; ')}\nWeaknesses: ${analysis.weaknesses.join('; ')}\nOverall AI Rating: ${analysis.overallRating}/5`,
      relatedSymbol: symbol,
      disclaimer,
    };
  }

  if (symbol) {
    const quote = await getQuote(symbol);
    return {
      reply: `${quote.name} (${quote.displaySymbol}) is currently trading at \u20b9${quote.price} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}% today). Ask me about its risk analysis, prediction outlook, or a specific ratio like P/E or RSI for more detail.`,
      relatedSymbol: symbol,
      disclaimer,
    };
  }

  const glossaryAnswer = findGlossaryMatch(message);
  if (glossaryAnswer) {
    return { reply: glossaryAnswer, relatedSymbol: null, disclaimer };
  }

  return {
    reply:
      "I can explain financial ratios (P/E, P/B, ROE, ROCE, Debt-to-Equity), technical indicators (RSI, MACD, Bollinger Bands, ADX, ATR, VWAP), financial statements, valuation concepts (DCF, intrinsic value, moat), and answer questions about specific NIFTY 50 stocks (e.g. \"What's the risk analysis for TCS?\" or \"Predict RELIANCE\"). Try asking about one of these topics.",
    relatedSymbol: null,
    disclaimer,
  };
}
