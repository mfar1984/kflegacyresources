/**
 * API Error Handling Wrapper
 * 
 * Provides a Higher-Order Function (HOF) that wraps API handlers with:
 * - Comprehensive error catching
 * - Appropriate HTTP status code mapping
 * - Error logging with context (URL, method, params)
 * - Unique error ID in responses
 * - Sensitive data hiding in production
 * 
 * Requirements: 5.1, 5.2, 5.5, 5.6
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { logError, generateErrorId } from './error-handler';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * API Handler function type
 */
export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

/**
 * Error response format
 */
interface ErrorResponse {
  success: false;
  message: string;
  errorId: string;
  timestamp: string;
  stack?: string;
  details?: unknown;
}

/**
 * Map error types to HTTP status codes
 */
function getStatusCodeForError(error: Error): number {
  const errorMessage = error.message.toLowerCase();

  // Authentication errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('not authenticated')) {
    return 401;
  }

  // Authorization errors
  if (errorMessage.includes('forbidden') || errorMessage.includes('not authorized')) {
    return 403;
  }

  // Not found errors
  if (errorMessage.includes('not found')) {
    return 404;
  }

  // Validation errors
  if (errorMessage.includes('invalid') || 
      errorMessage.includes('required') || 
      errorMessage.includes('validation')) {
    return 400;
  }

  // Rate limiting errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 429;
  }

  // Timeout errors
  if (errorMessage.includes('timeout')) {
    return 408;
  }

  // Default to 500 for unknown errors
  return 500;
}

/**
 * Extract request context for logging
 */
function extractRequestContext(req: NextApiRequest): Record<string, unknown> {
  const context: Record<string, unknown> = {
    url: req.url,
    method: req.method,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };

  // Add query params (but redact sensitive ones)
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = { ...req.query };
    const sensitiveParams = ['token', 'password', 'secret', 'apiKey'];
    
    for (const param of sensitiveParams) {
      if (param in sanitizedQuery) {
        sanitizedQuery[param] = '[REDACTED]';
      }
    }
    
    context.query = sanitizedQuery;
  }

  // Add body info (but don't include actual body to avoid logging sensitive data)
  if (req.body && typeof req.body === 'object') {
    context.bodyKeys = Object.keys(req.body);
  }

  return context;
}

/**
 * Format error response with appropriate details based on environment
 */
function formatErrorResponse(error: Error, errorId: string, statusCode: number): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    message: isProduction 
      ? 'An error occurred. Please contact support with the error ID.'
      : error.message,
    errorId,
    timestamp: new Date().toISOString(),
  };

  // Only include stack trace and details in development
  if (!isProduction) {
    response.stack = error.stack;
    response.details = {
      name: error.name,
      statusCode,
    };
  }

  return response;
}

/**
 * Higher-Order Function that wraps API handlers with error handling
 * 
 * Usage:
 * ```typescript
 * export default withErrorHandling(async (req, res) => {
 *   // Your API logic here
 *   // Any errors will be caught and handled automatically
 * });
 * ```
 * 
 * @param handler - The API handler function to wrap
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Execute the wrapped handler
      await handler(req, res);
    } catch (error) {
      // Ensure error is an Error object
      const err = error instanceof Error ? error : new Error(String(error));

      // Extract request context for logging
      const context = extractRequestContext(req);

      // Log the error with context
      const errorId = logError(err, context);

      // Determine appropriate HTTP status code
      const statusCode = getStatusCodeForError(err);

      // Format error response
      const errorResponse = formatErrorResponse(err, errorId, statusCode);

      // Log additional info in development
      if (!isProduction) {
        console.error('API Error Details:', {
          errorId,
          statusCode,
          url: req.url,
          method: req.method,
          error: err.message,
        });
      }

      // Send error response
      // Check if response has already been sent
      if (!res.headersSent) {
        res.status(statusCode).json(errorResponse);
      } else {
        console.error('Cannot send error response - headers already sent', {
          errorId,
          url: req.url,
        });
      }
    }
  };
}

/**
 * Create a custom API error with specific status code
 * Useful for throwing errors with specific HTTP status codes
 * 
 * Usage:
 * ```typescript
 * throw createApiError('User not found', 404);
 * throw createApiError('Invalid input', 400);
 * ```
 */
export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper function to create API errors
 */
export function createApiError(message: string, statusCode: number = 500): ApiError {
  return new ApiError(message, statusCode);
}

/**
 * Common API error creators for convenience
 */
export const ApiErrors = {
  unauthorized: (message = 'Unauthorized') => createApiError(message, 401),
  forbidden: (message = 'Forbidden') => createApiError(message, 403),
  notFound: (message = 'Not found') => createApiError(message, 404),
  badRequest: (message = 'Bad request') => createApiError(message, 400),
  rateLimit: (message = 'Too many requests') => createApiError(message, 429),
  timeout: (message = 'Request timeout') => createApiError(message, 408),
  internal: (message = 'Internal server error') => createApiError(message, 500),
};
