import type { NextApiRequest, NextApiResponse} from 'next';
import { query } from '@/lib/db';

// Get admin context (username, id, permissions) from session hash
async function getAdminContextFromHash(hash: string): Promise<{
  adminId: number;
  username: string;
  permissionNames: string[];
} | null> {
  if (!hash) return null;

  // 1) Verify session via admin_sessions.hash (same pattern as other modules)
  const sessions = await query(
    `SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1`,
    [hash]
  ) as { username: string; expires_at: string }[];

  if (!sessions || sessions.length === 0) return null;
  const { username, expires_at } = sessions[0];
  if (new Date(expires_at) <= new Date()) return null;

  // 2) Get admin id from admins table
  const admins = await query(
    `SELECT id FROM admins WHERE username = ? LIMIT 1`,
    [username]
  ) as { id: number }[];
  if (!admins || admins.length === 0) return null;
  const adminId = admins[0].id;

  // 3) Build permission names from roles → permissions
  const permissions = await query(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]) as { module: string; action: string }[];
  const permissionNames = permissions.map(p => `${p.module}_${p.action}`);

  return { adminId, username, permissionNames };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hash } = req.query;
    const sessionHash = (hash as string) || '';

    const context = await getAdminContextFromHash(sessionHash);
    if (!context) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!context.permissionNames.includes('helpdesk_view')) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    if (req.method === 'GET') {
      // Get all tickets with client info
      const tickets = await query(
        `SELECT 
          t.*,
          c.company_name,
          c.contact_person,
          c.email as client_email,
          c.phone as client_phone,
          u.full_name as assigned_user_name
        FROM helpdesk_tickets t
        JOIN client_users c ON t.client_id = c.id
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY 
          CASE t.priority
            WHEN 'Urgent' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 4
          END,
          t.created_at DESC`
      ) as any[];

      // Normalize attachments: allow JSON array, JSON string, single filename, or null
      const parsedTickets = tickets.map(ticket => {
        const raw = (ticket as any).attachments;
        let attachments: any = [];
        if (raw !== undefined && raw !== null && raw !== '') {
          if (Array.isArray(raw)) {
            attachments = raw;
          } else if (typeof raw === 'object') {
            attachments = raw; // MySQL JSON may come parsed
          } else if (typeof raw === 'string') {
            const s = raw.trim();
            if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
              try { attachments = JSON.parse(s); } catch { attachments = [s]; }
            } else {
              attachments = [s];
            }
          }
        }
        return { ...ticket, attachments };
      });

      return res.status(200).json({ tickets: parsedTickets });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in admin helpdesk API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

