/**
 * Lifecycle Manager
 * 
 * Central registry for all periodic timers and cleanup operations.
 * Prevents memory leaks by tracking intervals/timeouts and ensuring proper cleanup on shutdown.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6
 */

export type CleanupFunction = () => void | Promise<void>;

interface TimerEntry {
  id: NodeJS.Timeout;
  name: string;
  type: 'interval' | 'timeout';
  createdAt: Date;
}

interface CleanupEntry {
  fn: CleanupFunction;
  name: string;
  registeredAt: Date;
}

interface LifecycleMetrics {
  intervals: number;
  timeouts: number;
  cleanupFunctions: number;
  initializedModules: string[];
}

class LifecycleManager {
  private timers: Map<string, TimerEntry> = new Map();
  private cleanupFunctions: Map<string, CleanupEntry> = new Map();
  private initializedModules: Set<string> = new Set();
  private isShuttingDown: boolean = false;

  /**
   * Register an interval for cleanup
   * @param interval - The interval timer to track
   * @param name - Descriptive name for logging
   */
  registerInterval(interval: NodeJS.Timeout, name: string): void {
    if (this.isShuttingDown) {
      console.warn(`[LifecycleManager] Cannot register interval "${name}" during shutdown`);
      return;
    }

    this.timers.set(name, {
      id: interval,
      name,
      type: 'interval',
      createdAt: new Date(),
    });

    console.log(`[LifecycleManager] Registered interval: ${name}`);
  }

  /**
   * Register a timeout for cleanup
   * @param timeout - The timeout timer to track
   * @param name - Descriptive name for logging
   */
  registerTimeout(timeout: NodeJS.Timeout, name: string): void {
    if (this.isShuttingDown) {
      console.warn(`[LifecycleManager] Cannot register timeout "${name}" during shutdown`);
      return;
    }

    this.timers.set(name, {
      id: timeout,
      name,
      type: 'timeout',
      createdAt: new Date(),
    });

    console.log(`[LifecycleManager] Registered timeout: ${name}`);
  }

  /**
   * Register a custom cleanup function
   * @param fn - The cleanup function to execute on shutdown
   * @param name - Descriptive name for logging
   */
  registerCleanup(fn: CleanupFunction, name: string): void {
    if (this.isShuttingDown) {
      console.warn(`[LifecycleManager] Cannot register cleanup "${name}" during shutdown`);
      return;
    }

    this.cleanupFunctions.set(name, {
      fn,
      name,
      registeredAt: new Date(),
    });

    console.log(`[LifecycleManager] Registered cleanup function: ${name}`);
  }

  /**
   * Check if a module has already been initialized
   * @param moduleName - Name of the module to check
   * @returns true if module is already initialized
   */
  isInitialized(moduleName: string): boolean {
    return this.initializedModules.has(moduleName);
  }

  /**
   * Mark a module as initialized to prevent duplicate initialization
   * @param moduleName - Name of the module to mark
   */
  markInitialized(moduleName: string): void {
    if (this.initializedModules.has(moduleName)) {
      console.warn(`[LifecycleManager] Module "${moduleName}" is already initialized`);
      return;
    }

    this.initializedModules.add(moduleName);
    console.log(`[LifecycleManager] Marked module as initialized: ${moduleName}`);
  }

  /**
   * Clean up all registered resources
   * Clears all timers and executes all cleanup functions
   */
  async cleanup(): Promise<void> {
    if (this.isShuttingDown) {
      console.warn('[LifecycleManager] Cleanup already in progress');
      return;
    }

    this.isShuttingDown = true;
    console.log('[LifecycleManager] Starting cleanup...');

    // Clear all timers
    let clearedTimers = 0;
    for (const [name, entry] of this.timers.entries()) {
      try {
        if (entry.type === 'interval') {
          clearInterval(entry.id);
        } else {
          clearTimeout(entry.id);
        }
        clearedTimers++;
        console.log(`[LifecycleManager] Cleared ${entry.type}: ${name}`);
      } catch (error) {
        console.error(`[LifecycleManager] Error clearing ${entry.type} "${name}":`, error);
      }
    }
    this.timers.clear();

    // Execute all cleanup functions
    let executedCleanups = 0;
    for (const [name, entry] of this.cleanupFunctions.entries()) {
      try {
        await entry.fn();
        executedCleanups++;
        console.log(`[LifecycleManager] Executed cleanup function: ${name}`);
      } catch (error) {
        console.error(`[LifecycleManager] Error executing cleanup "${name}":`, error);
      }
    }
    this.cleanupFunctions.clear();

    console.log(`[LifecycleManager] Cleanup complete. Cleared ${clearedTimers} timers, executed ${executedCleanups} cleanup functions`);
  }

  /**
   * Get metrics about registered resources
   * @returns Object containing counts of registered resources
   */
  getMetrics(): LifecycleMetrics {
    const intervals = Array.from(this.timers.values()).filter(t => t.type === 'interval').length;
    const timeouts = Array.from(this.timers.values()).filter(t => t.type === 'timeout').length;

    return {
      intervals,
      timeouts,
      cleanupFunctions: this.cleanupFunctions.size,
      initializedModules: Array.from(this.initializedModules),
    };
  }

  /**
   * Reset the lifecycle manager (primarily for testing)
   * WARNING: This does not clear timers, only the internal state
   */
  reset(): void {
    this.timers.clear();
    this.cleanupFunctions.clear();
    this.initializedModules.clear();
    this.isShuttingDown = false;
  }
}

// Singleton instance
const lifecycleManager = new LifecycleManager();

export default lifecycleManager;
