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

  const connection = await pool.getConnection();

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'claims');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await form.parse(req);
    
    const employee_id = fields.employee_id?.[0];
    const claim_type_id = fields.claim_type_id?.[0];
    const claim_date = fields.claim_date?.[0];
    const description = fields.description?.[0];
    const remarks = fields.remarks?.[0] || '';
    const itemsStr = fields.items?.[0];

    if (session.employee_id !== parseInt(employee_id!)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!claim_type_id || !claim_date || !description || !itemsStr) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const items = JSON.parse(itemsStr);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one claim item is required' });
    }

    // Calculate total
    const total_amount = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);

    await connection.beginTransaction();

    // Generate claim number (within transaction to avoid race conditions)
    const today = new Date();
    const yearMonth = today.toISOString().slice(0, 7).replace(/-/g, '');
    
    // Get the highest sequence number for this month using MAX() within transaction
    const [maxResult] = await connection.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(MAX(CAST(SUBSTRING_INDEX(claim_number, '-', -1) AS UNSIGNED)), 0) as max_seq
       FROM claims 
       WHERE claim_number LIKE ?`,
      [`CLM-${yearMonth}-%`]
    );

    let sequence = 1;
    if (maxResult && maxResult.length > 0 && maxResult[0].max_seq !== null) {
      sequence = parseInt(maxResult[0].max_seq) + 1;
    }
    
    const claim_number = `CLM-${yearMonth}-${sequence.toString().padStart(3, '0')}`;

    // Insert main claim
    const [claimResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO claims 
       (claim_number, employee_id, claim_type_id, claim_date, total_amount, description, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [claim_number, employee_id, claim_type_id, claim_date, total_amount, description, remarks]
    );

    const claimId = claimResult.insertId;

    // Insert claim items with receipts
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const receiptFileKey = `receipt_${i}`;
      const receiptFile = Array.isArray(files[receiptFileKey]) ? files[receiptFileKey][0] : files[receiptFileKey];

      if (!receiptFile) {
        await connection.rollback();
        return res.status(400).json({ error: `Receipt missing for item ${i + 1}` });
      }

      // Move uploaded file
      const fileName = `${Date.now()}-${i}-${receiptFile.originalFilename}`;
      const newPath = path.join(uploadDir, fileName);
      fs.renameSync(receiptFile.filepath, newPath);
      const receipt_path = `/uploads/claims/${fileName}`;

      await connection.query<ResultSetHeader>(
        `INSERT INTO claim_items 
         (claim_id, item_date, description, category, amount, receipt_path, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          claimId,
          item.item_date,
          item.description,
          item.category,
          item.amount,
          receipt_path,
          item.remarks || ''
        ]
      );
    }

    await connection.commit();

    return res.status(200).json({ message: 'Claim submitted successfully', claim_number });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error submitting claim:', error);
    
    // Handle duplicate entry error specifically
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Claim number already exists. Please try submitting again.',
        code: 'DUPLICATE_CLAIM_NUMBER'
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to submit claim',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
