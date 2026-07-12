import fetch from 'node-fetch';
import https from 'https';
import type { HistoricalBar, Quote } from '@platform/shared';

// ---------------------------------------------------------------------------
// Free market-data client built on Yahoo Finance's public, unauthenticated
// JSON endpoints - the same underlying data source used by the popular
// open-source `yfinance` Python library. No API key, no paid plan required.
//
// IMPORTANT LIMITATIONS (documented, not hidden):
//  - Data is delayed (typically 15+ minutes), never real-time.
//  - This is an unofficial/public endpoint with no formal SLA; if Yahoo
//    changes or blocks it, this client will start failing and needs a
//    fallback data source swapped in.
//  - We do not redistribute or resell this data; it is used for personal
//    research display only, consistent with fair-use expectations for a
//    free educational tool.
// ---------------------------------------------------------------------------

const CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const QUOTE_SUMMARY_BASE = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';
const SEARCH_BASE = 'https://query1.finance.yahoo.com/v1/finance/search';
const CRUMB_COOKIE_URL = 'https://fc.yahoo.com';

const CRUMB_URL = 'https://query1.finance.yahoo.com/v1/test/getcrumb';

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json',
};

// ---------------------------------------------------------------------------
// Yahoo's quoteSummary endpoint (used for fundamentals/company profile) now
// requires a session cookie + "crumb" CSRF token, even for public data - a
// change Yahoo rolled out to reduce unauthenticated scraping. The chart and
// search endpoints still work without this. We fetch the cookie+crumb pair
// once and cache it in memory (crumbs are valid for a while), refreshing on
// failure. This is still using only Yahoo's public, unauthenticated web
// session flow - no API key or paid account involved.
// ---------------------------------------------------------------------------
let cachedCookie: string | null = null;
let cachedCrumb: string | null = null;
let crumbFetchPromise: Promise<{ cookie: string; crumb: string }> | null = null;

/**
 * Plain `https` GET (not node-fetch) - node-fetch v3 was observed to fail
 * against Yahoo's cookie-setting endpoint (header parsing issue), while
 * Node's built-in https module handles it correctly. Used only for the
 * crumb/cookie handshake; all other Yahoo requests still use node-fetch.
 */
function httpsGet(url: string, headers: Record<string, string>): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, maxHeaderSize: 65536 }, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on('error', reject);
  });
}

async function fetchCrumb(): Promise<{ cookie: string; crumb: string }> {
  // NOTE: only send User-Agent here, not the JSON Accept header used
  // elsewhere - the crumb endpoint returns plain text and Yahoo responds
  // with 406 Not Acceptable if Accept: application/json is sent.
  const crumbHeaders = { 'User-Agent': DEFAULT_HEADERS['User-Agent'] };

  const cookieResponse = await httpsGet(CRUMB_COOKIE_URL, crumbHeaders);
  const setCookie = cookieResponse.headers['set-cookie'] as string[] | undefined;
  const cookie = setCookie ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';

  const crumbResponse = await httpsGet(CRUMB_URL, { ...crumbHeaders, Cookie: cookie });
  if (crumbResponse.status !== 200) {
    throw new Error(`Failed to fetch Yahoo Finance crumb: status ${crumbResponse.status}`);
  }
  const crumb = crumbResponse.body.trim();
  return { cookie, crumb };
}

async function getCrumbAndCookie(forceRefresh = false): Promise<{ cookie: string; crumb: string }> {
  if (!forceRefresh && cachedCookie && cachedCrumb) {
    return { cookie: cachedCookie, crumb: cachedCrumb };
  }
  if (!crumbFetchPromise || forceRefresh) {
    crumbFetchPromise = fetchCrumb().then((result) => {
      cachedCookie = result.cookie;
      cachedCrumb = result.crumb;
      return result;
    });
  }
  return crumbFetchPromise;
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        currency: string;
        regularMarketPrice: number;
        previousClose: number;
        chartPreviousClose: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketVolume: number;
        fiftyTwoWeekHigh: number;
        fiftyTwoWeekLow: number;
        exchangeName: string;
        longName?: string;
        shortName?: string;
      };
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }>;
    error: { code: string; description: string } | null;
  };
}

export interface RangeInterval {
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'max';
  interval: '1d' | '1wk' | '1mo';
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Upstream data request failed with status ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchHistoricalBars(
  symbol: string,
  opts: RangeInterval = { range: '5y', interval: '1d' }
): Promise<HistoricalBar[]> {
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?range=${opts.range}&interval=${opts.interval}&events=div,splits`;
  const data = await fetchJson<YahooChartResponse>(url);

  if (data.chart.error) {
    throw new Error(`Yahoo Finance error for ${symbol}: ${data.chart.error.description}`);
  }
  const result = data.chart.result?.[0];
  if (!result || !result.timestamp) {
    return [];
  }

  const quote = result.indicators.quote[0];
  const bars: HistoricalBar[] = [];

  for (let i = 0; i < result.timestamp.length; i++) {
    const open = quote.open[i];
    const high = quote.high[i];
    const low = quote.low[i];
    const close = quote.close[i];
    const volume = quote.volume[i];
    if (open === null || high === null || low === null || close === null) continue;

    const date = new Date(result.timestamp[i] * 1000).toISOString().slice(0, 10);
    bars.push({
      date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: volume ?? 0,
    });
  }

  return bars;
}

export async function fetchQuote(symbol: string, displaySymbol: string, name: string, exchange: 'NSE' | 'BSE'): Promise<Quote> {
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const data = await fetchJson<YahooChartResponse>(url);

  if (data.chart.error) {
    throw new Error(`Yahoo Finance error for ${symbol}: ${data.chart.error.description}`);
  }
  const result = data.chart.result?.[0];
  if (!result) {
    throw new Error(`No quote data returned for ${symbol}`);
  }

  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const previousClose = meta.previousClose ?? meta.chartPreviousClose;
  const change = price - previousClose;
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

  const quoteArr = result.indicators.quote[0];
  const volumes = (quoteArr?.volume ?? []).filter((v): v is number => v !== null);
  const averageVolume =
    volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : meta.regularMarketVolume;

  return {
    symbol,
    displaySymbol,
    name: meta.longName || meta.shortName || name,
    exchange,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    open: quoteArr?.open?.[0] ?? price,
    dayHigh: meta.regularMarketDayHigh ?? price,
    dayLow: meta.regularMarketDayLow ?? price,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? price,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? price,
    volume: meta.regularMarketVolume ?? 0,
    averageVolume: Math.round(averageVolume),
    marketCap: null, // requires quoteSummary call; populated separately when needed
    currency: meta.currency ?? 'INR',
    asOf: new Date().toISOString(),
    delayed: true,
  };
}

interface QuoteSummaryResponse {
  quoteSummary: {
    result: Array<{
      summaryDetail?: {
        marketCap?: { raw: number };
        trailingPE?: { raw: number };
        dividendYield?: { raw: number };
        fiftyTwoWeekHigh?: { raw: number };
        fiftyTwoWeekLow?: { raw: number };
        averageVolume?: { raw: number };
      };
      defaultKeyStatistics?: {
        trailingEps?: { raw: number };
        priceToBook?: { raw: number };
        bookValue?: { raw: number };
        returnOnEquity?: { raw: number };
      };
      financialData?: {
        returnOnEquity?: { raw: number };
        debtToEquity?: { raw: number };
        totalCash?: { raw: number };
        totalDebt?: { raw: number };
      };
      assetProfile?: {
        sector?: string;
        industry?: string;
        longBusinessSummary?: string;
        website?: string;
        fullTimeEmployees?: number;
      };
    }>;
    error: { code: string; description: string } | null;
  };
}

export interface FundamentalsRaw {
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  roe: number | null;
  debtToEquity: number | null;
  bookValue: number | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  employees: number | null;
}

async function fetchQuoteSummaryWithAuth(symbol: string, modules: string): Promise<QuoteSummaryResponse> {
  let { cookie, crumb } = await getCrumbAndCookie();
  let url = `${QUOTE_SUMMARY_BASE}/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
  let response = await fetch(url, { headers: { ...DEFAULT_HEADERS, Cookie: cookie } });

  if (response.status === 401 || response.status === 403) {
    // Crumb likely expired/invalid - refresh once and retry.
    ({ cookie, crumb } = await getCrumbAndCookie(true));
    url = `${QUOTE_SUMMARY_BASE}/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`;
    response = await fetch(url, { headers: { ...DEFAULT_HEADERS, Cookie: cookie } });
  }

  if (!response.ok) {
    throw new Error(`Upstream data request failed with status ${response.status} for ${url}`);
  }
  return (await response.json()) as QuoteSummaryResponse;
}

export async function fetchFundamentals(symbol: string): Promise<FundamentalsRaw> {
  const modules = 'summaryDetail,defaultKeyStatistics,financialData,assetProfile';
  const data = await fetchQuoteSummaryWithAuth(symbol, modules);

  if (data.quoteSummary.error) {
    throw new Error(`Yahoo Finance error for ${symbol}: ${data.quoteSummary.error.description}`);
  }
  const result = data.quoteSummary.result?.[0];
  if (!result) {
    throw new Error(`No fundamentals data returned for ${symbol}`);
  }

  return {
    marketCap: result.summaryDetail?.marketCap?.raw ?? null,
    peRatio: result.summaryDetail?.trailingPE?.raw ?? null,
    pbRatio: result.defaultKeyStatistics?.priceToBook?.raw ?? null,
    eps: result.defaultKeyStatistics?.trailingEps?.raw ?? null,
    dividendYield: result.summaryDetail?.dividendYield?.raw
      ? result.summaryDetail.dividendYield.raw * 100
      : null,
    roe: result.financialData?.returnOnEquity?.raw ? result.financialData.returnOnEquity.raw * 100 : null,
    debtToEquity: result.financialData?.debtToEquity?.raw ?? null,
    bookValue: result.defaultKeyStatistics?.bookValue?.raw ?? null,
    sector: result.assetProfile?.sector ?? null,
    industry: result.assetProfile?.industry ?? null,
    description: result.assetProfile?.longBusinessSummary ?? null,
    website: result.assetProfile?.website ?? null,
    employees: result.assetProfile?.fullTimeEmployees ?? null,
  };
}

interface SearchResponse {
  quotes: Array<{
    symbol: string;
    shortname?: string;
    longname?: string;
    exchDisp?: string;
    typeDisp?: string;
  }>;
}

export interface SearchResultItem {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export async function searchSymbols(query: string): Promise<SearchResultItem[]> {
  const url = `${SEARCH_BASE}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  const data = await fetchJson<SearchResponse>(url);
  return (data.quotes ?? [])
    .filter((q) => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
    .map((q) => ({
      symbol: q.symbol,
      name: q.longname || q.shortname || q.symbol,
      exchange: q.exchDisp ?? '',
      type: q.typeDisp ?? '',
    }));
}
