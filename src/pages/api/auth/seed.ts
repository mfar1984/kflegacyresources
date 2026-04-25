import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

const ADMIN_USERNAME = 'administrator@root';
const ADMIN_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$ZRJ9saL2B71aIAR+EHti8w$11V4uAL0UvJqibgc5uqjCykZTzgaXuHwvdpimr6ORjQ';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await query(
      `INSERT INTO admins (username, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [ADMIN_USERNAME, ADMIN_PASSWORD_HASH]
    );

    type AdminPreviewRow = { id: number; username: string; hash_prefix: string };
    const rows = await query(
      'SELECT id, username, LEFT(password_hash, 20) AS hash_prefix FROM admins WHERE username = ? LIMIT 1',
      [ADMIN_USERNAME]
    ) as Array<AdminPreviewRow>;

    return res.status(200).json({ ok: true, rows });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}


