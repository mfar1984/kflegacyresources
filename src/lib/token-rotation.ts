import { query } from './db';
import crypto from 'crypto';

/**
 * Generate a new secure API token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get SHA256 hash of a token (for logging without exposing token)
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Check if token rotation is due and perform rotation
 */
export async function checkAndRotateToken(): Promise<{
  rotated: boolean;
  newToken?: string;
  reason?: string;
}> {
  try {
    // Fetch current integration settings
    const settings = await query(
      `SELECT 
        api_token, 
        api_token_rotates_daily, 
        api_token_rotation_time,
        api_token_next_rotation,
        api_token_created_at
      FROM integrations 
      WHERE id = 1`
    ) as any[];

    if (settings.length === 0) {
      return { rotated: false, reason: 'No integration settings found' };
    }

    const setting = settings[0];

    // Check if rotation is enabled
    if (!setting.api_token_rotates_daily) {
      return { rotated: false, reason: 'Daily rotation disabled' };
    }

    // Check if rotation is due
    const now = new Date();
    const nextRotation = setting.api_token_next_rotation 
      ? new Date(setting.api_token_next_rotation) 
      : null;

    if (!nextRotation || now < nextRotation) {
      return { 
        rotated: false, 
        reason: `Next rotation scheduled for ${nextRotation?.toISOString()}` 
      };
    }

    // Perform rotation
    const oldToken = setting.api_token;
    const newToken = generateSecureToken();
    const oldTokenHash = oldToken ? hashToken(oldToken) : null;
    const newTokenHash = hashToken(newToken);

    // Calculate next rotation time (tomorrow at configured time)
    const rotationTime = setting.api_token_rotation_time || '00:00:00';
    const [hours, minutes] = rotationTime.split(':').map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    // Convert to MySQL datetime format
    const tomorrowStr = tomorrow.toISOString().slice(0, 19).replace('T', ' ');

    // Update token in database
    await query(
      `UPDATE integrations 
       SET 
         api_token = ?,
         api_token_created_at = NOW(),
         api_token_last_rotated = NOW(),
         api_token_next_rotation = ?,
         api_token_usage_count = 0
       WHERE id = 1`,
      [newToken, tomorrowStr]
    );

    // Log rotation
    if (oldTokenHash) {
      await query(
        `INSERT INTO api_token_rotation_log 
         (old_token_hash, new_token_hash, rotation_type, rotated_at) 
         VALUES (?, ?, 'auto', NOW())`,
        [oldTokenHash, newTokenHash]
      );
    }

    console.log(`✅ API Token rotated successfully at ${now.toISOString()}`);
    console.log(`   Next rotation: ${tomorrow.toISOString()}`);

    return { 
      rotated: true, 
      newToken,
      reason: `Auto-rotated at ${now.toISOString()}` 
    };

  } catch (error) {
    console.error('❌ Token rotation error:', error);
    return { rotated: false, reason: `Error: ${error}` };
  }
}

/**
 * Manual token rotation (called from admin UI)
 */
export async function manualRotateToken(adminId?: number): Promise<{
  success: boolean;
  newToken?: string;
  error?: string;
}> {
  try {
    // Fetch current token
    const settings = await query(
      `SELECT api_token FROM integrations WHERE id = 1`
    ) as any[];

    if (settings.length === 0) {
      return { success: false, error: 'No integration settings found' };
    }

    const oldToken = settings[0].api_token;
    const newToken = generateSecureToken();
    const oldTokenHash = oldToken ? hashToken(oldToken) : null;
    const newTokenHash = hashToken(newToken);

    // Update token
    await query(
      `UPDATE integrations 
       SET 
         api_token = ?,
         api_token_created_at = NOW(),
         api_token_usage_count = 0
       WHERE id = 1`,
      [newToken]
    );

    // Log manual rotation
    if (oldTokenHash) {
      await query(
        `INSERT INTO api_token_rotation_log 
         (old_token_hash, new_token_hash, rotation_type, rotated_by, rotated_at) 
         VALUES (?, ?, 'manual', ?, NOW())`,
        [oldTokenHash, newTokenHash, adminId || null]
      );
    }

    console.log(`✅ API Token manually rotated by admin ${adminId || 'unknown'}`);

    return { success: true, newToken };

  } catch (error) {
    console.error('❌ Manual token rotation error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Start the token rotation scheduler
 * Checks every minute if rotation is due
 */
export function startTokenRotationScheduler() {
  console.log('🔄 Token rotation scheduler started');
  
  // Check immediately on startup
  checkAndRotateToken();

  // Then check every minute
  setInterval(async () => {
    await checkAndRotateToken();
  }, 60 * 1000); // 1 minute
}

