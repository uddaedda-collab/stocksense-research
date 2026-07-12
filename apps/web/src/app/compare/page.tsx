import { CompareClient } from './CompareClient';

export const metadata = {
  title: 'Compare Stocks',
  description: 'Compare fundamentals, valuation and technicals of 2 to 5 NSE/BSE stocks side by side.',
};

export default function ComparePage() {
  return <CompareClient />;
}
