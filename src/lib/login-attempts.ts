/**
 * Login Attempt Tracking
 * Prevents brute force attacks by tracking and limiting failed login attempts
 * 
 * Features:
 * - Memory-bounded with LRU eviction (REDUCED to 200 entries for memory efficiency)
 * - Aggressive cleanup on high memory usage
 * - Lifecycle-managed cleanup intervals
 * - Idempotent initialization
 * - Username normalization for consistency
 * - Metrics reporting
 * 
 * MEMORY LEAK FIX: Reduced MAX_MAP_SIZE from 1,000 to 200
 * This prevents excessive memory usage in production (77MB heap)
 * 
 * Requirements: 1.2, 1.6, 7.2, 12.1, 12.2, 12.3, 12.4, 12.5
 */

import lifecycleManager from './lifecycle-manager';

// MEMORY LEAK FIX: Reduced from 1,000 to 200 entries
// With 77MB production heap, 1,000 entries was contributing to memory exhaustion
const MAX_MAP_SIZE = 200;

// Aggressive cleanup threshold - cleanup when map reaches 80% capacity
const CLEANUP_THRESHOLD = Math.floor(MAX_MAP_SIZE * 0.8);

interface LoginAttemptRecord {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
  lastAccess: number;  // For LRU tracking
}

interface LoginTrackerMetrics {
  mapSize: number;
  maxSize: number;
  lockedAccounts: number;
  cleanupCount: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();
let cleanupCount = 0;
let cleanupIntervalId: NodeJS.Timeout | null = null;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const RESET_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Initialize the login tracker (idempotent)
 * Registers cleanup interval with lifecycle manager
 * MEMORY LEAK FIX: More frequent cleanup (every 15 minutes instead of 1 hour)
 */
export function initializeLoginTracker(): void {
  // Prevent duplicate initialization
  if (lifecycleManager.isInitialized('login-tracker')) {
    console.log('[LoginTracker] Already initialized, skipping');
    return;
  }

  // MEMORY LEAK FIX: More frequent cleanup (every 15 minutes instead of 1 hour)
  cleanupIntervalId = setInterval(cleanupLoginAttempts, 15 * 60 * 1000);
  
  // Register with lifecycle manager
  lifecycleManager.registerInterval(cleanupIntervalId, 'login-tracker-cleanup');
  lifecycleManager.markInitialized('login-tracker');
  
  console.log('[LoginTracker] Initialized with 15-minute cleanup interval');
}

/**
 * Evict the oldest entry from the login attempts map
 * Uses LRU (Least Recently Used) strategy based on lastAccess timestamp
 */
function evictOldest(): void {
  if (loginAttempts.size === 0) return;

  let oldestKey: string | null = null;
  let oldestAccess = Infinity;

  // Find the entry with the oldest lastAccess time
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lastAccess < oldestAccess) {
      oldestAccess = record.lastAccess;
      oldestKey = key;
    }
  }

  // Remove the oldest entry
  if (oldestKey) {
    loginAttempts.delete(oldestKey);
  }
}

/**
 * Check if login is allowed for a username
 * MEMORY LEAK FIX: Added aggressive cleanup when map size exceeds threshold
 * @param username - Username attempting to login
 * @returns Object with allowed status and lockout info
 */
export function checkLoginAttempts(username: string): { 
  allowed: boolean; 
  lockedUntil?: number;
  remainingAttempts?: number;
} {
  // MEMORY LEAK FIX: Aggressive cleanup when map is getting full
  if (loginAttempts.size >= CLEANUP_THRESHOLD) {
    console.log(`[LoginTracker] Map size ${loginAttempts.size} exceeds threshold ${CLEANUP_THRESHOLD}, running cleanup...`);
    cleanupLoginAttempts();
  }

  const normalizedUsername = username.toLowerCase().trim();
  const record = loginAttempts.get(normalizedUsername);
  const now = Date.now();
  
  // No record - allow login
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
  
  // Update last access time for LRU tracking
  record.lastAccess = now;
  
  // Check if account is locked
  if (record.lockedUntil && now < record.lockedUntil) {
    return { 
      allowed: false, 
      lockedUntil: record.lockedUntil,
      remainingAttempts: 0,
    };
  }
  
  // Reset if last attempt was more than 1 hour ago
  if (now - record.lastAttempt > RESET_WINDOW) {
    loginAttempts.delete(normalizedUsername);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
  
  // Allow login but track remaining attempts
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.count);
  return { allowed: true, remainingAttempts };
}

/**
 * Record a failed login attempt
 * @param username - Username that failed login
 * @returns Object with lockout status
 */
export function recordFailedLogin(username: string): {
  locked: boolean;
  lockedUntil?: number;
  remainingAttempts: number;
} {
  const normalizedUsername = username.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(normalizedUsername) || { 
    count: 0, 
    lastAttempt: now,
    lastAccess: now,
  };
  
  record.count++;
  record.lastAttempt = now;
  record.lastAccess = now;
  
  // Lock account after max attempts
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    
    // Check if we need to evict before adding
    if (loginAttempts.size >= MAX_MAP_SIZE && !loginAttempts.has(normalizedUsername)) {
      evictOldest();
    }
    
    loginAttempts.set(normalizedUsername, record);
    
    console.warn(`Account locked: ${normalizedUsername} - Too many failed login attempts`);
    
    return {
      locked: true,
      lockedUntil: record.lockedUntil,
      remainingAttempts: 0,
    };
  }
  
  // Check if we need to evict before adding
  if (loginAttempts.size >= MAX_MAP_SIZE && !loginAttempts.has(normalizedUsername)) {
    evictOldest();
  }
  
  loginAttempts.set(normalizedUsername, record);
  
  const remainingAttempts = MAX_ATTEMPTS - record.count;
  console.warn(`Failed login attempt for: ${normalizedUsername} - ${remainingAttempts} attempts remaining`);
  
  return {
    locked: false,
    remainingAttempts,
  };
}

/**
 * Reset login attempts for a username (after successful login)
 * @param username - Username to reset
 */
export function resetLoginAttempts(username: string): void {
  const normalizedUsername = username.toLowerCase().trim();
  loginAttempts.delete(normalizedUsername);
}

/**
 * Clean up old login attempt records
 * Only processes expired entries for efficiency
 * Runs periodically to prevent memory leaks
 */
export function cleanupLoginAttempts(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  // Collect expired keys (only iterate through expired entries)
  for (const [username, record] of loginAttempts.entries()) {
    // Remove records older than reset window and not locked
    if (now - record.lastAttempt > RESET_WINDOW && (!record.lockedUntil || now > record.lockedUntil)) {
      keysToDelete.push(username);
    }
  }

  // Batch delete expired entries
  for (const key of keysToDelete) {
    loginAttempts.delete(key);
  }

  cleanupCount++;
  
  if (keysToDelete.length > 0) {
    console.log(`[LoginTracker] Cleanup #${cleanupCount}: Removed ${keysToDelete.length} expired entries`);
  }
}

/**
 * Get login tracker metrics for monitoring
 * @returns Metrics object with current state
 */
export function getLoginTrackerMetrics(): LoginTrackerMetrics {
  const now = Date.now();
  let lockedAccounts = 0;

  // Count currently locked accounts
  for (const record of loginAttempts.values()) {
    if (record.lockedUntil && now < record.lockedUntil) {
      lockedAccounts++;
    }
  }

  return {
    mapSize: loginAttempts.size,
    maxSize: MAX_MAP_SIZE,
    lockedAccounts,
    cleanupCount,
  };
}

// Auto-initialize on module load
initializeLoginTracker();

// Export for testing
export { loginAttempts, MAX_ATTEMPTS, LOCKOUT_DURATION };
