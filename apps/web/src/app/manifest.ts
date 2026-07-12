import type { MetadataRoute } from 'next';

// Next.js App Router manifest convention — generates /manifest.webmanifest
// at build time. Works with `output: 'export'` (static export) and respects
// NEXT_PUBLIC_BASE_PATH so icon URLs resolve correctly when hosted under a
// GitHub Pages sub-path (https://<user>.github.io/<repo>/).
export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return {
    name: 'StockSense Research — Free AI-Powered Indian Stock Market Research',
    short_name: 'StockSense',
    description:
      'Free AI-powered research platform for Indian stock markets (NSE/BSE). Educational tool, not investment advice.',
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `${basePath}/icons/icon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: `${basePath}/icons/icon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'business'],
  };
}
