# Request Timeout Middleware

Higher-order function that wraps Next.js API handlers with timeout enforcement to prevent hanging requests.

## Features

- ⏱️ **Configurable Timeouts**: Set custom timeout durations per endpoint
- 📊 **Slow Request Logging**: Automatically logs requests that exceed threshold
- 🔄 **Multiple Presets**: Default, short, and long timeout configurations
- 🛡️ **408 Response**: Returns proper HTTP 408 Request Timeout status
- 🎯 **Custom Callbacks**: Optional handlers for timeout and slow request events

## Requirements

Implements requirements **15.2** and **15.3** from the production-stability spec:
- Log slow requests (>5 seconds)
- Implement request timeouts to prevent hanging requests

## Basic Usage

### Default Timeout (30 seconds)

```typescript
import { withDefaultTimeout } from '@/lib/request-timeout';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your API logic here
  const data = await someOperation();
  
  return res.status(200).json({
    success: true,
    data
  });
}

export default withDefaultTimeout(handler);
```

### Custom Timeout

```typescript
import { withTimeout } from '@/lib/request-timeout';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your API logic here
}

export default withTimeout(handler, {
  timeoutMs: 10000,      // 10 second timeout
  slowRequestMs: 2000    // Log if >2 seconds
});
```

## Preset Configurations

### Short Timeout (10 seconds)

For quick operations like fetching cached data or simple queries:

```typescript
import { withShortTimeout } from '@/lib/request-timeout';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cached = cache.get('key');
  return res.status(200).json({ data: cached });
}

export default withShortTimeout(handler);
```

**Configuration:**
- Timeout: 10 seconds
- Slow request threshold: 2 seconds

### Default Timeout (30 seconds)

For standard API operations:

```typescript
import { withDefaultTimeout } from '@/lib/request-timeout';

export default withDefaultTimeout(handler);
```

**Configuration:**
- Timeout: 30 seconds
- Slow request threshold: 5 seconds

### Long Timeout (60 seconds)

For heavy operations like backups, reports, or bulk processing:

```typescript
import { withLongTimeout } from '@/lib/request-timeout';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await generateLargeReport();
  return res.status(200).json({ success: true });
}

export default withLongTimeout(handler);
```

**Configuration:**
- Timeout: 60 seconds
- Slow request threshold: 10 seconds

## Advanced Usage

### Custom Callbacks

```typescript
import { withTimeout } from '@/lib/request-timeout';

export default withTimeout(handler, {
  timeoutMs: 15000,
  slowRequestMs: 3000,
  
  // Called when request times out
  onTimeout: (req) => {
    console.error('Timeout on:', req.url);
    // Send alert, increment metric, etc.
  },
  
  // Called when request is slow but doesn't timeout
  onSlowRequest: (req, duration) => {
    console.warn(`Slow request: ${req.url} took ${duration}ms`);
    // Track slow requests for optimization
  }
});
```

### Creating Reusable Middleware

```typescript
import { createTimeoutMiddleware } from '@/lib/request-timeout';

// Create custom preset for your use case
const withPaymentTimeout = createTimeoutMiddleware({
  timeoutMs: 45000,      // Payment APIs need more time
  slowRequestMs: 10000,
  onTimeout: (req) => {
    // Log to payment monitoring system
    paymentMonitor.logTimeout(req);
  }
});

// Use across multiple payment endpoints
export default withPaymentTimeout(paymentHandler);
```

## Response Format

When a timeout occurs, the middleware returns:

```json
{
  "success": false,
  "message": "Request timeout - the server took too long to respond",
  "timeout": 30000,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**HTTP Status:** `408 Request Timeout`

## Logging

### Slow Request Log

When a request exceeds the slow threshold but completes successfully:

```
Slow request detected: GET /api/admin/reports took 7500ms
{
  method: 'GET',
  url: '/api/admin/reports',
  duration: 7500,
  threshold: 5000,
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

### Timeout Log

When a request times out:

```
Error occurred: {
  errorId: 'ERR-ABC123-XYZ789',
  timestamp: '2024-01-15T10:30:00.000Z',
  level: 'error',
  message: 'Request timeout after 30000ms',
  context: {
    method: 'POST',
    url: '/api/admin/backup',
    duration: 30001,
    timeout: 30000,
    ip: '192.168.1.1'
  }
}
```

## Best Practices

### 1. Choose Appropriate Timeouts

- **Quick operations** (cache reads, simple queries): 10 seconds
- **Standard operations** (CRUD, authentication): 30 seconds
- **Heavy operations** (reports, backups, bulk updates): 60 seconds

### 2. Always Use Timeout Middleware

Apply timeout middleware to ALL API endpoints to prevent hanging requests:

```typescript
// ✅ GOOD - Protected from hanging
export default withDefaultTimeout(handler);

// ❌ BAD - Can hang indefinitely
export default handler;
```

### 3. Optimize Slow Requests

Monitor slow request logs and optimize operations that consistently exceed thresholds:

```typescript
// If you see frequent slow request warnings:
// 1. Add database indexes
// 2. Implement caching
// 3. Optimize queries
// 4. Consider pagination
```

### 4. Handle Long Operations Differently

For operations that legitimately take >60 seconds:

```typescript
// Option 1: Use background jobs
export default withShortTimeout(async (req, res) => {
  // Queue the job
  await jobQueue.add('heavy-operation', { data });
  
  return res.status(202).json({
    success: true,
    message: 'Job queued',
    jobId: 'job-123'
  });
});

// Option 2: Use streaming responses
// Option 3: Split into smaller operations
```

### 5. Combine with Error Handling

Use with the API error handler for comprehensive protection:

```typescript
import { withDefaultTimeout } from '@/lib/request-timeout';
import { withErrorHandling } from '@/lib/api-error-handler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your logic
}

// Apply both middlewares
export default withDefaultTimeout(
  withErrorHandling(handler)
);
```

## Configuration Reference

```typescript
interface TimeoutConfig {
  timeoutMs?: number;        // Maximum request duration (default: 30000)
  slowRequestMs?: number;    // Slow request threshold (default: 5000)
  onTimeout?: (req: NextApiRequest) => void;
  onSlowRequest?: (req: NextApiRequest, duration: number) => void;
}
```

## Examples by Endpoint Type

### Public API (Categories, Products)

```typescript
import { withDefaultTimeout } from '@/lib/request-timeout';

// Standard timeout for public APIs
export default withDefaultTimeout(handler);
```

### Admin API (Orders, Customers)

```typescript
import { withDefaultTimeout } from '@/lib/request-timeout';

// Standard timeout, but with authentication
export default withDefaultTimeout(handler);
```

### Payment API

```typescript
import { withTimeout } from '@/lib/request-timeout';

// Longer timeout for external payment gateway
export default withTimeout(handler, {
  timeoutMs: 45000,  // CHIP Asia can be slow
  slowRequestMs: 10000
});
```

### Backup API

```typescript
import { withLongTimeout } from '@/lib/request-timeout';

// Long timeout for backup operations
export default withLongTimeout(handler);
```

### Health Check API

```typescript
import { withShortTimeout } from '@/lib/request-timeout';

// Quick timeout for health checks
export default withShortTimeout(handler);
```

## Troubleshooting

### Request Times Out Immediately

**Problem:** Request times out even though operation is fast.

**Solution:** Check if you're awaiting promises correctly:

```typescript
// ❌ BAD - Doesn't wait for operation
async function handler(req, res) {
  query('SELECT * FROM products');  // Missing await!
  return res.json({ success: true });
}

// ✅ GOOD - Properly awaits
async function handler(req, res) {
  await query('SELECT * FROM products');
  return res.json({ success: true });
}
```

### Timeout Not Working

**Problem:** Handler still hangs despite timeout middleware.

**Solution:** Ensure you're exporting the wrapped handler:

```typescript
// ❌ BAD - Exports unwrapped handler
async function handler(req, res) { ... }
withDefaultTimeout(handler);  // Not exported!
export default handler;

// ✅ GOOD - Exports wrapped handler
async function handler(req, res) { ... }
export default withDefaultTimeout(handler);
```

### Response Already Sent Error

**Problem:** "Cannot set headers after they are sent to the client"

**Solution:** Ensure you're not sending multiple responses:

```typescript
// ❌ BAD - Multiple responses
async function handler(req, res) {
  res.json({ data: 'first' });
  res.json({ data: 'second' });  // Error!
}

// ✅ GOOD - Single response with return
async function handler(req, res) {
  return res.json({ data: 'only' });
}
```

## Related

- **Error Handler**: `src/lib/error-handler.ts` - Comprehensive error handling
- **API Error Handler**: `src/lib/api-error-handler.ts` - API-specific error wrapper
- **Rate Limiter**: `src/lib/rate-limit.ts` - Request rate limiting
- **Database Safe Query**: `src/lib/db-safe-query.ts` - Query timeout and safety

## Testing

See `src/lib/request-timeout.test.ts` for unit tests (Task 18.1).

## Changelog

- **v1.0.0** (2024-01-15): Initial implementation
  - Default, short, and long timeout presets
  - Slow request logging
  - Custom callback support
  - 408 timeout response
