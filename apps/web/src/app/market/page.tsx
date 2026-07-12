import { MarketClient } from './MarketClient';

export const metadata = {
  title: 'Market Overview',
  description: 'NIFTY 50, SENSEX, sector indices, market breadth, and global markets at a glance.',
};

export default function MarketPage() {
  return <MarketClient />;
}
