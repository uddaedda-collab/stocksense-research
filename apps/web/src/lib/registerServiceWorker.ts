'use client';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  // Skip in local dev to avoid caching issues while iterating.
  if (process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed:', err);
    });
  });
}
