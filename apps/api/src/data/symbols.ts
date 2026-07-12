// Curated list of NIFTY 50 constituents with Yahoo Finance-compatible symbols
// (.NS suffix = NSE) and sector classification. This list is manually curated
// public information (company names/sectors are factual, not copyrighted
// creative content) and is used to drive default dashboard widgets, the
// screener universe, and search-by-sector features without needing a paid
// reference-data API.

export interface SymbolMeta {
  symbol: string; // Yahoo Finance ticker, e.g. RELIANCE.NS
  displaySymbol: string; // RELIANCE
  name: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
}

const NIFTY50_RAW: SymbolMeta[] = [
  { symbol: 'RELIANCE.NS', displaySymbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TCS.NS', displaySymbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', displaySymbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', displaySymbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'INFY.NS', displaySymbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', displaySymbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'ITC.NS', displaySymbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'SBIN.NS', displaySymbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', displaySymbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE' },
  { symbol: 'BAJFINANCE.NS', displaySymbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Financial Services', exchange: 'NSE' },
  { symbol: 'KOTAKBANK.NS', displaySymbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'LT.NS', displaySymbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'HCLTECH.NS', displaySymbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'ASIANPAINT.NS', displaySymbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer Goods', exchange: 'NSE' },
  { symbol: 'AXISBANK.NS', displaySymbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'MARUTI.NS', displaySymbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'SUNPHARMA.NS', displaySymbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'TITAN.NS', displaySymbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Goods', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO.NS', displaySymbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', exchange: 'NSE' },
  { symbol: 'NESTLEIND.NS', displaySymbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', displaySymbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'M&M.NS', displaySymbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'ADANIENT.NS', displaySymbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Diversified', exchange: 'NSE' },
  { symbol: 'TATASTEEL.NS', displaySymbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'JSWSTEEL.NS', displaySymbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'POWERGRID.NS', displaySymbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power', exchange: 'NSE' },
  { symbol: 'NTPC.NS', displaySymbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power', exchange: 'NSE' },
  { symbol: 'ONGC.NS', displaySymbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', displaySymbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'COALINDIA.NS', displaySymbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV.NS', displaySymbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Financial Services', exchange: 'NSE' },
  { symbol: 'HDFCLIFE.NS', displaySymbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance', exchange: 'NSE' },
  { symbol: 'SBILIFE.NS', displaySymbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance', exchange: 'NSE' },
  { symbol: 'GRASIM.NS', displaySymbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Diversified', exchange: 'NSE' },
  { symbol: 'DRREDDY.NS', displaySymbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd", sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'CIPLA.NS', displaySymbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'TECHM.NS', displaySymbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'HINDALCO.NS', displaySymbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'INDUSINDBK.NS', displaySymbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'ADANIPORTS.NS', displaySymbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'BRITANNIA.NS', displaySymbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'EICHERMOT.NS', displaySymbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'APOLLOHOSP.NS', displaySymbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'DIVISLAB.NS', displaySymbol: 'DIVISLAB', name: "Divi's Laboratories Ltd", sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'BPCL.NS', displaySymbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'CIPLA.NS', displaySymbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'TATACONSUM.NS', displaySymbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'LTIM.NS', displaySymbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT', exchange: 'NSE' },
  { symbol: 'SHRIRAMFIN.NS', displaySymbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd', sector: 'Financial Services', exchange: 'NSE' },
  { symbol: 'HEROMOTOCO.NS', displaySymbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', exchange: 'NSE' },
];

export const NIFTY50_SYMBOLS: SymbolMeta[] = NIFTY50_RAW.filter(
  (s, index, arr) => arr.findIndex((x) => x.symbol === s.symbol) === index
); // dedupe

export const INDEX_SYMBOLS = [
  { name: 'NIFTY 50', symbol: '^NSEI' },
  { name: 'NIFTY BANK', symbol: '^NSEBANK' },
  { name: 'NIFTY FINANCIAL SERVICES', symbol: 'NIFTY_FIN_SERVICE.NS' },
  { name: 'NIFTY MIDCAP 100', symbol: '^CNXMDCP' },
  { name: 'SENSEX', symbol: '^BSESN' },
];

export const SECTOR_INDEX_SYMBOLS = [
  { name: 'NIFTY IT', symbol: '^CNXIT' },
  { name: 'NIFTY AUTO', symbol: '^CNXAUTO' },
  { name: 'NIFTY PHARMA', symbol: '^CNXPHARMA' },
  { name: 'NIFTY FMCG', symbol: '^CNXFMCG' },
  { name: 'NIFTY METAL', symbol: '^CNXMETAL' },
  { name: 'NIFTY REALTY', symbol: '^CNXREALTY' },
  { name: 'NIFTY ENERGY', symbol: '^CNXENERGY' },
];

export const ECONOMY_SYMBOLS = [
  { name: 'USD/INR', symbol: 'INR=X', unit: 'INR' },
  { name: 'Gold (Comex)', symbol: 'GC=F', unit: 'USD/oz' },
  { name: 'Silver (Comex)', symbol: 'SI=F', unit: 'USD/oz' },
  { name: 'Crude Oil (WTI)', symbol: 'CL=F', unit: 'USD/bbl' },
  { name: 'Brent Crude', symbol: 'BZ=F', unit: 'USD/bbl' },
];

export const GLOBAL_MARKET_SYMBOLS = [
  { name: 'Dow Jones', symbol: '^DJI' },
  { name: 'S&P 500', symbol: '^GSPC' },
  { name: 'NASDAQ', symbol: '^IXIC' },
  { name: 'Nikkei 225', symbol: '^N225' },
  { name: 'Hang Seng', symbol: '^HSI' },
  { name: 'Shanghai Composite', symbol: '000001.SS' },
];

export function findSymbolMeta(displaySymbolOrSymbol: string): SymbolMeta | undefined {
  const upper = displaySymbolOrSymbol.toUpperCase();
  return NIFTY50_SYMBOLS.find(
    (s) => s.displaySymbol === upper || s.symbol === upper || s.symbol === `${upper}.NS`
  );
}

export function toYahooSymbol(input: string): string {
  const upper = input.toUpperCase().trim();
  if (upper.endsWith('.NS') || upper.endsWith('.BO') || upper.startsWith('^') || upper.endsWith('=X') || upper.endsWith('=F')) {
    return upper;
  }
  return `${upper}.NS`;
}
