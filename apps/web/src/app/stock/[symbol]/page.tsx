import { StockDetailClient } from './StockDetailClient';

// Static export requires generateStaticParams for dynamic routes. We
// pre-render pages for the NIFTY 50 universe (the platform's default
// coverage); any other valid NSE/BSE symbol still works via client-side
// fetching against the API once the page loads (fallback handled in
// StockDetailClient), since GitHub Pages serves this as a static SPA shell.
const PRERENDERED_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'HINDUNILVR', 'ITC', 'SBIN',
  'BHARTIARTL', 'BAJFINANCE', 'KOTAKBANK', 'LT', 'HCLTECH', 'ASIANPAINT', 'AXISBANK',
  'MARUTI', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'NESTLEIND', 'WIPRO', 'TATASTEEL',
  'JSWSTEEL', 'POWERGRID', 'NTPC', 'ONGC', 'TATAMOTORS', 'COALINDIA',
];

export function generateStaticParams() {
  return PRERENDERED_SYMBOLS.map((symbol) => ({ symbol }));
}

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  return <StockDetailClient symbol={params.symbol.toUpperCase()} />;
}
