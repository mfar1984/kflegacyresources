/**
 * Example API endpoint demonstrating withErrorHandling usage
 * This file can be deleted - it's just for demonstration
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, ApiErrors } from '@/lib/api-error-handler';
import { query } from '@/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method check
  if (req.method !== 'GET') {
    throw ApiErrors.badRequest('Method not allowed');
  }

  // Example: Simulate different error scenarios based on query param
  const { scenario } = req.query;

  if (scenario === 'unauthorized') {
    throw ApiErrors.unauthorized('You must be logged in');
  }

  if (scenario === 'notfound') {
    throw ApiErrors.notFound('Resource not found');
  }

  if (scenario === 'validation') {
    throw ApiErrors.badRequest('Invalid input: name is required');
  }

  if (scenario === 'database') {
    // This will throw a database error
    await query('SELECT * FROM nonexistent_table');
  }

  // Success response
  return res.status(200).json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
  });
}

// Export with error handling wrapper
export default withErrorHandling(handler);
