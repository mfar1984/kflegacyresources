/**
 * Global Error Handler
 * 
 * Prevents Node.js process crashes from unhandled errors.
 * Provides comprehensive error logging with context.
 * Hides sensitive data in production environments.
 * 
 * Requirements: 5.3, 5.4, 5.5, 5.6, 9.2, 9.5
 */

import lifecycleManager from './lifecycle-manager';

export interface ErrorHandlerConfig {
  logToFile: boolean;
  logPath?: string;
  exitOnUncaughtException: boolean;
  gracefulShutdownTimeout: number;
}

interface ErrorContext {
  url?: string;
  method?: string;
  userId?: string;
  ip?: string;
  [key: string]: unknown;
}

interface ErrorLog {
  errorId: string;
  timestamp: string;
  level: 'warn' | 'error' | 'fatal';
  message: string;
  stack?: string;
  context: ErrorContext;
}

const isProduction = process.env.NODE_ENV === 'production';
let isInitialized = false;
let config: ErrorHandlerConfig;

/**
 * Generate a unique error ID for tracking
 * Uses timestamp + random string for uniqueness
 */
export function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Log error with context and unique ID
 * Redacts sensitive information in production
 */
export function logError(error: Error, context?: ErrorContext): string {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();
  
  const errorLog: ErrorLog = {
    errorId,
    timestamp,
    level: 'error',
    message: error.message,
    stack: isProduction ? undefined : error.stack,
    context: context || {},
  };

  // Redact sensitive data in production
  if (isProduction && errorLog.context) {
    // Remove potential sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'connectionString'];
    for (const field of sensitiveFields) {
      if (field in errorLog.context) {
        errorLog.context[field] = '[REDACTED]';
      }
    }
  }

  // Log to console
  console.error('Error occurred:', JSON.stringify(errorLog, null, 2));

  // TODO: Log to file if configured (Requirement 9.6)
  if (config?.logToFile && config.logPath) {
    // File logging would be implemented here
    // For now, just console logging
  }

  return errorId;
}

/**
 * Handle unhandled promise rejections
 * Logs the error and continues (doesn't crash)
 */
function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  
  logError(error, {
    type: 'unhandledRejection',
    promise: String(promise),
  });

  console.error('Unhandled Promise Rejection - Process will continue');
}

/**
 * Handle uncaught exceptions
 * Logs the error, attempts graceful shutdown, then exits
 */
function handleUncaughtException(error: Error): void {
  const errorId = logError(error, {
    type: 'uncaughtException',
    fatal: true,
  });

  console.error(`Fatal uncaught exception (${errorId}) - Attempting graceful shutdown`);

  if (config?.exitOnUncaughtException) {
    // Attempt graceful shutdown
    lifecycleManager.cleanup()
      .then(() => {
        console.error('Graceful shutdown completed - Exiting process');
        process.exit(1);
      })
      .catch((cleanupError) => {
        console.error('Graceful shutdown failed:', cleanupError);
        process.exit(1);
      });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('Graceful shutdown timeout - Forcing exit');
      process.exit(1);
    }, config.gracefulShutdownTimeout);
  }
}

/**
 * Initialize global error handlers
 * Should be called once at application startup
 */
export function initializeErrorHandlers(userConfig: ErrorHandlerConfig): void {
  if (isInitialized) {
    console.warn('Error handlers already initialized - skipping');
    return;
  }

  config = userConfig;

  // Register unhandled rejection handler
  process.on('unhandledRejection', handleUnhandledRejection);

  // Register uncaught exception handler
  process.on('uncaughtException', handleUncaughtException);

  isInitialized = true;

  console.log('Global error handlers initialized', {
    environment: isProduction ? 'production' : 'development',
    exitOnUncaughtException: config.exitOnUncaughtException,
    gracefulShutdownTimeout: config.gracefulShutdownTimeout,
  });
}

/**
 * Format error response for API endpoints
 * Hides sensitive details in production
 */
export function formatErrorResponse(error: Error, context?: ErrorContext): {
  success: false;
  message: string;
  errorId: string;
  timestamp: string;
  stack?: string;
  details?: unknown;
} {
  const errorId = logError(error, context);

  return {
    success: false,
    message: isProduction 
      ? 'An error occurred. Please contact support with the error ID.'
      : error.message,
    errorId,
    timestamp: new Date().toISOString(),
    // Only include stack trace in development
    stack: isProduction ? undefined : error.stack,
    // Only include details in development
    details: isProduction ? undefined : context,
  };
}
