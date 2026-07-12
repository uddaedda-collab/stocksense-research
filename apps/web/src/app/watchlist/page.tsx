import { WatchlistClient } from './WatchlistClient';

export const metadata = {
  title: 'My Watchlist',
  description: 'Track your favorite NSE/BSE stocks in one place.',
};

export default function WatchlistPage() {
  return <WatchlistClient />;
}
