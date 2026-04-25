import { query } from './db';

// Slow query threshold in milliseconds
const SLOW_QUERY_THRESHOLD = 1000;

// Error ID generator for tracking
function generateErrorId(): string {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validate that query uses parameterized statements
function validateParameterizedQuery(sql: string, params?: unknown[]): void {
  // Check for common SQL injection patterns
  const dangerousPatterns = [
    /\$\{.*\}/,           // Template literals: ${variable}
    /\+\s*['"`]/,         // String concatenation: + "value"
    /['"`]\s*\+/,         // String concatenation: "value" +
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      throw new Error(
        'Potential SQL injection detected: Query appears to use string concatenation instead of parameterized statements'
      );
    }
  }

  // Check if query has placeholders but no params provided
  const placeholderCount = (sql.match(/\?/g) || []).length;
  const paramCount = params?.length || 0;

  if (placeholderCount !== paramCount) {
    throw new Error(
      `Parameter count mismatch: Query has ${placeholderCount} placeholders but ${paramCount} parameters provided`
    );
  }
}

// Log slow queries
function logSlowQuery(sql: string, params: unknown[] | undefined, duration: number): void {
  console.warn(`[SLOW QUERY] Duration: ${duration}ms`);
  console.warn(`SQL: ${sql}`);
  if (params && params.length > 0) {
    console.warn(`Params: ${JSON.stringify(params)}`);
  }
}

// Log query errors with context
function logQueryError(error: Error, sql: string, params: unknown[] | undefined, errorId: string): void {
  console.error(`[DATABASE ERROR] ${errorId}`);
  console.error(`Error: ${error.message}`);
  console.error(`SQL: ${sql}`);
  if (params && params.length > 0) {
    console.error(`Params: ${JSON.stringify(params)}`);
  }
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Stack: ${error.stack}`);
  }
}

/**
 * Safe query wrapper that ensures:
 * - Connection is released after query (success or failure)
 * - Slow queries are logged (threshold: 1000ms)
 * - Parameterized query usage is validated
 * - Errors are logged with context
 * 
 * @param sql - SQL query string with ? placeholders
 * @param params - Array of parameters to bind to placeholders
 * @returns Query result
 * @throws Error if query fails or validation fails
 */
export async function safeQuery<T = unknown>(
  sql: string,
  params?: (string | string[] | number | null | boolean)[]
): Promise<T> {
  const startTime = Date.now();
  const errorId = generateErrorId();

  try {
    // Validate parameterized query usage
    validateParameterizedQuery(sql, params);

    // Execute query - connection is managed by the pool
    const result = await query(sql, params);

    // Check query duration and log if slow
    const duration = Date.now() - startTime;
    if (duration >= SLOW_QUERY_THRESHOLD) {
      logSlowQuery(sql, params, duration);
    }

    return result as T;
  } catch (error) {
    // Log error with context
    logQueryError(error as Error, sql, params, errorId);

    // Re-throw with error ID for tracking
    const enhancedError = new Error(
      `Database query failed [${errorId}]: ${(error as Error).message}`
    );
    enhancedError.stack = (error as Error).stack;
    throw enhancedError;
  }
}

/**
 * Safe query wrapper that returns a result object instead of throwing
 * Useful for cases where you want to handle errors without try-catch
 * 
 * @param sql - SQL query string with ? placeholders
 * @param params - Array of parameters to bind to placeholders
 * @returns Result object with success flag and data or error
 */
export async function safeQueryResult<T = unknown>(
  sql: string,
  params?: (string | string[] | number | null | boolean)[]
): Promise<{ success: true; data: T } | { success: false; error: Error; errorId: string }> {
  const errorId = generateErrorId();

  try {
    const data = await safeQuery<T>(sql, params);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      errorId,
    };
  }
}

export default safeQuery;
