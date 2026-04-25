/**
 * LRU Cache with TTL support for production stability
 * 
 * Features:
 * - LRU (Least Recently Used) eviction when size limit reached
 * - TTL (Time To Live) support for automatic expiration
 * - Cache invalidation methods
 * - Metrics tracking (hit rate, size, evictions)
 * 
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccess: number;
}

interface CacheMetrics {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  expirations: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number; // milliseconds
}

export class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  
  // Metrics
  private hits: number;
  private misses: number;
  private evictions: number;
  private expirations: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  /**
   * Get value from cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.expirations++;
      this.misses++;
      return undefined;
    }

    // Update last access time for LRU
    entry.lastAccess = Date.now();
    
    // Move to end of Map to maintain LRU order
    // Maps maintain insertion order, so we delete and re-insert
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const actualTTL = ttl !== undefined ? ttl : this.defaultTTL;
    
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + actualTTL,
      lastAccess: Date.now(),
    };

    // If key already exists, just update it
    if (this.cache.has(key)) {
      this.cache.set(key, entry);
      return;
    }

    // Check if we need to evict
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.expirations++;
      return false;
    }

    return true;
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate entries matching a pattern
   * Useful for invalidating related cache entries
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Evict the least recently used entry
   * Maps maintain insertion order, so the first entry is the oldest
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    
    if (firstKey !== undefined) {
      this.cache.delete(firstKey);
      this.evictions++;
    }
  }

  /**
   * Clean up expired entries
   * Should be called periodically
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.expirations++;
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimals
      evictions: this.evictions,
      expirations: this.expirations,
    };
  }

  /**
   * Reset metrics counters
   */
  resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instances for common use cases
export const categoryCache = new LRUCache<unknown>({
  maxSize: 100,
  defaultTTL: 10 * 60 * 1000, // 10 minutes for categories
});

export const settingsCache = new LRUCache<unknown>({
  maxSize: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutes for settings
});

// Export for custom cache instances
export default LRUCache;
