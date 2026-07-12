import { describe, expect, it } from 'vitest';
import { generateAIAnalysis } from './aiAnalysis';
import { generateSyntheticBars } from './testUtils';
import type { FundamentalSnapshot, NewsItem } from './types';

const strongFundamentals: FundamentalSnapshot = {
  symbol: 'TEST',
  peRatio: 18,
  pbRatio: 3,
  eps: 25,
  dividendYield: 1.5,
  roe: 22,
  roce: 24,
  debtToEquity: 0.2,
  bookValue: 150,
  faceValue: 10,
  marketCap: 500000000000,
  sector: 'Technology',
  industry: 'IT Services',
};

const weakFundamentals: FundamentalSnapshot = {
  symbol: 'WEAK',
  peRatio: 55,
  pbRatio: 8,
  eps: 2,
  dividendYield: 0,
  roe: 4,
  roce: 3,
  debtToEquity: 2.8,
  bookValue: 20,
  faceValue: 10,
  marketCap: 20000000000,
  sector: 'Realty',
  industry: 'Construction',
};

const positiveNews: NewsItem[] = [
  { title: 'Good news', link: '#', source: 'Test', publishedAt: new Date().toISOString(), summary: null, sentiment: 'positive' },
  { title: 'Great news', link: '#', source: 'Test', publishedAt: new Date().toISOString(), summary: null, sentiment: 'positive' },
];

describe('generateAIAnalysis', () => {
  it('produces a higher financial health score for strong fundamentals', () => {
    const bars = generateSyntheticBars(250, 100, 0.2);
    const strong = generateAIAnalysis({
      symbol: 'TEST',
      fundamentals: strongFundamentals,
      bars,
      news: positiveNews,
      currentPrice: 100,
      epsGrowthPercent: 15,
    });
    const weak = generateAIAnalysis({
      symbol: 'WEAK',
      fundamentals: weakFundamentals,
      bars,
      news: [],
      currentPrice: 100,
      epsGrowthPercent: -5,
    });
    expect(strong.financialHealthScore).toBeGreaterThan(weak.financialHealthScore);
    expect(strong.growthScore).toBeGreaterThan(weak.growthScore);
  });

  it('always includes the AI rating disclaimer', () => {
    const bars = generateSyntheticBars(100);
    const result = generateAIAnalysis({
      symbol: 'TEST',
      fundamentals: strongFundamentals,
      bars,
      news: [],
      currentPrice: 100,
    });
    expect(result.disclaimer.length).toBeGreaterThan(0);
  });

  it('produces sentiment score of 100 for all-positive news and 0 for no news', () => {
    const bars = generateSyntheticBars(60);
    const withNews = generateAIAnalysis({
      symbol: 'TEST',
      fundamentals: strongFundamentals,
      bars,
      news: positiveNews,
      currentPrice: 100,
    });
    const noNews = generateAIAnalysis({
      symbol: 'TEST',
      fundamentals: strongFundamentals,
      bars,
      news: [],
      currentPrice: 100,
    });
    expect(withNews.sentimentScore).toBe(100);
    expect(noNews.sentimentScore).toBe(0);
  });

  it('overall rating stays within 1-5 bounds', () => {
    const bars = generateSyntheticBars(250, 100, -0.5);
    const result = generateAIAnalysis({
      symbol: 'WEAK',
      fundamentals: weakFundamentals,
      bars,
      news: [],
      currentPrice: 100,
      epsGrowthPercent: -10,
    });
    expect(result.overallRating).toBeGreaterThanOrEqual(1);
    expect(result.overallRating).toBeLessThanOrEqual(5);
  });

  it('produces non-empty strengths and weaknesses arrays', () => {
    const bars = generateSyntheticBars(100);
    const result = generateAIAnalysis({
      symbol: 'TEST',
      fundamentals: strongFundamentals,
      bars,
      news: [],
      currentPrice: 100,
    });
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBeGreaterThan(0);
  });
});
