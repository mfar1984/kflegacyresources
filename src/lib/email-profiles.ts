/**
 * Email Profiles Management Library
 * Handles multi-email SMTP configuration with profile-based approach
 * Supports both Gmail and Custom SMTP providers
 */

import mysql from 'mysql2/promise';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ansar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Encryption key for SMTP passwords
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'ansar-email-secure-key-2025-v1-prod';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt password for storage
 */
function encryptPassword(password: string): string {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt password from storage
 */
function decryptPassword(encryptedPassword: string): string {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Email Profile Interface
 */
export interface EmailProfile {
  id: number;
  profile_key: string;
  profile_name: string;
  provider_type: 'gmail' | 'custom_smtp';
  email_address: string;
  from_name: string;
  reply_to: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  smtp_authentication: boolean;
  smtp_username: string;
  smtp_password: string; // Encrypted
  connection_timeout: number;
  max_retries: number;
  is_active: boolean;
  last_test_at: string | null;
  test_status: 'success' | 'failed' | 'not_tested';
  test_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Decrypted Email Profile (for use in nodemailer)
 */
export interface DecryptedEmailProfile extends Omit<EmailProfile, 'smtp_password'> {
  smtp_password_decrypted: string;
}

/**
 * Get all email profiles
 */
export async function getAllEmailProfiles(): Promise<EmailProfile[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<any[]>(
      'SELECT * FROM email_profiles ORDER BY profile_key ASC'
    );
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Get email profile by key (support, hr, info, etc.)
 */
export async function getEmailProfile(profileKey: string): Promise<DecryptedEmailProfile | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<any[]>(
      'SELECT * FROM email_profiles WHERE profile_key = ? AND is_active = 1 LIMIT 1',
      [profileKey]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const profile = rows[0];
    
    // Decrypt password
    const decryptedPassword = decryptPassword(profile.smtp_password);
    
    return {
      ...profile,
      smtp_password_decrypted: decryptedPassword
    };
  } finally {
    connection.release();
  }
}

/**
 * Create or update email profile
 */
export async function saveEmailProfile(data: {
  profile_key: string;
  profile_name: string;
  provider_type: 'gmail' | 'custom_smtp';
  email_address: string;
  from_name: string;
  reply_to?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  smtp_authentication: boolean;
  smtp_username: string;
  smtp_password: string; // Plain text, will be encrypted
  connection_timeout?: number;
  max_retries?: number;
  is_active?: boolean;
  updated_by?: string;
}): Promise<number> {
  const connection = await pool.getConnection();
  try {
    // Encrypt password
    const encryptedPassword = encryptPassword(data.smtp_password);
    
    // Check if profile exists
    const [existing] = await connection.query<any[]>(
      'SELECT id FROM email_profiles WHERE profile_key = ? LIMIT 1',
      [data.profile_key]
    );
    
    if (existing.length > 0) {
      // Update existing profile
      await connection.query(
        `UPDATE email_profiles SET
          profile_name = ?,
          provider_type = ?,
          email_address = ?,
          from_name = ?,
          reply_to = ?,
          smtp_host = ?,
          smtp_port = ?,
          smtp_encryption = ?,
          smtp_authentication = ?,
          smtp_username = ?,
          smtp_password = ?,
          connection_timeout = ?,
          max_retries = ?,
          is_active = ?,
          updated_by = ?,
          updated_at = NOW()
        WHERE profile_key = ?`,
        [
          data.profile_name,
          data.provider_type,
          data.email_address,
          data.from_name,
          data.reply_to || null,
          data.smtp_host,
          data.smtp_port,
          data.smtp_encryption,
          data.smtp_authentication ? 1 : 0,
          data.smtp_username,
          encryptedPassword,
          data.connection_timeout || 30,
          data.max_retries || 3,
          data.is_active !== false ? 1 : 0,
          data.updated_by || null,
          data.profile_key
        ]
      );
      return existing[0].id;
    } else {
      // Insert new profile
      const [result] = await connection.query<any>(
        `INSERT INTO email_profiles (
          profile_key, profile_name, provider_type, email_address, from_name,
          reply_to, smtp_host, smtp_port, smtp_encryption, smtp_authentication,
          smtp_username, smtp_password, connection_timeout, max_retries,
          is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.profile_key,
          data.profile_name,
          data.provider_type,
          data.email_address,
          data.from_name,
          data.reply_to || null,
          data.smtp_host,
          data.smtp_port,
          data.smtp_encryption,
          data.smtp_authentication ? 1 : 0,
          data.smtp_username,
          encryptedPassword,
          data.connection_timeout || 30,
          data.max_retries || 3,
          data.is_active !== false ? 1 : 0,
          data.updated_by || null
        ]
      );
      return result.insertId;
    }
  } finally {
    connection.release();
  }
}

/**
 * Test email profile connection and send test email
 */
export async function testEmailProfile(profileKey: string, testEmail?: string): Promise<{
  success: boolean;
  message: string;
}> {
  const profile = await getEmailProfile(profileKey);
  
  if (!profile) {
    return {
      success: false,
      message: 'Email profile not found or inactive'
    };
  }
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: profile.smtp_host,
      port: profile.smtp_port,
      secure: profile.smtp_encryption === 'ssl',
      auth: profile.smtp_authentication ? {
        user: profile.smtp_username,
        pass: profile.smtp_password_decrypted
      } : undefined,
      connectionTimeout: (profile.connection_timeout || 30) * 1000,
      greetingTimeout: 15000,
      socketTimeout: 45000,
    });
    
    // Verify connection
    await transporter.verify();
    
    // If test email is provided, send a test email
    if (testEmail) {
      const testDate = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      await transporter.sendMail({
        from: `"${profile.from_name}" <${profile.email_address}>`,
        replyTo: profile.reply_to || profile.email_address,
        to: testEmail,
        subject: `Test Email from ${profile.profile_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 4px; }
              .info-label { font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; }
              .info-value { color: #374151; margin-top: 5px; }
              .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600; font-size: 14px; }
              .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">✅ Test Email Successful</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">SMTP Configuration Verified</p>
              </div>
              <div class="content">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span class="success-badge">✓ Connection Verified</span>
                </div>
                
                <p style="font-size: 14px; color: #374151;">
                  This is a test email to confirm that your SMTP configuration is working correctly.
                </p>

                <div class="info-box">
                  <div class="info-label">Email Profile</div>
                  <div class="info-value">${profile.profile_name}</div>
                </div>

                <div class="info-box">
                  <div class="info-label">From Address</div>
                  <div class="info-value">${profile.email_address}</div>
                </div>

                <div class="info-box">
                  <div class="info-label">SMTP Server</div>
                  <div class="info-value">${profile.smtp_host}:${profile.smtp_port} (${profile.smtp_encryption.toUpperCase()})</div>
                </div>

                <div class="info-box">
                  <div class="info-label">Test Date & Time</div>
                  <div class="info-value">${testDate}</div>
                </div>

                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 4px; margin-top: 20px;">
                  <p style="margin: 0; font-size: 13px; color: #1e40af;">
                    <strong>✓ Success!</strong> If you received this email, your SMTP configuration is working perfectly.
                  </p>
                </div>

                <div class="footer">
                  <p style="margin: 0;">This is an automated test email from <strong>ANSAR TECHNOLOGIES</strong></p>
                  <p style="margin: 5px 0 0 0;">Email Profile Management System</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Test Email Successful

This is a test email to confirm that your SMTP configuration is working correctly.

Email Profile: ${profile.profile_name}
From Address: ${profile.email_address}
SMTP Server: ${profile.smtp_host}:${profile.smtp_port} (${profile.smtp_encryption.toUpperCase()})
Test Date & Time: ${testDate}

If you received this email, your SMTP configuration is working perfectly.

---
This is an automated test email from ANSAR TECHNOLOGIES
Email Profile Management System
        `
      });
    }
    
    // Update test status
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE email_profiles SET 
          last_test_at = NOW(),
          test_status = 'success',
          test_message = ?
        WHERE profile_key = ?`,
        [testEmail ? `Test email sent to ${testEmail}` : 'Connection successful', profileKey]
      );
    } finally {
      connection.release();
    }
    
    return {
      success: true,
      message: testEmail 
        ? `Test email sent successfully to ${testEmail}` 
        : 'SMTP connection successful'
    };
  } catch (error: any) {
    // Update test status
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE email_profiles SET 
          last_test_at = NOW(),
          test_status = 'failed',
          test_message = ?
        WHERE profile_key = ?`,
        [error.message || 'Connection failed', profileKey]
      );
    } finally {
      connection.release();
    }
    
    return {
      success: false,
      message: error.message || 'SMTP connection failed'
    };
  }
}

/**
 * Create nodemailer transporter from profile
 */
export async function createTransporter(profileKey: string) {
  const profile = await getEmailProfile(profileKey);
  
  if (!profile) {
    throw new Error(`Email profile '${profileKey}' not found or inactive`);
  }
  
  return nodemailer.createTransport({
    host: profile.smtp_host,
    port: profile.smtp_port,
    secure: profile.smtp_encryption === 'ssl',
    auth: profile.smtp_authentication ? {
      user: profile.smtp_username,
      pass: profile.smtp_password_decrypted
    } : undefined,
    connectionTimeout: (profile.connection_timeout || 30) * 1000,
    greetingTimeout: 15000,
    socketTimeout: 45000,
  });
}

/**
 * Send email using profile
 */
export async function sendEmailWithProfile(
  profileKey: string,
  options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: any[];
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const profile = await getEmailProfile(profileKey);
    
    if (!profile) {
      return {
        success: false,
        error: `Email profile '${profileKey}' not found or inactive`
      };
    }
    
    const transporter = await createTransporter(profileKey);
    
    const info = await transporter.sendMail({
      from: `"${profile.from_name}" <${profile.email_address}>`,
      replyTo: profile.reply_to || profile.email_address,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments
    });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error: any) {
    console.error(`[Email Profile: ${profileKey}] Send error:`, error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Delete email profile
 */
export async function deleteEmailProfile(profileKey: string): Promise<boolean> {
  // Don't allow deletion of core profiles
  if (['support', 'hr'].includes(profileKey)) {
    throw new Error('Cannot delete core email profiles (support, hr)');
  }
  
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query<any>(
      'DELETE FROM email_profiles WHERE profile_key = ?',
      [profileKey]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Toggle email profile active status
 */
export async function toggleEmailProfile(profileKey: string, isActive: boolean): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query<any>(
      'UPDATE email_profiles SET is_active = ?, updated_at = NOW() WHERE profile_key = ?',
      [isActive ? 1 : 0, profileKey]
    );
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

