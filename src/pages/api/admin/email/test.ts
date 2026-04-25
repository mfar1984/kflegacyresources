import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { testEmail, smtpSettings } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required',
      });
    }

    if (!smtpSettings || !smtpSettings.smtp_host || !smtpSettings.smtp_username || !smtpSettings.smtp_password) {
      return res.status(400).json({
        success: false,
        message: 'SMTP settings are incomplete. Please configure SMTP settings first.',
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.smtp_host,
      port: parseInt(smtpSettings.smtp_port) || 587,
      secure: smtpSettings.smtp_encryption === 'ssl', // true for 465, false for other ports
      auth: {
        user: smtpSettings.smtp_username,
        pass: smtpSettings.smtp_password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify connection
    try {
      await transporter.verify();
    } catch (error: any) {
      return res.status(200).json({
        success: false,
        message: `SMTP connection failed: ${error.message}\n\nPlease check your SMTP settings.`,
      });
    }

    // Send test email
    const mailOptions = {
      from: `"${smtpSettings.smtp_from_name}" <${smtpSettings.smtp_from_email}>`,
      to: testEmail,
      replyTo: smtpSettings.smtp_reply_to,
      subject: 'Test Email from KF Legacy Resources',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        ✅ Test Email Successful
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Congratulations! Your SMTP email configuration is working correctly.
                      </p>
                      
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>📧 Email Details:</strong><br>
                          <strong>From:</strong> ${smtpSettings.smtp_from_name} &lt;${smtpSettings.smtp_from_email}&gt;<br>
                          <strong>To:</strong> ${testEmail}<br>
                          <strong>SMTP Host:</strong> ${smtpSettings.smtp_host}<br>
                          <strong>SMTP Port:</strong> ${smtpSettings.smtp_port}<br>
                          <strong>Encryption:</strong> ${smtpSettings.smtp_encryption.toUpperCase()}
                        </p>
                      </div>
                      
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        This is a test email sent from your KF Legacy Resources admin panel to verify your email configuration.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} KF Legacy Resources. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated test email. Please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Test Email Successful

Congratulations! Your SMTP email configuration is working correctly.

Email Details:
- From: ${smtpSettings.smtp_from_name} <${smtpSettings.smtp_from_email}>
- To: ${testEmail}
- SMTP Host: ${smtpSettings.smtp_host}
- SMTP Port: ${smtpSettings.smtp_port}
- Encryption: ${smtpSettings.smtp_encryption.toUpperCase()}

This is a test email sent from your KF Legacy Resources admin panel to verify your email configuration.

© ${new Date().getFullYear()} KF Legacy Resources. All rights reserved.
This is an automated test email. Please do not reply.
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(200).json({
      success: false,
      message: `Failed to send test email: ${error.message}`,
    });
  }
}
