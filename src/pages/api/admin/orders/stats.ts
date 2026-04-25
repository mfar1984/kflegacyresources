import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

type CountRow = { count: number };
type RevenueRow = { revenue: string | number | null };
type StatusRow = { status: string; count: number };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Total orders
    const totalOrdersRows = await query(
      'SELECT COUNT(*) AS count FROM orders'
    ) as Array<CountRow>;
    const totalOrders = totalOrdersRows?.[0]?.count ?? 0;

    // Total revenue (all-time) for paid orders
    const totalRevenueRows = await query(
      "SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders WHERE status = 'paid'"
    ) as Array<RevenueRow>;
    const totalRevenue = parseFloat(String(totalRevenueRows?.[0]?.revenue ?? 0)) || 0;

    // This month metrics
    const monthlyOrdersRows = await query(
      'SELECT COUNT(*) AS count FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())'
    ) as Array<CountRow>;
    const monthlyOrders = monthlyOrdersRows?.[0]?.count ?? 0;

    const monthlyRevenueRows = await query(
      "SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders WHERE status = 'paid' AND paid_at IS NOT NULL AND YEAR(paid_at) = YEAR(CURDATE()) AND MONTH(paid_at) = MONTH(CURDATE())"
    ) as Array<RevenueRow>;
    const monthlyRevenue = parseFloat(String(monthlyRevenueRows?.[0]?.revenue ?? 0)) || 0;

    // Status breakdown
    const statusRows = await query(
      'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
    ) as Array<StatusRow>;
    const byStatus: Record<string, number> = {};
    for (const row of statusRows || []) {
      byStatus[row.status] = row.count;
    }

    return res.status(200).json({
      success: true,
      totals: {
        orders: totalOrders,
        revenue: totalRevenue,
      },
      thisMonth: {
        orders: monthlyOrders,
        revenue: monthlyRevenue,
      },
      byStatus,
    });
  } catch (error) {
    console.error('Failed to fetch order stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}


