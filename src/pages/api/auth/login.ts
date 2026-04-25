import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from '@/lib/login-attempts';

// Store active sessions in memory
const activeSessions = new Map<string, { username: string; createdAt: Date }>();

type AdminRow = { id: number; username: string; password_hash: string };

// Verify password
async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Generate session hash
function generateSessionHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Ensure admins table exists (no default seeding)
let didEnsure = false;
async function ensureAdminsTable(): Promise<void> {
  if (didEnsure) return;
  
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  didEnsure = true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limiting: Max 10 login attempts per 15 minutes per IP
  if (!rateLimit(req, res, { maxRequests: 10, windowMs: 15 * 60 * 1000 })) {
    return; // Response already sent by rateLimit
  }

  try {
    // Ensure admins table exists (no seeding, just table creation)
    await ensureAdminsTable();

    const { username, password } = req.body as { username?: string; password?: string };
    const normalizedUsername = (username || '').trim().toLowerCase();

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if account is locked due to too many failed attempts
    const attemptCheck = checkLoginAttempts(normalizedUsername);
    if (!attemptCheck.allowed) {
      const minutesRemaining = attemptCheck.lockedUntil 
        ? Math.ceil((attemptCheck.lockedUntil - Date.now()) / 60000)
        : 15;
      return res.status(429).json({ 
        message: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesRemaining} minutes.`,
        lockedUntil: attemptCheck.lockedUntil,
      });
    }

    // Look up admin user from database
    const rows = await query(
      'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
      [normalizedUsername]
    ) as Array<AdminRow>;

    const admin: AdminRow | undefined = rows && rows.length > 0 ? rows[0] : undefined;

    // If no admin found, invalid credentials
    if (!admin) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password against hash in database
    const isValid = await verifyPassword(admin.password_hash, password);

    if (!isValid) {
      // Record failed login attempt
      const failureResult = recordFailedLogin(normalizedUsername);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (failureResult.locked) {
        return res.status(429).json({ 
          message: 'Too many failed login attempts. Account locked for 15 minutes.',
          lockedUntil: failureResult.lockedUntil,
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts: failureResult.remainingAttempts,
      });
    }

    // Successful login - reset failed attempts
    resetLoginAttempts(normalizedUsername);

    // Generate session
    const sessionHash = generateSessionHash();
    activeSessions.set(sessionHash, {
      username,
      createdAt: new Date(),
    });

    // Persist session to DB
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      `CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hash VARCHAR(128) NOT NULL UNIQUE,
        username VARCHAR(191) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        INDEX idx_username (username),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );
    await query(
      `INSERT INTO admin_sessions (hash, username, expires_at) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE username = VALUES(username), expires_at = VALUES(expires_at)`,
      [sessionHash, username, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    );

    // Clean up old sessions
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [hash, session] of activeSessions.entries()) {
      if (session.createdAt < oneDayAgo) {
        activeSessions.delete(hash);
      }
    }

    return res.status(200).json({
      success: true,
      hash: sessionHash,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export function verifySession(hash: string): boolean {
  const session = activeSessions.get(hash);
  if (!session) return false;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (session.createdAt < oneDayAgo) {
    activeSessions.delete(hash);
    return false;
  }

  return true;
}

export function getSession(hash: string) {
  return activeSessions.get(hash);
}
