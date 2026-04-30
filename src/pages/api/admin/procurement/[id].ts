import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import nodemailer from 'nodemailer';

async function verifySessionFromDB(hash: string): Promise<boolean> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      return expires > new Date();
    }
    return false;
  } catch (err) {
    console.error('Session verification error:', err);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, hash } = req.query;

  // Verify session
  const isValid = await verifySessionFromDB(hash as string);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: Fetch single application
  if (req.method === 'GET') {
    try {
      const applications = await query(
        'SELECT * FROM procurement_applications WHERE id = ?',
        [id as string]
      ) as any[];

      if (applications.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json(applications[0]);
    } catch (error) {
      console.error('Error fetching application:', error);
      return res.status(500).json({ error: 'Failed to fetch application' });
    }
  }

  // PATCH: Update application (approve/reject)
  if (req.method === 'PATCH') {
    try {
      const { status: newStatus, lo_value, approval_notes, rejection_reason } = req.body;

      // Get application details
      const applications = await query(
        'SELECT * FROM procurement_applications WHERE id = ?',
        [id as string]
      ) as any[];

      if (applications.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const application = applications[0];

      // Update based on status
      if (newStatus === 'approved') {
        await query(
          `UPDATE procurement_applications 
           SET status = 'approved', lo_value = ?, approval_notes = ?, approval_date = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [lo_value, approval_notes, id as string]
        );

        // Send approval email
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hr@ansartechnologies.my',
              pass: 'toim jetm qyps youu'
            }
          });

          const approvalEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #ffffff; }
    .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .lo-value { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    td:first-child { font-weight: bold; width: 40%; background-color: #f8f9fa; }
    .footer { background-color: #343a40; color: #ffffff; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Supplier Application Approved!</h1>
      <p>ANSAR TECHNOLOGIES SDN. BHD.</p>
    </div>

    <div class="content">
      <p>Dear <strong>${application.company_name}</strong>,</p>
      
      <div class="success-box">
        <p style="margin: 0;"><strong>✓ Congratulations!</strong> Your supplier registration has been approved.</p>
      </div>

      <table>
        <tr><td>Application No</td><td>${application.application_no}</td></tr>
        <tr><td>Company Name</td><td>${application.company_name}</td></tr>
        <tr><td>Status</td><td><span style="color: #28a745; font-weight: bold;">APPROVED</span></td></tr>
        <tr><td>Approval Date</td><td>${new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</td></tr>
      </table>

      <h3 style="color: #007bff; margin-top: 30px;">Local Order (LO) Authorization</h3>
      <div class="lo-value">
        RM ${parseFloat(lo_value).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p style="text-align: center; color: #666; font-size: 13px;">Maximum value per Local Order</p>

      ${approval_notes ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📝 Notes from Procurement Team:</strong></p>
        <p style="margin: 10px 0 0 0;">${approval_notes}</p>
      </div>
      ` : ''}

      <h3 style="color: #007bff; margin-top: 30px;">What's Next?</h3>
      <ul>
        <li>You are now an approved supplier for ANSAR TECHNOLOGIES SDN. BHD.</li>
        <li>You can participate in Local Order (LO) procurement processes up to the authorized value.</li>
        <li>Our procurement team will contact you for upcoming projects and opportunities.</li>
        <li>Please ensure all company information and certifications are kept up to date.</li>
      </ul>

      <div style="background-color: #e7f3ff; border: 1px solid #007bff; border-radius: 5px; padding: 20px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #007bff;">📞 Contact Information</h4>
        <p><strong>Email:</strong> hr@ansartechnologies.my</p>
        <p><strong>Phone:</strong> 03-8959 0530</p>
        <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
      </div>

      <p style="color: #666; font-size: 13px; margin-top: 30px;">
        We look forward to a successful business partnership with your company.
      </p>
    </div>

    <div class="footer">
      <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      <p style="font-size: 11px;">( 940482-W / 201101012342 )</p>
      <p>B2-1-34, TINGKAT 1, JALAN PINGGIRAN 1/3<br>
      TAMAN PINGGIRAN PUTRA, 43300 SERI KEMBANGAN<br>
      SELANGOR, MALAYSIA</p>
      <p>© ${new Date().getFullYear()} ANSAR TECHNOLOGIES. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
          `;

          await transporter.sendMail({
            from: '"ANSAR TECHNOLOGIES Procurement Team" <hr@ansartechnologies.my>',
            to: application.email,
            subject: `Supplier Application Approved - LO Authorization RM ${parseFloat(lo_value).toLocaleString('en-MY')}`,
            html: approvalEmailHtml,
          });
        } catch (emailError) {
          console.error('Approval email error:', emailError);
        }

      } else if (newStatus === 'rejected') {
        await query(
          `UPDATE procurement_applications 
           SET status = 'rejected', rejection_reason = ?, rejected_date = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [rejection_reason, id as string]
        );

        // Send rejection email
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hr@ansartechnologies.my',
              pass: 'toim jetm qyps youu'
            }
          });

          const rejectionEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #6c757d; color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #ffffff; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    td:first-child { font-weight: bold; width: 40%; background-color: #f8f9fa; }
    .footer { background-color: #343a40; color: #ffffff; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Supplier Application Status Update</h1>
      <p>ANSAR TECHNOLOGIES SDN. BHD.</p>
    </div>

    <div class="content">
      <p>Dear <strong>${application.company_name}</strong>,</p>
      
      <p>Thank you for your interest in becoming a registered supplier with ANSAR TECHNOLOGIES SDN. BHD.</p>

      <p>After careful review of your application, we regret to inform you that we are unable to proceed with your registration at this time.</p>

      <table>
        <tr><td>Application No</td><td>${application.application_no}</td></tr>
        <tr><td>Company Name</td><td>${application.company_name}</td></tr>
        <tr><td>Review Date</td><td>${new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</td></tr>
      </table>

      ${rejection_reason ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📝 Feedback:</strong></p>
        <p style="margin: 10px 0 0 0;">${rejection_reason}</p>
      </div>
      ` : ''}

      <p>We encourage you to reapply in the future if your business circumstances change or if you can address the concerns mentioned.</p>

      <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 20px; margin: 20px 0;">
        <h4 style="margin-top: 0;">📞 Questions?</h4>
        <p>For more information, please contact our procurement team:</p>
        <p><strong>Email:</strong> hr@ansartechnologies.my</p>
        <p><strong>Phone:</strong> 03-8959 0530</p>
      </div>

      <p style="color: #666; font-size: 13px; margin-top: 30px;">
        We appreciate your interest in ANSAR TECHNOLOGIES and wish you success in your business endeavors.
      </p>
    </div>

    <div class="footer">
      <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      <p style="font-size: 11px;">( 940482-W / 201101012342 )</p>
      <p>© ${new Date().getFullYear()} ANSAR TECHNOLOGIES. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
          `;

          await transporter.sendMail({
            from: '"ANSAR TECHNOLOGIES Procurement Team" <hr@ansartechnologies.my>',
            to: application.email,
            subject: 'Supplier Application Status Update',
            html: rejectionEmailHtml,
          });
        } catch (emailError) {
          console.error('Rejection email error:', emailError);
        }
      }

      return res.status(200).json({ success: true, message: 'Application updated successfully' });
    } catch (error) {
      console.error('Error updating application:', error);
      return res.status(500).json({ error: 'Failed to update application' });
    }
  }

  // DELETE: Remove application
  if (req.method === 'DELETE') {
    try {
      await query('DELETE FROM procurement_applications WHERE id = ?', [id as string]);
      return res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Error deleting application:', error);
      return res.status(500).json({ error: 'Failed to delete application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

