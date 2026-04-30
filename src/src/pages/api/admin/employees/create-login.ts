import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.query;
  const session = await verifySession(hash as string);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { employee_id, username, password } = req.body;

    if (!employee_id || !username || !password) {
      return res.status(400).json({ error: 'Employee ID, username, and password are required' });
    }

    // Check if employee exists
    const [employees] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email FROM employees WHERE id = ?',
      [employee_id]
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if username already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ?',
      [username.toLowerCase()]
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if employee already has a login account
    const [existingLogins] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE employee_id = ?',
      [employee_id]
    );

    if (existingLogins && existingLogins.length > 0) {
      return res.status(400).json({ error: 'Employee already has a login account' });
    }

    // Hash password with bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    // Create login account
    await pool.query<ResultSetHeader>(
      `INSERT INTO admins (username, password_hash, user_type, employee_id, status) 
       VALUES (?, ?, 'employee', ?, 'active')`,
      [username.toLowerCase(), password_hash, employee_id]
    );

    return res.status(200).json({ 
      message: 'Login account created successfully',
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error('Create login error:', error);
    return res.status(500).json({ error: 'Failed to create login account' });
  }
}

