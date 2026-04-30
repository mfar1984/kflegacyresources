import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  if (session.user_type !== 'employee') return null;
  return session;
}

function detectContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = await verifySession(req.query.hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const expenseId = parseInt((req.query.expense_id as string) || '0', 10);
  if (!expenseId) return res.status(400).json({ error: 'expense_id is required' });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT employee_id, receipt_url FROM expenses WHERE id = ? LIMIT 1',
      [expenseId]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    const record = rows[0] as { employee_id: number; receipt_url: string | null };
    if (record.employee_id !== session.employee_id) return res.status(403).json({ error: 'Forbidden' });
    if (!record.receipt_url) return res.status(404).json({ error: 'Receipt not found' });

    const relativePath = record.receipt_url.startsWith('/') ? record.receipt_url.slice(1) : record.receipt_url;
    const absPath = path.join(process.cwd(), 'public', relativePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

    const contentType = detectContentType(absPath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(absPath)}"`);

    const stream = fs.createReadStream(absPath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load receipt' });
  }
}


