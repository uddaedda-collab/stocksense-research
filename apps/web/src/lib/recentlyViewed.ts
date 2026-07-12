'use client';

const KEY = 'recentlyViewedSymbols';
const MAX_ITEMS = 8;

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(symbol: string): void {
  if (typeof window === 'undefined') return;
  const current = getRecentlyViewed().filter((s) => s !== symbol);
  current.unshift(symbol);
  localStorage.setItem(KEY, JSON.stringify(current.slice(0, MAX_ITEMS)));
}
