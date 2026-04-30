// Rate limiter implementation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_MAP_SIZE = 10000;

export function getRateLimiterMetrics() {
  return {
    mapSize: rateLimitMap.size,
    maxSize: MAX_MAP_SIZE,
  };
}

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    const entriesToDelete: string[] = [];
    rateLimitMap.forEach((value, key) => {
      if (value.resetTime < now) {
        entriesToDelete.push(key);
      }
    });
    entriesToDelete.forEach(key => rateLimitMap.delete(key));
  }

  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
