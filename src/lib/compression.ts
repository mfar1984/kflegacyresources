/**
 * Response Compression Middleware
 * 
 * Wraps API handlers to compress large responses (>1KB) using gzip or deflate.
 * Reduces bandwidth usage and improves response times for large payloads.
 * 
 * Requirements: 15.5
 * 
 * ## Usage Examples
 * 
 * ### Basic Usage (Default Settings)
 * ```typescript
 * import { withDefaultCompression } from '@/lib/compression';
 * 
 * async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const data = await fetchLargeDataset();
 *   return res.status(200).json({ success: true, data });
 * }
 * 
 * export default withDefaultCompression(handler);
 * ```
 * 
 * ### Custom Configuration
 * ```typescript
 * import { withCompression } from '@/lib/compression';
 * 
 * export default withCompression(handler, {
 *   threshold: 2048,  // Only compress responses >2KB
 *   level: 9,         // Maximum compression
 *   preferGzip: true  // Prefer gzip over deflate
 * });
 * ```
 * 
 * ### Combining with Other Middleware
 * ```typescript
 * import { withDefaultCompression } from '@/lib/compression';
 * import { withDefaultTimeout } from '@/lib/request-timeout';
 * 
 * // Apply timeout first, then compression
 * export default withDefaultCompression(withDefaultTimeout(handler));
 * ```
 * 
 * ### Pre-configured Variants
 * ```typescript
 * import { 
 *   withHighCompression,      // Level 9 - maximum compression
 *   withFastCompression,      // Level 1 - fastest
 *   withAggressiveCompression // 512 byte threshold
 * } from '@/lib/compression';
 * 
 * // For large reports/exports
 * export default withHighCompression(handler);
 * 
 * // For real-time APIs
 * export default withFastCompression(handler);
 * ```
 * 
 * ## How It Works
 * 
 * 1. Checks if client supports gzip or deflate (Accept-Encoding header)
 * 2. Intercepts res.json() and res.send() calls
 * 3. Converts response to buffer and checks size
 * 4. If size > threshold, compresses using gzip or deflate
 * 5. Only uses compressed version if it's actually smaller
 * 6. Sets appropriate Content-Encoding and Content-Length headers
 * 7. Falls back to uncompressed if compression fails
 * 
 * ## Performance Notes
 * 
 * - Responses <1KB are not compressed (overhead not worth it)
 * - Compression is skipped if client doesn't support it
 * - Level 6 (default) provides good balance of speed vs size
 * - Level 9 gives best compression but is slower
 * - Level 1 is fastest but larger output
 * - Gzip is preferred as it's more widely supported
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { gzip, deflate } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

export interface CompressionConfig {
  threshold?: number;        // Minimum size in bytes to compress (default: 1024 = 1KB)
  level?: number;            // Compression level 0-9 (default: 6)
  preferGzip?: boolean;      // Prefer gzip over deflate (default: true)
}

const DEFAULT_THRESHOLD = 1024;  // 1KB
const DEFAULT_LEVEL = 6;         // Balanced compression

/**
 * Wrap an API handler with response compression
 * 
 * @param handler - The Next.js API handler to wrap
 * @param config - Compression configuration options
 * @returns Wrapped handler with compression support
 * 
 * @example
 * ```typescript
 * export default withCompression(async (req, res) => {
 *   return res.status(200).json({ data: largeDataset });
 * });
 * ```
 */
export function withCompression(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  config: CompressionConfig = {}
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  const threshold = config.threshold ?? DEFAULT_THRESHOLD;
  const level = config.level ?? DEFAULT_LEVEL;
  const preferGzip = config.preferGzip ?? true;

  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalEnd = res.end.bind(res);

    // Check if client accepts compression
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsDeflate = acceptEncoding.includes('deflate');

    // Determine compression method
    let compressionMethod: 'gzip' | 'deflate' | null = null;
    if (preferGzip && supportsGzip) {
      compressionMethod = 'gzip';
    } else if (supportsDeflate) {
      compressionMethod = 'deflate';
    } else if (supportsGzip) {
      compressionMethod = 'gzip';
    }

    /**
     * Compress data if it meets threshold
     */
    const compressData = async (data: Buffer | string): Promise<Buffer | string> => {
      // Convert to buffer if string
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

      // Skip compression if below threshold
      if (buffer.length < threshold) {
        return data;
      }

      // Skip compression if client doesn't support it
      if (!compressionMethod) {
        return data;
      }

      try {
        let compressed: Buffer;

        if (compressionMethod === 'gzip') {
          compressed = await gzipAsync(buffer, { level });
          res.setHeader('Content-Encoding', 'gzip');
        } else {
          compressed = await deflateAsync(buffer, { level });
          res.setHeader('Content-Encoding', 'deflate');
        }

        // Only use compressed version if it's actually smaller
        if (compressed.length < buffer.length) {
          res.setHeader('Content-Length', compressed.length.toString());
          return compressed;
        }

        // If compressed is larger, return original
        return data;

      } catch (error) {
        console.error('Compression error:', error);
        // Return original data if compression fails
        return data;
      }
    };

    /**
     * Override res.json to add compression
     */
    res.json = function (body: any): NextApiResponse {
      // Convert to JSON string
      const jsonString = JSON.stringify(body);

      // Set content type
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      // Compress and send
      compressData(jsonString).then((data) => {
        if (Buffer.isBuffer(data)) {
          originalEnd(data);
        } else {
          originalSend(data);
        }
      }).catch((error) => {
        console.error('Error in compression middleware:', error);
        originalSend(jsonString);
      });

      return res;
    } as any;

    /**
     * Override res.send to add compression
     */
    res.send = function (body: any): NextApiResponse {
      // Compress and send
      compressData(body).then((data) => {
        originalSend(data);
      }).catch((error) => {
        console.error('Error in compression middleware:', error);
        originalSend(body);
      });

      return res;
    } as any;

    // Execute the handler
    await handler(req, res);
  };
}

/**
 * Create a compression middleware with custom configuration
 * Useful for applying the same compression config to multiple handlers
 * 
 * @param config - Compression configuration options
 * @returns Function that wraps handlers with the specified config
 * 
 * @example
 * ```typescript
 * const withHighCompression = createCompressionMiddleware({ level: 9 });
 * 
 * export default withHighCompression(async (req, res) => {
 *   // Handler with maximum compression
 * });
 * ```
 */
export function createCompressionMiddleware(config: CompressionConfig) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return withCompression(handler, config);
  };
}

/**
 * Default compression middleware with standard configuration
 * 1KB threshold, level 6 compression, prefers gzip
 */
export const withDefaultCompression = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => withCompression(handler, {});

/**
 * High compression middleware for large responses
 * 1KB threshold, level 9 compression (maximum)
 */
export const withHighCompression = createCompressionMiddleware({
  threshold: 1024,
  level: 9,
});

/**
 * Fast compression middleware for quick responses
 * 1KB threshold, level 1 compression (fastest)
 */
export const withFastCompression = createCompressionMiddleware({
  threshold: 1024,
  level: 1,
});

/**
 * Aggressive compression middleware with lower threshold
 * 512 bytes threshold, level 6 compression
 */
export const withAggressiveCompression = createCompressionMiddleware({
  threshold: 512,
  level: 6,
});
