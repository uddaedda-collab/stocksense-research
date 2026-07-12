import { AlertsClient } from './AlertsClient';

export const metadata = {
  title: 'Price Alerts',
  description: 'Set price alerts on NSE/BSE stocks and get notified when your target is reached.',
};

export default function AlertsPage() {
  return <AlertsClient />;
}
