import NodeCache from 'node-cache';

// Simple in-memory cache to avoid hammering free upstream data sources and
// to keep the platform responsive on Render's free tier. For a multi-instance
// deployment this would be swapped for a shared cache, but a single free-tier
// instance is the target deployment here.
const cache = new NodeCache({ checkperiod: 120 });

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const existing = cache.get<T>(key);
  if (existing !== undefined) return existing;
  const value = await loader();
  cache.set(key, value, ttlSeconds);
  return value;
}

export function invalidate(key: string): void {
  cache.del(key);
}

export function clearAllCache(): void {
  cache.flushAll();
}
