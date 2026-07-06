import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function buildCacheKey(query: string, location?: string): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const loc = location?.toLowerCase().trim() || '';
  return `search:${normalized}:${loc}`;
}
