import { CalculatorsClient } from './CalculatorsClient';

export const metadata = {
  title: 'Financial Calculators',
  description: 'Free SIP, Lumpsum, EMI, SWP, Brokerage, Retirement and Compound Interest calculators for Indian investors.',
};

export default function CalculatorsPage() {
  return <CalculatorsClient />;
}
