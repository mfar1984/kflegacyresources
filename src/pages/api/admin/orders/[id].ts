import type { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '@/lib/api-error-handler';
import { safeQuery } from '@/lib/db-safe-query';
import { withTimeout } from '@/lib/request-timeout';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const orderId = parseInt(Array.isArray(id) ? id[0] : id || '', 10);
  if (!orderId || Number.isNaN(orderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order id' });
  }

  if (req.method === 'PATCH') {
    const { status, paid_at } = req.body as { status?: string; paid_at?: string | null };
    const allowed: Record<string, true> = { pending: true, paid: true, failed: true, cancelled: true, refunded: true };
    if (!status || !allowed[status]) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Build update fields
    const setParts: string[] = ['status = ?'];
    const params: (string | number | null)[] = [status];

    if (typeof paid_at !== 'undefined') {
      // Expect ISO string or null
      if (paid_at === null || paid_at === '') {
        setParts.push('paid_at = NULL');
      } else {
        setParts.push('paid_at = ?');
        params.push(paid_at);
      }
    }

    params.push(orderId);
    
    // Use safeQuery for database update
    await safeQuery(
      `UPDATE orders SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1`,
      params as (string | number | null)[]
    );

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

// Apply middleware: error handling and timeout
export default withTimeout(withErrorHandling(handler));


