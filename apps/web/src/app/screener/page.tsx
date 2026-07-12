import { ScreenerClient } from './ScreenerClient';

export const metadata = {
  title: 'Stock Screener',
  description: 'Filter NSE/BSE stocks by P/E, P/B, market cap, ROE, ROCE, debt, dividend yield, price, and RSI.',
};

export default function ScreenerPage() {
  return <ScreenerClient />;
}
