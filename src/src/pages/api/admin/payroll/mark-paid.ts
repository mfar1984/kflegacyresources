import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
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

async function getAdminId(username: string): Promise<number> {
  const [admins] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  return admins[0]?.id || 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (!hasPermission(userPermissions, 'payroll_pay')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to mark payroll as paid' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payroll');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name, ext) => {
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      return `payment_proof_${timestamp}_${uniqueId}${ext}`;
    },
  });

  try {
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const period_id = Array.isArray(fields.period_id) ? fields.period_id[0] : fields.period_id;
    const payment_date = Array.isArray(fields.payment_date) ? fields.payment_date[0] : fields.payment_date;
    const payment_reference = Array.isArray(fields.payment_reference) ? fields.payment_reference[0] : fields.payment_reference;
    const remarks = Array.isArray(fields.remarks) ? fields.remarks[0] : fields.remarks;

    if (!period_id) {
      return res.status(400).json({ error: 'Period ID is required' });
    }

    if (!payment_date) {
      return res.status(400).json({ error: 'Payment date is required' });
    }

    const paymentProofFile = Array.isArray(files.payment_proof) ? files.payment_proof[0] : files.payment_proof;
    
    if (!paymentProofFile) {
      return res.status(400).json({ error: 'Payment proof (attachment) is required' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get period details
      const [periods] = await connection.query<RowDataPacket[]>(
        'SELECT id, period_name, status FROM payroll_periods WHERE id = ?',
        [period_id]
      );

      if (!periods || periods.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Payroll period not found' });
      }

      const period = periods[0];

      if (period.status !== 'approved') {
        await connection.rollback();
        return res.status(400).json({ error: 'Only approved periods can be marked as paid' });
      }

      const adminId = await getAdminId(session.username);
      const paymentProofPath = `/uploads/payroll/${path.basename(paymentProofFile.filepath)}`;

      // Update period status to paid
      await connection.query<ResultSetHeader>(
        `UPDATE payroll_periods SET
          status = 'paid',
          payment_date = ?,
          payment_proof = ?,
          paid_by = ?,
          paid_date = NOW(),
          remarks = ?
        WHERE id = ?`,
        [payment_date, paymentProofPath, adminId, 
         remarks ? `${remarks}\nPayment Reference: ${payment_reference || 'N/A'}` : `Payment Reference: ${payment_reference || 'N/A'}`, 
         period_id]
      );

      // Update all payslips to paid
      await connection.query<ResultSetHeader>(
        `UPDATE payroll_records SET
          status = 'paid'
        WHERE payroll_period_id = ? AND status = 'approved'`,
        [period_id]
      );

      await connection.commit();

      return res.status(200).json({ 
        message: `Payroll period "${period.period_name}" marked as paid successfully`,
        payment_proof: paymentProofPath
      });
    } catch (error) {
      await connection.rollback();
      // Clean up uploaded file on error
      if (paymentProofFile && fs.existsSync(paymentProofFile.filepath)) {
        fs.unlinkSync(paymentProofFile.filepath);
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Mark as paid error:', error);
    return res.status(500).json({ error: 'Failed to mark payroll period as paid' });
  }
}

