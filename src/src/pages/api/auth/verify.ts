import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySession, getSession } from './login';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.query;

    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({ valid: false, message: 'Session hash is required' });
    }

    let isValid = verifySession(hash);
    let session = getSession(hash) as { username: string; createdAt: Date; userType?: 'admin'|'client'|'employee'; clientId?: number|null; employeeId?: number|null } | undefined;
    let userType: 'admin' | 'client' | 'employee' | undefined = session?.userType;
    let clientId: number | undefined = (session?.clientId ?? undefined) as number | undefined;
    let employeeId: number | undefined = (session?.employeeId ?? undefined) as number | undefined;

    // If in-memory session is present but missing critical context (userType), read from DB
    if (!isValid || !userType) {
      const rows = await query('SELECT username, user_type, client_id, employee_id, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1', [hash]) as {username:string; user_type: 'admin'|'client'|'employee'; client_id: number|null; employee_id: number|null; expires_at: string}[];
      if (rows && rows.length > 0) {
        const expires = new Date(rows[0].expires_at);
        if (expires > new Date()) {
          isValid = true;
          session = { username: rows[0].username, createdAt: new Date(), userType: rows[0].user_type, clientId: rows[0].client_id, employeeId: rows[0].employee_id };
          userType = rows[0].user_type;
          clientId = rows[0].client_id ?? undefined;
          employeeId = rows[0].employee_id ?? undefined;
        }
      }
    }

    if (!isValid) {
      return res.status(401).json({ valid: false, message: 'Invalid or expired session' });
    }

    // If client, check if account is still active
    if (userType === 'client' && clientId) {
      const clientStatus = await query(
        'SELECT status, email_verified FROM client_users WHERE id = ? LIMIT 1',
        [clientId]
      ) as { status: string; email_verified: number }[];

      if (clientStatus.length === 0 || clientStatus[0].status !== 'active' || clientStatus[0].email_verified !== 1) {
        // Delete invalid session
        await query('DELETE FROM admin_sessions WHERE hash = ?', [hash]);
        return res.status(401).json({ valid: false, message: 'Account is no longer active' });
      }
    }

    return res.status(200).json({
      valid: true,
      username: session?.username,
      createdAt: session?.createdAt,
      userType: userType || 'admin',
      clientId: clientId || null,
      employeeId: employeeId || null,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ valid: false, message: 'Internal server error' });
  }
}


