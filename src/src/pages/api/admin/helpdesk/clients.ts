import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getAdminContextFromHash } from '@/lib/auth-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { hash, page = '1', pageSize = '10', search = '', status = '' } = req.query as Record<string, string>;
    const sessionHash = (hash || '').toString();

    const context = await getAdminContextFromHash(sessionHash);
    if (!context) return res.status(401).json({ error: 'Unauthorized' });
    if (!context.permissionNames.includes('helpdesk_clients_view')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const sizeNum = Math.min(Math.max(parseInt(pageSize as string, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * sizeNum;

    const filters: string[] = [];
    const params: any[] = [];

    if (search) {
      filters.push(`(company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR phone LIKE ?)`);
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (status) {
      filters.push(`status = ?`);
      params.push(status);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const countRows = await query(
      `SELECT COUNT(*) as total FROM client_users ${where}`,
      params
    ) as { total: number }[];
    const total = countRows?.[0]?.total ?? 0;

    const clients = await query(
      `SELECT id, company_name, contact_person, email, phone, address, status, email_verified, created_at 
       FROM client_users ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, sizeNum, offset]
    ) as any[];

    return res.status(200).json({
      page: pageNum,
      pageSize: sizeNum,
      total,
      totalPages: Math.ceil(total / sizeNum),
      clients,
    });
  } catch (error: any) {
    console.error('Admin helpdesk clients API error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}


