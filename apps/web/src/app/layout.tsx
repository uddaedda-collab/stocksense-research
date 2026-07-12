import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.github.io'),
  title: {
    default: 'StockSense Research — Free AI-Powered Indian Stock Market Research',
    template: '%s | StockSense Research',
  },
  description:
    'Free AI-powered research platform for Indian stock markets (NSE/BSE). Explore fundamentals, technicals, screener, predictions, and portfolio tools. Educational only, not investment advice.',
  keywords: [
    'NSE stocks', 'BSE stocks', 'Indian stock market', 'stock screener', 'stock research',
    'NIFTY 50', 'technical analysis', 'fundamental analysis', 'AI stock predictions',
  ],
  openGraph: {
    title: 'StockSense Research',
    description: 'Free AI-powered Indian stock market research platform.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockSense Research',
    description: 'Free AI-powered Indian stock market research platform.',
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StockSense',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
