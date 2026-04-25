# API Error Handler

Comprehensive error handling wrapper for Next.js API routes.

## Features

- ✅ Catches all errors automatically
- ✅ Maps errors to appropriate HTTP status codes
- ✅ Logs errors with context (URL, method, IP, query params)
- ✅ Generates unique error IDs for tracking
- ✅ Hides sensitive data in production
- ✅ Provides consistent error response format
- ✅ Prevents process crashes from unhandled errors

## Basic Usage

### Wrap Your API Handler

```typescript
import { withErrorHandling } from '@/lib/api-error-handler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your API logic here
  // Any errors will be caught automatically
  
  const data = await someOperation();
  
  return res.status(200).json({
    success: true,
    data
  });
}

// Export with error handling wrapper
export default withErrorHandling(handler);
```

### Throw Specific Errors

```typescript
import { withErrorHandling, ApiErrors } from '@/lib/api-error-handler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    throw ApiErrors.badRequest('ID is required');
  }
  
  const user = await findUser(id);
  
  if (!user) {
    throw ApiErrors.notFound('User not found');
  }
  
  if (!hasPermission(user)) {
    throw ApiErrors.forbidden('You do not have permission');
  }
  
  return res.status(200).json({
    success: true,
    user
  });
}

export default withErrorHandling(handler);
```

## Available Error Helpers

```typescript
import { ApiErrors } from '@/lib/api-error-handler';

// 400 Bad Request
throw ApiErrors.badRequest('Invalid input');

// 401 Unauthorized
throw ApiErrors.unauthorized('You must be logged in');

// 403 Forbidden
throw ApiErrors.forbidden('Access denied');

// 404 Not Found
throw ApiErrors.notFound('Resource not found');

// 408 Request Timeout
throw ApiErrors.timeout('Request took too long');

// 429 Too Many Requests
throw ApiErrors.rateLimit('Too many requests');

// 500 Internal Server Error
throw ApiErrors.internal('Something went wrong');
```

## Custom Error with Status Code

```typescript
import { createApiError } from '@/lib/api-error-handler';

// Create custom error with specific status code
throw createApiError('Payment failed', 402);
throw createApiError('Service unavailable', 503);
```

## Error Response Format

### Development Environment

```json
{
  "success": false,
  "message": "User not found",
  "errorId": "ERR-ABC123-XYZ789",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "stack": "Error: User not found\n    at handler (/api/users.ts:10:11)",
  "details": {
    "name": "ApiError",
    "statusCode": 404
  }
}
```

### Production Environment

```json
{
  "success": false,
  "message": "An error occurred. Please contact support with the error ID.",
  "errorId": "ERR-ABC123-XYZ789",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Automatic Status Code Mapping

The wrapper automatically maps error messages to appropriate HTTP status codes:

| Error Message Contains | Status Code | Meaning |
|------------------------|-------------|---------|
| "unauthorized", "not authenticated" | 401 | Unauthorized |
| "forbidden", "not authorized" | 403 | Forbidden |
| "not found" | 404 | Not Found |
| "invalid", "required", "validation" | 400 | Bad Request |
| "rate limit", "too many requests" | 429 | Too Many Requests |
| "timeout" | 408 | Request Timeout |
| (default) | 500 | Internal Server Error |

## Error Logging

All errors are automatically logged with context:

```typescript
{
  errorId: "ERR-ABC123-XYZ789",
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "error",
  message: "User not found",
  stack: "...",  // Only in development
  context: {
    url: "/api/users",
    method: "GET",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    query: { id: "123" },
    bodyKeys: ["name", "email"]  // Keys only, not values
  }
}
```

## Sensitive Data Protection

The wrapper automatically redacts sensitive data in production:

- Stack traces are hidden
- Query parameters like `token`, `password`, `secret`, `apiKey` are redacted
- Request body values are not logged (only keys)
- Error details are hidden

## Complete Example

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, ApiErrors } from '@/lib/api-error-handler';
import { query } from '@/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method check
  if (req.method !== 'POST') {
    throw ApiErrors.badRequest('Method not allowed');
  }

  // 2. Authentication check
  const token = req.cookies.admin_token;
  if (!token) {
    throw ApiErrors.unauthorized('Authentication required');
  }

  // 3. Input validation
  const { name, email } = req.body;
  if (!name || !email) {
    throw ApiErrors.badRequest('Name and email are required');
  }

  // 4. Database operation
  const [existingUser] = await query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any[];

  if (existingUser) {
    throw ApiErrors.badRequest('Email already exists');
  }

  // 5. Create user
  const result = await query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );

  // 6. Success response
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    userId: result.insertId
  });
}

export default withErrorHandling(handler);
```

## Migration Guide

### Before (Manual Error Handling)

```typescript
export default async function handler(req, res) {
  try {
    // Logic here
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
```

### After (With Error Handling Wrapper)

```typescript
import { withErrorHandling } from '@/lib/api-error-handler';

async function handler(req, res) {
  // Logic here - no try-catch needed!
  return res.status(200).json({ success: true });
}

export default withErrorHandling(handler);
```

## Benefits

1. **Consistency**: All API endpoints return errors in the same format
2. **Security**: Sensitive data is automatically hidden in production
3. **Debugging**: Unique error IDs make it easy to track issues
4. **Logging**: All errors are logged with context automatically
5. **Simplicity**: No need to write try-catch blocks in every endpoint
6. **Reliability**: Prevents process crashes from unhandled errors

## Requirements Satisfied

- ✅ Requirement 5.1: Catch all errors and return appropriate HTTP status
- ✅ Requirement 5.2: Log errors with context
- ✅ Requirement 5.5: Hide sensitive details in production
- ✅ Requirement 5.6: Include unique error ID in response

## Testing

See `src/pages/api/example-with-error-handling.ts` for a complete example with different error scenarios.

Test different scenarios:
```bash
# Success
curl http://localhost:3000/api/example-with-error-handling

# 401 Unauthorized
curl http://localhost:3000/api/example-with-error-handling?scenario=unauthorized

# 404 Not Found
curl http://localhost:3000/api/example-with-error-handling?scenario=notfound

# 400 Bad Request
curl http://localhost:3000/api/example-with-error-handling?scenario=validation

# 500 Database Error
curl http://localhost:3000/api/example-with-error-handling?scenario=database
```
