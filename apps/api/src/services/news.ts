import fetch from 'node-fetch';
import type { NewsItem } from '@platform/shared';
import { env } from '../config/env';
import { cached } from './cache';

// ---------------------------------------------------------------------------
// Free news source: Google News RSS. No API key required, publicly
// accessible, widely used for aggregating headlines. We only display
// title/link/source/date - never the full article body - respecting
// publisher copyright (fair-use headline aggregation, same pattern used by
// countless free news readers).
// ---------------------------------------------------------------------------

const POSITIVE_WORDS = [
  'surge', 'rally', 'gain', 'gains', 'jump', 'soar', 'profit', 'growth', 'upgrade',
  'beat', 'beats', 'record high', 'bullish', 'outperform', 'strong', 'rises', 'rise',
];
const NEGATIVE_WORDS = [
  'fall', 'falls', 'drop', 'plunge', 'loss', 'losses', 'decline', 'downgrade',
  'miss', 'misses', 'bearish', 'underperform', 'weak', 'crash', 'slump', 'cuts',
];

function naiveSentiment(text: string): NewsItem['sentiment'] {
  const lower = text.toLowerCase();
  const positiveHits = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const negativeHits = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;
  if (positiveHits > negativeHits) return 'positive';
  if (negativeHits > positiveHits) return 'negative';
  return 'neutral';
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return null;
  return match[1]
    .replace('<![CDATA[', '')
    .replace(']]>', '')
    .trim();
}

function parseRssItems(xml: string, limit: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  for (const raw of itemMatches.slice(0, limit)) {
    const title = extractTag(raw, 'title') ?? '';
    const link = extractTag(raw, 'link') ?? '';
    const pubDate = extractTag(raw, 'pubDate');
    const sourceMatch = raw.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const source = sourceMatch ? sourceMatch[1].replace('<![CDATA[', '').replace(']]>', '').trim() : 'Google News';

    items.push({
      title,
      link,
      source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      summary: null,
      sentiment: naiveSentiment(title),
    });
  }
  return items;
}

export async function fetchNewsForQuery(query: string, limit = 10): Promise<NewsItem[]> {
  return cached(`news:${query}:${limit}`, env.CACHE_TTL_NEWS_SECONDS, async () => {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StockResearchBot/1.0)' },
    });
    if (!response.ok) {
      throw new Error(`News fetch failed with status ${response.status}`);
    }
    const xml = await response.text();
    return parseRssItems(xml, limit);
  });
}

export async function fetchStockNews(displaySymbol: string, companyName: string): Promise<NewsItem[]> {
  return fetchNewsForQuery(`${companyName} ${displaySymbol} NSE stock`, 10);
}

export async function fetchMarketNews(): Promise<NewsItem[]> {
  return fetchNewsForQuery('Indian stock market NSE BSE Sensex Nifty', 15);
}

export async function fetchSectorNews(sector: string): Promise<NewsItem[]> {
  return fetchNewsForQuery(`${sector} sector India stocks`, 10);
}
