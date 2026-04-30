import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

export const config = { api: { bodyParser: false } };

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'kpi_assignments_edit')) return res.status(403).json({ error: 'Forbidden' });

  const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Invalid form data' });
    try {
      const assignmentId = Number(fields.assignment_id?.[0] || fields.assignment_id);
      const actualValueRaw = fields.actual_value?.[0] ?? fields.actual_value;
      const remarks = (fields.remarks?.[0] ?? fields.remarks) as string | undefined;
      if (!assignmentId) return res.status(422).json({ error: 'assignment_id is required' });

      // Ensure assignment exists and period is open
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT a.id, p.status as period_status
         FROM kpi_assignments a
         INNER JOIN kpi_periods p ON a.period_id = p.id
         WHERE a.id = ?
         LIMIT 1`,
        [assignmentId]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
      const periodStatus = (rows as any[])[0]?.period_status;
      if (periodStatus !== 'open') return res.status(403).json({ error: 'Period is not open' });

      let evidenceUrl: string | null = null;
      // Formidable v3 types can be File | File[] | undefined
      const file: any = Array.isArray((files as any).evidence) ? (files as any).evidence[0] : (files as any).evidence;
      if (file && file.filepath) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'kpi');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const ext = path.extname(file.originalFilename || '') || path.extname(file.filepath) || '';
        const filename = `kpi_${assignmentId}_${Date.now()}${ext}`;
        const dest = path.join(uploadsDir, filename);
        await fs.promises.copyFile(file.filepath, dest);
        evidenceUrl = `/uploads/kpi/${filename}`;
      }

      const actualValue = actualValueRaw != null ? Number(actualValueRaw) : null;
      await pool.query<ResultSetHeader>(
        'INSERT INTO kpi_updates (assignment_id, actual_value, remarks, evidence_url) VALUES (?, ?, ?, ?)',
        [assignmentId, actualValue, remarks || null, evidenceUrl]
      );

      // Move assignment to in_progress if still draft
      await pool.query<ResultSetHeader>(
        `UPDATE kpi_assignments SET status = CASE WHEN status = 'draft' THEN 'in_progress' ELSE status END WHERE id = ?`,
        [assignmentId]
      );

      return res.status(200).json({ updated: true, evidence_url: evidenceUrl });
    } catch (error) {
      console.error('Admin KPI update error:', error);
      return res.status(500).json({ error: 'Failed to update KPI' });
    }
  });
}


