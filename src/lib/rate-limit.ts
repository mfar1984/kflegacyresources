/**
 * Rate Limiting Utility
 * Prevents brute force attacks by limiting request frequency
 * 
 * Features:
 * - Memory-bounded with LRU eviction (REDUCED to 2,000 entries for memory efficiency)
 * - Aggressive cleanup on high memory usage
 * - Lifecycle-managed cleanup intervals
 * - Idempotent initialization
 * - Metrics reporting
 * 
 * MEMORY LEAK FIX: Reduced MAX_MAP_SIZE from 10,000 to 2,000
 * This prevents excessive memory usage in production (77MB heap)
 * 
 * Requirements: 1.1, 1.6, 7.1, 11.1, 11.2, 11.4, 11.5
 */

import { NextApiRequest, NextApiResponse } from 'next';
import lifecycleManager from './lifecycle-manager';

// MEMORY LEAK FIX: Reduced from 10,000 to 2,000 entries
// With 77MB production heap, 10,000 entries was causing memory exhaustion
const MAX_MAP_SIZE = 2000;

// Aggressive cleanup threshold - cleanup when map reaches 80% capacity
const CLEANUP_THRESHOLD = Math.floor(MAX_MAP_SIZE * 0.8);

interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastAccess: number;  // For LRU tracking
}

interface RateLimiterMetrics {
  mapSize: number;
  maxSize: number;
  cleanupCount: number;
  evictionCount: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
let cleanupCount = 0;
let evictionCount = 0;
let cleanupIntervalId: NodeJS.Timeout | null = null;

export interface RateLimitOptions {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

/**
 * Initialize the rate limiter (idempotent)
 * Registers cleanup interval with lifecycle manager
 * MEMORY LEAK FIX: More frequent cleanup (every 15 minutes instead of 1 hour)
 */
export function initializeRateLimiter(): void {
  // Prevent duplicate initialization
  if (lifecycleManager.isInitialized('rate-limiter')) {
    console.log('[RateLimiter] Already initialized, skipping');
    return;
  }

  // MEMORY LEAK FIX: More frequent cleanup (every 15 minutes instead of 1 hour)
  cleanupIntervalId = setInterval(cleanupRateLimits, 15 * 60 * 1000);
  
  // Register with lifecycle manager
  lifecycleManager.registerInterval(cleanupIntervalId, 'rate-limiter-cleanup');
  lifecycleManager.markInitialized('rate-limiter');
  
  console.log('[RateLimiter] Initialized with 15-minute cleanup interval');
}

/**
 * Evict the oldest entry from the rate limit map
 * Uses LRU (Least Recently Used) strategy based on lastAccess timestamp
 */
function evictOldest(): void {
  if (rateLimitMap.size === 0) return;

  let oldestKey: string | null = null;
  let oldestAccess = Infinity;

  // Find the entry with the oldest lastAccess time
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.lastAccess < oldestAccess) {
      oldestAccess = record.lastAccess;
      oldestKey = key;
    }
  }

  // Remove the oldest entry
  if (oldestKey) {
    rateLimitMap.delete(oldestKey);
    evictionCount++;
  }
}

/**
 * Rate limit middleware for API routes
 * MEMORY LEAK FIX: Added aggressive cleanup when map size exceeds threshold
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param options - Rate limit configuration
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions
): boolean {
  // MEMORY LEAK FIX: Aggressive cleanup when map is getting full
  if (rateLimitMap.size >= CLEANUP_THRESHOLD) {
    console.log(`[RateLimiter] Map size ${rateLimitMap.size} exceeds threshold ${CLEANUP_THRESHOLD}, running cleanup...`);
    cleanupRateLimits();
  }

  // Get client identifier (IP address)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';
  
  const key = `${ip}:${req.url}`;
  const now = Date.now();
  
  const record = rateLimitMap.get(key);
  
  // No record or window expired - allow and create new record
  if (!record || now > record.resetTime) {
    // Check if we need to evict before adding
    if (rateLimitMap.size >= MAX_MAP_SIZE) {
      evictOldest();
    }

    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
      lastAccess: now,
    });
    return true;
  }
  
  // Update last access time for LRU tracking
  record.lastAccess = now;
  
  // Rate limit exceeded
  if (record.count >= options.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.status(429).json({ 
      message: 'Too many requests. Please try again later.',
      retryAfter,
    });
    return false;
  }
  
  // Increment counter and allow
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records
 * Only processes expired entries for efficiency
 * Runs periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // Collect expired keys (only iterate through expired entries)
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  }

  // Batch delete expired entries
  for (const key of keysToDelete) {
    rateLimitMap.delete(key);
  }

  cleanupCount++;
  
  if (keysToDelete.length > 0) {
    console.log(`[RateLimiter] Cleanup #${cleanupCount}: Removed ${keysToDelete.length} expired entries`);
  }
}

/**
 * Get rate limiter metrics for monitoring
 * @returns Metrics object with current state
 */
export function getRateLimiterMetrics(): RateLimiterMetrics {
  return {
    mapSize: rateLimitMap.size,
    maxSize: MAX_MAP_SIZE,
    cleanupCount,
    evictionCount,
  };
}

// Auto-initialize on module load
initializeRateLimiter();

// Export for testing
export { rateLimitMap };
