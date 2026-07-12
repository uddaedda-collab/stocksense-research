import { HeatmapClient } from './HeatmapClient';

export const metadata = {
  title: 'Market Heatmap',
  description: 'Interactive heatmap of NIFTY 50 stock performance by market cap and sector.',
};

export default function HeatmapPage() {
  return <HeatmapClient />;
}
