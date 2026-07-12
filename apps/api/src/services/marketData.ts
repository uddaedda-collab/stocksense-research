import type {
  CompanyProfile,
  FundamentalSnapshot,
  HistoricalBar,
  IndexQuote,
  Quote,
} from '@platform/shared';
import { env } from '../config/env';
import { cached } from './cache';
import {
  fetchFundamentals,
  fetchHistoricalBars,
  fetchQuote,
  type RangeInterval,
} from './yahooFinance';
import { findSymbolMeta, INDEX_SYMBOLS, toYahooSymbol } from '../data/symbols';

export async function getQuote(inputSymbol: string): Promise<Quote> {
  const symbol = toYahooSymbol(inputSymbol);
  const meta = findSymbolMeta(inputSymbol);
  const displaySymbol = meta?.displaySymbol ?? inputSymbol.toUpperCase().replace(/\.(NS|BO)$/, '');
  const name = meta?.name ?? displaySymbol;
  const exchange = meta?.exchange ?? (symbol.endsWith('.BO') ? 'BSE' : 'NSE');

  return cached(`quote:${symbol}`, env.CACHE_TTL_QUOTE_SECONDS, () =>
    fetchQuote(symbol, displaySymbol, name, exchange)
  );
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));
  return results
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export async function getHistoricalBars(
  inputSymbol: string,
  opts?: RangeInterval
): Promise<HistoricalBar[]> {
  const symbol = toYahooSymbol(inputSymbol);
  const range = opts?.range ?? '5y';
  const interval = opts?.interval ?? '1d';
  return cached(`history:${symbol}:${range}:${interval}`, env.CACHE_TTL_HISTORY_SECONDS, () =>
    fetchHistoricalBars(symbol, { range, interval })
  );
}

export async function getFundamentals(inputSymbol: string): Promise<FundamentalSnapshot> {
  const symbol = toYahooSymbol(inputSymbol);
  const raw = await cached(`fundamentals:${symbol}`, env.CACHE_TTL_HISTORY_SECONDS, () =>
    fetchFundamentals(symbol)
  );
  return {
    symbol,
    peRatio: raw.peRatio,
    pbRatio: raw.pbRatio,
    eps: raw.eps,
    dividendYield: raw.dividendYield,
    roe: raw.roe,
    roce: null, // ROCE isn't exposed by the free Yahoo endpoint; left null rather than guessed
    debtToEquity: raw.debtToEquity !== null ? raw.debtToEquity / 100 : null, // Yahoo reports as percentage
    bookValue: raw.bookValue,
    faceValue: null,
    marketCap: raw.marketCap,
    sector: raw.sector,
    industry: raw.industry,
  };
}

export async function getCompanyProfile(inputSymbol: string): Promise<CompanyProfile> {
  const symbol = toYahooSymbol(inputSymbol);
  const meta = findSymbolMeta(inputSymbol);
  const raw = await cached(`profile:${symbol}`, env.CACHE_TTL_HISTORY_SECONDS, () =>
    fetchFundamentals(symbol)
  );
  return {
    symbol,
    name: meta?.name ?? symbol,
    sector: raw.sector ?? meta?.sector ?? null,
    industry: raw.industry ?? null,
    description: raw.description,
    website: raw.website,
    employees: raw.employees,
    exchange: meta?.exchange ?? (symbol.endsWith('.BO') ? 'BSE' : 'NSE'),
  };
}

export async function getIndexQuotes(): Promise<IndexQuote[]> {
  const results = await Promise.allSettled(
    INDEX_SYMBOLS.map(async (idx) => {
      const quote = await cached(`index:${idx.symbol}`, env.CACHE_TTL_QUOTE_SECONDS, () =>
        fetchQuote(idx.symbol, idx.name, idx.name, 'NSE')
      );
      return {
        name: idx.name,
        symbol: idx.symbol,
        value: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
      };
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<IndexQuote> => r.status === 'fulfilled')
    .map((r) => r.value);
}
