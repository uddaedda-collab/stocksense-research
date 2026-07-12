import { ChatbotClient } from './ChatbotClient';

export const metadata = {
  title: 'AI Chatbot',
  description: 'Ask about financial ratios, technical indicators, charts, and reports.',
};

export default function ChatbotPage() {
  return <ChatbotClient />;
}
