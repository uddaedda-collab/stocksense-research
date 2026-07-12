import { EconomyClient } from './EconomyClient';

export const metadata = {
  title: 'Economy',
  description: 'Gold, silver, USD/INR, crude oil, and other macroeconomic indicators.',
};

export default function EconomyPage() {
  return <EconomyClient />;
}
