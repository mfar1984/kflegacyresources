import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { query } from '@/lib/db';

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_name: string;
  smtp_from_email: string;
  smtp_reply_to: string;
}

// MEMORY LEAK FIX: Reuse single transporter instance instead of creating new one each time
let cachedTransporter: Transporter | null = null;
let cachedSettings: EmailSettings | null = null;
let lastSettingsCheck = 0;
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEmailSettings(): Promise<EmailSettings> {
  // Return cached settings if still valid
  const now = Date.now();
  if (cachedSettings && (now - lastSettingsCheck) < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const rows = await query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_type = ?',
      ['email']
    ) as any[];

    const settings: any = {};
    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    // Build settings with fallback to env vars
    const emailSettings: EmailSettings = {
      smtp_host: settings.smtp_host || process.env.SMTP_HOST || 'indigo.herosite.pro',
      smtp_port: settings.smtp_port || process.env.SMTP_PORT || '587',
      smtp_username: settings.smtp_username || process.env.SMTP_USER || 'enquiry@kflegacyresources.com',
      smtp_password: settings.smtp_password || process.env.SMTP_PASSWORD || 'F@iz@n!984',
      smtp_encryption: settings.smtp_encryption || 'tls',
      smtp_from_name: settings.smtp_from_name || 'KF Legacy Resources',
      smtp_from_email: settings.smtp_from_email || process.env.SMTP_FROM || 'enquiry@kflegacyresources.com',
      smtp_reply_to: settings.smtp_reply_to || 'enquiry@kflegacyresources.com',
    };

    // Cache the settings
    cachedSettings = emailSettings;
    lastSettingsCheck = now;

    return emailSettings;
  } catch (error) {
    console.error('Failed to fetch email settings from database:', error);
    // Fallback to env vars
    const fallbackSettings: EmailSettings = {
      smtp_host: process.env.SMTP_HOST || 'indigo.herosite.pro',
      smtp_port: process.env.SMTP_PORT || '587',
      smtp_username: process.env.SMTP_USER || 'enquiry@kflegacyresources.com',
      smtp_password: process.env.SMTP_PASSWORD || 'F@iz@n!984',
      smtp_encryption: 'tls',
      smtp_from_name: 'KF Legacy Resources',
      smtp_from_email: process.env.SMTP_FROM || 'enquiry@kflegacyresources.com',
      smtp_reply_to: 'enquiry@kflegacyresources.com',
    };

    // Cache fallback settings too
    cachedSettings = fallbackSettings;
    lastSettingsCheck = now;

    return fallbackSettings;
  }
}

/**
 * Get or create email transporter (REUSES existing transporter to prevent memory leak)
 * MEMORY LEAK FIX: Previously created new transporter on every email send
 * Now reuses single transporter instance with connection pooling
 */
export async function createTransporter() {
  const settings = await getEmailSettings();
  
  // If transporter exists and settings haven't changed, reuse it
  if (cachedTransporter) {
    // Verify transporter is still working
    try {
      await cachedTransporter.verify();
      return cachedTransporter;
    } catch (error) {
      console.log('[Email] Transporter verification failed, recreating...');
      // Close old transporter properly to free resources
      cachedTransporter.close();
      cachedTransporter = null;
    }
  }

  // Create new transporter with connection pooling
  console.log('[Email] Creating new transporter with connection pooling');
  cachedTransporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: parseInt(settings.smtp_port),
    secure: settings.smtp_encryption === 'ssl', // true for 465, false for other ports
    auth: {
      user: settings.smtp_username,
      pass: settings.smtp_password,
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true, // CRITICAL: Enable connection pooling to reuse connections
    maxConnections: 5, // Limit concurrent connections
    maxMessages: 100, // Reuse connection for up to 100 messages
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
  });

  return cachedTransporter;
}

/**
 * Cleanup function to properly close transporter on shutdown
 * Call this during graceful shutdown to prevent connection leaks
 */
export function closeTransporter(): void {
  if (cachedTransporter) {
    console.log('[Email] Closing transporter...');
    cachedTransporter.close();
    cachedTransporter = null;
  }
}

export async function sendQuotationEmail(data: {
  title: string;
  firstName: string;
  lastName: string;
  hpNumber: string;
  email: string;
  companyName: string;
  companyAddress: string;
  officeTel: string;
  officeFax: string;
  website: string;
  question: string;
  attachmentPath?: string;
  attachmentName?: string;
}) {
  const transporter = await createTransporter();
  const settings = await getEmailSettings();

  // Email to admin
  const adminMailOptions = {
    from: `"${settings.smtp_from_name}" <${settings.smtp_from_email}>`,
    to: settings.smtp_username,
    replyTo: settings.smtp_reply_to,
    subject: `New Quotation Request from ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">New Quotation Request</h2>
        
        <h3 style="color: #444; margin-top: 20px;">Personal Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Title:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>HP Number:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.hpNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.email}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Company Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.companyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Tel:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.officeTel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Office Fax:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.officeFax}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Website:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.website}</td>
          </tr>
        </table>

        <h3 style="color: #444; margin-top: 20px;">Question/Request</h3>
        <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4154f1; margin-top: 10px;">
          ${data.question.replace(/\n/g, '<br>')}
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This email was sent from the KF Legacy Resources website quotation form.
        </p>
      </div>
    `,
    attachments: data.attachmentPath ? [{
      filename: data.attachmentName || 'attachment',
      path: data.attachmentPath
    }] : []
  };

  // Email to client
  const clientMailOptions = {
    from: `"${settings.smtp_from_name}" <${settings.smtp_from_email}>`,
    to: data.email,
    replyTo: settings.smtp_reply_to,
    subject: 'Thank you for your Quotation Request - KF Legacy Resources',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #012970; border-bottom: 2px solid #4154f1; padding-bottom: 10px;">Thank You for Your Request</h2>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Dear ${data.title} ${data.firstName} ${data.lastName},</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Thank you for submitting your quotation request to KF Legacy Resources. We have received your inquiry and our team will review it shortly.
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #012970; margin-top: 0;">What happens next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Our team will review your request within 24 hours</li>
            <li>We will prepare a detailed quotation based on your requirements</li>
            <li>You will receive our response via email or phone call</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          If you have any urgent questions, please feel free to contact us:
        </p>

        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 5px;"><strong>Email:</strong></td>
            <td style="padding: 5px;">enquiry@kflegacyresources.com</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Phone:</strong></td>
            <td style="padding: 5px;">+60 3-9132 2122</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Best regards,<br>
          <strong>KF Legacy Resources Team</strong>
        </p>

        <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    `
  };

  // Send both emails
  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(clientMailOptions);
}

export async function sendSubscriptionEmails(data: { email: string }) {
  const transporter = await createTransporter();
  const settings = await getEmailSettings();

  // Notify admin
  await transporter.sendMail({
    from: `${settings.smtp_from_email}`,
    to: settings.smtp_username,
    replyTo: settings.smtp_reply_to,
    subject: 'New Newsletter Subscriber – KF Legacy Resources',
    text: `New subscriber: ${data.email}`,
  });

  // Thank subscriber
  const siteUrl = process.env.SITE_URL || 'https://www.kflegacyresources.com';
  const logoUrl = `${siteUrl}/assets/img/logo.png`;

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f9fc;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;">
          <tr>
            <td style="background:#0d6efd;padding:18px 24px;" align="left">
              <img src="${logoUrl}" alt="KF Legacy Resources" height="32" style="display:block;border:0;outline:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#0b1220;">Thank you for subscribing</h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">Hi there,</p>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">You're now subscribed to updates from <strong>KF Legacy Resources</strong>. We'll occasionally share product updates, case studies and useful tips.</p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;color:#334155;">In the meantime, feel free to visit our website.</p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;" bgcolor="#0d6efd">
                    <a href="${siteUrl}" style="display:inline-block;padding:10px 16px;font-size:14px;color:#ffffff;text-decoration:none;border-radius:8px;">Visit Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px 28px;border-top:1px solid #eef2f7;">
              <p style="margin:0;font-size:12px;color:#64748b;">You're receiving this email because you subscribed on our site. If this wasn't you, simply ignore this email.</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} KF Legacy Resources</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  await transporter.sendMail({
    from: `${settings.smtp_from_email}`,
    to: data.email,
    replyTo: settings.smtp_reply_to,
    subject: 'Thank you for subscribing – KF Legacy Resources',
    html,
    text: `Thank you for subscribing to KF Legacy Resources. Visit ${siteUrl}`,
  });
}

