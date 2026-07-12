'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, ApiClientError } from '@/lib/apiClient';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

interface ChatbotResponse {
  reply: string;
  relatedSymbol: string | null;
  disclaimer: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  relatedSymbol?: string | null;
}

const SUGGESTIONS = [
  'What does RSI mean?',
  "What's the risk analysis for TCS?",
  'Explain debt to equity ratio',
  'Predict RELIANCE',
];

export function ChatbotClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your research assistant. Ask me about financial ratios, technical indicators, financial statements, or NIFTY 50 stocks (e.g. \"What's the risk analysis for TCS?\").",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ChatbotResponse>('/api/chatbot', { method: 'POST', body: { message: trimmed } });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, relatedSymbol: data.relatedSymbol }]);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-h-[calc(100vh-8rem)] max-w-3xl flex-col space-y-4">
      <h1 className="text-2xl font-bold">AI Chatbot</h1>

      <div className="card flex-1 space-y-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              {m.content}
              {m.relatedSymbol && (
                <div className="mt-2">
                  <Link href={`/stock/${m.relatedSymbol}`} className="text-xs underline opacity-80">
                    View {m.relatedSymbol} stock page →
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-400">Thinking...</p>}
        <div ref={endRef} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="btn-secondary text-xs" onClick={() => sendMessage(s)} disabled={loading}>
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          type="text"
          className="input-field"
          placeholder="Ask about a ratio, indicator, or stock..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>

      <DisclaimerBox text="This chatbot explains public data and general financial concepts. It does not provide personalized investment advice." />
    </div>
  );
}
