# Database Query Safety Wrapper

## Overview

The `db-safe-query` module provides a safety wrapper around database queries to ensure:
- ✅ Connections are properly released (handled by the pool)
- ✅ Slow queries are logged (threshold: 1000ms)
- ✅ Parameterized query usage is validated
- ✅ Errors are logged with context and unique error IDs
- ✅ SQL injection patterns are detected

## Requirements Satisfied

This implementation satisfies the following requirements from the production-stability spec:

- **Requirement 2.3**: Connection is released after query completion
- **Requirement 8.1**: Validates parameterized query usage
- **Requirement 8.2**: Logs slow queries (threshold: 1000ms)
- **Requirement 8.5**: Ensures connections are closed properly after use

## API

### `safeQuery<T>(sql: string, params?: Array): Promise<T>`

Executes a database query with safety checks. Throws an error if the query fails.

**Parameters:**
- `sql` - SQL query string with `?` placeholders
- `params` - Array of parameters to bind to placeholders (optional)

**Returns:** Query result

**Throws:** Error with unique error ID if query fails or validation fails

**Example:**
```typescript
import { safeQuery } from './db-safe-query';

const users = await safeQuery<Array<User>>(
  'SELECT * FROM users WHERE age > ? AND active = ?',
  [18, true]
);
```

### `safeQueryResult<T>(sql: string, params?: Array): Promise<Result>`

Executes a database query and returns a result object instead of throwing.

**Parameters:**
- `sql` - SQL query string with `?` placeholders
- `params` - Array of parameters to bind to placeholders (optional)

**Returns:** 
- `{ success: true, data: T }` on success
- `{ success: false, error: Error, errorId: string }` on failure

**Example:**
```typescript
import { safeQueryResult } from './db-safe-query';

const result = await safeQueryResult<Array<User>>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

if (!result.success) {
  console.error('Query failed:', result.errorId);
  return;
}

const users = result.data;
```

## Features

### 1. SQL Injection Detection

The wrapper validates queries to detect common SQL injection patterns:

❌ **Bad - Template literals:**
```typescript
await safeQuery(`SELECT * FROM users WHERE name = ${name}`);
// Throws: "Potential SQL injection detected"
```

❌ **Bad - String concatenation:**
```typescript
await safeQuery('SELECT * FROM users WHERE name = "' + name + '"');
// Throws: "Potential SQL injection detected"
```

✅ **Good - Parameterized query:**
```typescript
await safeQuery('SELECT * FROM users WHERE name = ?', [name]);
```

### 2. Parameter Count Validation

The wrapper ensures the number of placeholders matches the number of parameters:

❌ **Bad - Mismatch:**
```typescript
await safeQuery('SELECT * FROM users WHERE id = ? AND name = ?', [1]);
// Throws: "Parameter count mismatch: Query has 2 placeholders but 1 parameters provided"
```

✅ **Good - Match:**
```typescript
await safeQuery('SELECT * FROM users WHERE id = ? AND name = ?', [1, 'John']);
```

### 3. Slow Query Logging

Queries that take longer than 1000ms are automatically logged:

```
[SLOW QUERY] Duration: 1523ms
SQL: SELECT * FROM orders JOIN order_items ON orders.id = order_items.order_id
Params: [123]
```

### 4. Error Logging with Context

All errors are logged with:
- Unique error ID for tracking
- SQL query that failed
- Parameters used
- Stack trace (in development only)

```
[DATABASE ERROR] ERR-1713892345678-abc123xyz
Error: Connection lost
SQL: SELECT * FROM users WHERE id = ?
Params: [1]
Stack: Error: Connection lost
    at query (db.ts:45:11)
    ...
```

### 5. Connection Management

The wrapper uses the connection pool from `db.ts`, which automatically:
- Acquires connections from the pool
- Releases connections after query completion
- Handles connection timeouts
- Manages connection limits

## Usage in API Endpoints

### Pattern 1: Try-Catch (Recommended for simple cases)

```typescript
import { safeQuery } from '@/lib/db-safe-query';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await safeQuery<Array<User>>(
      'SELECT * FROM users WHERE active = ?',
      [true]
    );
    
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    // Error is already logged by safeQuery
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
}
```

### Pattern 2: Result Object (Recommended for complex error handling)

```typescript
import { safeQueryResult } from '@/lib/db-safe-query';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await safeQueryResult<Array<User>>(
    'SELECT * FROM users WHERE active = ?',
    [true]
  );
  
  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      errorId: result.errorId 
    });
  }
  
  return res.status(200).json({ success: true, data: result.data });
}
```

## Migration Guide

### Before (using `query` directly):

```typescript
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
}
```

### After (using `safeQuery`):

```typescript
import { safeQuery } from '@/lib/db-safe-query';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await safeQuery<Array<User>>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    // Error is already logged with context and error ID
    return res.status(500).json({ success: false, message: 'Database error' });
  }
}
```

**Benefits:**
- ✅ Automatic SQL injection detection
- ✅ Parameter count validation
- ✅ Slow query logging
- ✅ Structured error logging with unique IDs
- ✅ Production-safe error messages (no stack traces)

## Best Practices

1. **Always use parameterized queries:**
   ```typescript
   // Good
   await safeQuery('SELECT * FROM users WHERE name = ?', [name]);
   
   // Bad
   await safeQuery(`SELECT * FROM users WHERE name = '${name}'`);
   ```

2. **Use TypeScript generics for type safety:**
   ```typescript
   interface User { id: number; name: string; email: string; }
   const users = await safeQuery<Array<User>>('SELECT * FROM users');
   ```

3. **Handle errors appropriately:**
   ```typescript
   try {
     const result = await safeQuery('SELECT * FROM users');
     // Process result
   } catch (error) {
     // Error is already logged, just handle the response
     return res.status(500).json({ success: false, message: 'Failed' });
   }
   ```

4. **Use `safeQueryResult` for complex error handling:**
   ```typescript
   const result = await safeQueryResult('SELECT * FROM users');
   if (!result.success) {
     // Handle specific error cases
     if (result.error.message.includes('Connection')) {
       // Handle connection error
     }
   }
   ```

## Testing

The module includes comprehensive unit tests in `db-safe-query.test.ts` that verify:
- ✅ Successful query execution with parameters
- ✅ Successful query execution without parameters
- ✅ Slow query logging
- ✅ SQL injection detection (template literals)
- ✅ SQL injection detection (string concatenation)
- ✅ Parameter count validation
- ✅ Error logging with context
- ✅ Error ID generation
- ✅ Production-safe error messages (no stack traces)
- ✅ Various parameter types (string, number, boolean, null, arrays)

## Performance

The safety wrapper adds minimal overhead:
- **Validation**: ~0.1ms (regex checks + parameter counting)
- **Logging**: Only on errors or slow queries
- **Connection management**: Handled by the pool (no additional overhead)

## Troubleshooting

### "Potential SQL injection detected"

**Cause:** Query uses string concatenation or template literals

**Solution:** Use parameterized queries with `?` placeholders

### "Parameter count mismatch"

**Cause:** Number of `?` placeholders doesn't match number of parameters

**Solution:** Ensure each `?` has a corresponding parameter in the array

### Slow query warnings

**Cause:** Query takes longer than 1000ms

**Solution:** 
- Add indexes to frequently queried columns
- Optimize JOIN operations
- Use EXPLAIN to analyze query execution plan
- Consider caching for frequently accessed data

## See Also

- `db.ts` - Database connection pool configuration
- `db-safe-query-example.ts` - Usage examples
- `.kiro/specs/production-stability/` - Full specification
