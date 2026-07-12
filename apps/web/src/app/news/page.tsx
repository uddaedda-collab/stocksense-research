import { NewsClient } from './NewsClient';

export const metadata = {
  title: 'Market News',
  description: 'Latest Indian stock market news with AI-generated sentiment tags.',
};

export default function NewsPage() {
  return <NewsClient />;
}
