/**
 * Request Timeout Middleware
 * 
 * Wraps API handlers with timeout enforcement to prevent hanging requests.
 * Logs slow requests and returns 408 Request Timeout when exceeded.
 * 
 * Requirements: 15.2, 15.3
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { logError } from './error-handler';

export interface TimeoutConfig {
  timeoutMs?: number;        // Default: 30000 (30 seconds)
  slowRequestMs?: number;    // Default: 5000 (5 seconds)
  onTimeout?: (req: NextApiRequest) => void;
  onSlowRequest?: (req: NextApiRequest, duration: number) => void;
}

const DEFAULT_TIMEOUT_MS = 30000;      // 30 seconds
const DEFAULT_SLOW_REQUEST_MS = 5000;  // 5 seconds

/**
 * Wrap an API handler with timeout enforcement
 * 
 * @param handler - The Next.js API handler to wrap
 * @param config - Timeout configuration options
 * @returns Wrapped handler with timeout enforcement
 * 
 * @example
 * ```typescript
 * export default withTimeout(async (req, res) => {
 *   // Your handler logic
 * }, { timeoutMs: 10000 });
 * ```
 */
export function withTimeout(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  config: TimeoutConfig = {}
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const slowRequestMs = config.slowRequestMs ?? DEFAULT_SLOW_REQUEST_MS;

  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | null = null;
    let hasTimedOut = false;
    let hasCompleted = false;

    // Create timeout promise
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        hasTimedOut = true;
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });

    // Create handler promise
    const handlerPromise = handler(req, res).then(() => {
      hasCompleted = true;
    });

    try {
      // Race between handler and timeout
      await Promise.race([handlerPromise, timeoutPromise]);

      // Clear timeout if handler completed first
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Check if request was slow (but didn't timeout)
      const duration = Date.now() - startTime;
      if (duration > slowRequestMs && !hasTimedOut) {
        const logMessage = `Slow request detected: ${req.method} ${req.url} took ${duration}ms`;
        console.warn(logMessage, {
          method: req.method,
          url: req.url,
          duration,
          threshold: slowRequestMs,
          timestamp: new Date().toISOString(),
        });

        // Call custom slow request handler if provided
        if (config.onSlowRequest) {
          config.onSlowRequest(req, duration);
        }
      }

    } catch (error) {
      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle timeout
      if (hasTimedOut && !hasCompleted) {
        const duration = Date.now() - startTime;
        
        // Log timeout error
        const timeoutError = new Error(`Request timeout after ${duration}ms`);
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.socket.remoteAddress;
        logError(timeoutError, {
          method: req.method,
          url: req.url,
          duration,
          timeout: timeoutMs,
          ip,
        });

        // Call custom timeout handler if provided
        if (config.onTimeout) {
          config.onTimeout(req);
        }

        // Return 408 Request Timeout if response hasn't been sent
        if (!res.headersSent) {
          return res.status(408).json({
            success: false,
            message: 'Request timeout - the server took too long to respond',
            timeout: timeoutMs,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Re-throw non-timeout errors
        throw error;
      }
    }
  };
}

/**
 * Create a timeout middleware with custom configuration
 * Useful for applying the same timeout config to multiple handlers
 * 
 * @param config - Timeout configuration options
 * @returns Function that wraps handlers with the specified config
 * 
 * @example
 * ```typescript
 * const withShortTimeout = createTimeoutMiddleware({ timeoutMs: 5000 });
 * 
 * export default withShortTimeout(async (req, res) => {
 *   // Handler with 5 second timeout
 * });
 * ```
 */
export function createTimeoutMiddleware(config: TimeoutConfig) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return withTimeout(handler, config);
  };
}

/**
 * Default timeout middleware with standard configuration
 * 30 second timeout, 5 second slow request threshold
 */
export const withDefaultTimeout = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => withTimeout(handler, {});

/**
 * Short timeout middleware for quick operations
 * 10 second timeout, 2 second slow request threshold
 */
export const withShortTimeout = createTimeoutMiddleware({
  timeoutMs: 10000,
  slowRequestMs: 2000,
});

/**
 * Long timeout middleware for heavy operations (backups, reports)
 * 60 second timeout, 10 second slow request threshold
 */
export const withLongTimeout = createTimeoutMiddleware({
  timeoutMs: 60000,
  slowRequestMs: 10000,
});
