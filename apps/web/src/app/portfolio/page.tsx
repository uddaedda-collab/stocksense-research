import { PortfolioClient } from './PortfolioClient';

export const metadata = {
  title: 'My Portfolio',
  description: 'Track your virtual portfolio holdings, allocation, and P&L.',
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
