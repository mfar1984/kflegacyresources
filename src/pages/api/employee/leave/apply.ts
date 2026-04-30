import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
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
    'SELECT user_type, employee_id, expires_at FROM admin_sessions WHERE hash = ?',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const session = sessions[0];
  if (new Date(session.expires_at) < new Date()) return null;
  if (session.user_type !== 'employee') return null;
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Parse form data
  const form = formidable({ 
    maxFileSize: 5 * 1024 * 1024, // 5MB
    uploadDir: path.join(process.cwd(), 'public/uploads/leave_documents'),
    keepExtensions: true,
    filename: (name, ext) => {
      return Date.now() + '-' + Math.random().toString(36).substring(7) + ext;
    }
  });

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), 'public/uploads/leave_documents');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const [fields, files] = await form.parse(req);
  
  const employee_id = fields.employee_id?.[0];
  const leave_type_id = fields.leave_type_id?.[0];
  const start_date = fields.start_date?.[0];
  const end_date = fields.end_date?.[0];
  const day_type = fields.day_type?.[0] || 'full'; // Default to 'full' if not provided
  const reason = fields.reason?.[0];
  const remarks = fields.remarks?.[0] || null;
  const documentFile = files.document?.[0];

  if (!employee_id || !leave_type_id || !start_date || !end_date || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (session.employee_id !== parseInt(employee_id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Calculate base total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    let total_days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (total_days < 1) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Apply half-day adjustment for single day leaves
    const isSingleDay = start_date === end_date;
    if (isSingleDay && day_type === 'half') {
      total_days = 0.5;
    }

    // Check leave balance
    const [balances] = await pool.query<RowDataPacket[]>(
      'SELECT remaining_days FROM leave_balances WHERE employee_id = ? AND leave_type_id = ?',
      [employee_id, leave_type_id]
    );

    if (!balances || balances.length === 0) {
      return res.status(400).json({ error: 'No leave balance found for this leave type' });
    }

    if (balances[0].remaining_days < total_days) {
      return res.status(400).json({ error: `Insufficient leave balance. Available: ${balances[0].remaining_days} days` });
    }

    // Generate application number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const [lastApp] = await pool.query<RowDataPacket[]>(
      `SELECT application_number FROM leave_applications 
       WHERE application_number LIKE ? 
       ORDER BY application_number DESC LIMIT 1`,
      [`LA-${dateStr}%`]
    );

    let sequence = 1;
    if (lastApp && lastApp.length > 0) {
      const lastNum = lastApp[0].application_number.split('-')[2];
      sequence = parseInt(lastNum) + 1;
    }
    const application_number = `LA-${dateStr}-${sequence.toString().padStart(3, '0')}`;

    // Handle document upload
    let documentPath = null;
    if (documentFile) {
      documentPath = `/uploads/leave_documents/${path.basename(documentFile.filepath)}`;
    }

    // Insert leave application
    await pool.query<ResultSetHeader>(
      `INSERT INTO leave_applications 
       (employee_id, leave_type_id, application_number, start_date, end_date, total_days, reason, remarks, document_path, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [employee_id, leave_type_id, application_number, start_date, end_date, total_days, reason, remarks, documentPath]
    );

    return res.status(200).json({ 
      message: 'Leave application submitted successfully',
      application_number 
    });
  } catch (error) {
    console.error('Error applying for leave:', error);
    return res.status(500).json({ error: 'Failed to submit leave application' });
  }
}

