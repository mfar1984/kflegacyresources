import nodemailer from 'nodemailer';

// Helpdesk Email Configuration (support@ansartechnologies.my)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'support@ansartechnologies.my',
    pass: 'gvvu wdfq qrpt zjnj',
  },
});

// Email verification email to client
export async function sendVerificationEmail(
  clientEmail: string,
  contactPerson: string,
  verificationToken: string,
  ticketNo: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/client/verify?token=${verificationToken}`;

  const mailOptions = {
    from: '"Ansar Technologies Support" <support@ansartechnologies.my>',
    to: clientEmail,
    subject: 'Verify Your Email - Ansar Technologies Support Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #3b82f6; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .credentials { background: #ffffff; border: 2px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 6px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎫 Support Ticket Submitted</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${contactPerson}</strong>,</p>
            <p>Thank you for submitting a support ticket (<strong>${ticketNo}</strong>).</p>
            <p><strong>Please verify your email address to activate your support portal account:</strong></p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            <p style="font-size: 12px; color: #6b7280;">Or copy and paste this link in your browser:<br>${verificationLink}</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #1e3a8a;">📋 Your Login Credentials</h3>
              <p>After verification, you can login to track your tickets:</p>
              <p style="margin: 8px 0;"><strong>Login URL:</strong> ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login</p>
              <p style="margin: 8px 0;"><strong>Username:</strong> ${clientEmail}</p>
              <p style="margin: 8px 0;"><strong>Password:</strong> (The password you set during registration)</p>
            </div>

            <h4 style="color: #1e3a8a; margin-top: 30px;">📌 Your Ticket Details:</h4>
            <p style="margin: 5px 0;">• <strong>Ticket No:</strong> ${ticketNo}</p>
            <p style="margin: 5px 0;">• <strong>Status:</strong> Pending Review</p>
            
            <p style="margin-top: 30px;">Once verified, you can:</p>
            <ul>
              <li>View your ticket status in real-time</li>
              <li>Reply to our support team</li>
              <li>Upload additional documents</li>
              <li>Track all your support tickets in one place</li>
            </ul>

            <p style="color: #dc2626; font-size: 13px; margin-top: 20px;">⏰ <strong>Note:</strong> This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ansar Technologies. All rights reserved.</p>
            <p>If you didn't submit this ticket, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

// Notification to support team about new ticket
export async function notifyAdminNewTicket(
  ticketNo: string,
  companyName: string,
  contactPerson: string,
  email: string,
  subject: string,
  category: string,
  priority: string
) {
  const mailOptions = {
    from: '"Ansar Technologies Support Portal" <support@ansartechnologies.my>',
    to: 'support@ansartechnologies.my',
    subject: `[New Ticket] ${ticketNo} - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { background: white; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .priority-urgent { background: #fee2e2; color: #dc2626; }
          .priority-high { background: #fed7aa; color: #ea580c; }
          .priority-medium { background: #fef3c7; color: #d97706; }
          .priority-low { background: #dbeafe; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🎫 New Support Ticket</h2>
          </div>
          <div class="content">
            <h3 style="color: #1e3a8a;">Ticket: ${ticketNo}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Contact Person:</strong> ${contactPerson}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Priority:</strong> <span class="badge priority-${priority.toLowerCase()}">${priority}</span></p>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Admin Portal
              </a>
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
              This ticket is awaiting verification from the client. Once verified, it will appear in your helpdesk dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
}

// Email notification when admin replies to ticket
export async function notifyClientAdminReply(
  clientEmail: string,
  contactPerson: string,
  ticketNo: string,
  subject: string,
  adminMessage: string
) {
  const ticketLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login`;

  const mailOptions = {
    from: '"Ansar Technologies Support" <support@ansartechnologies.my>',
    to: clientEmail,
    subject: `[Reply] ${ticketNo} - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .reply-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">💬 New Reply to Your Ticket</h2>
          </div>
          <div class="content">
            <p>Dear <strong>${contactPerson}</strong>,</p>
            <p>Our support team has replied to your ticket <strong>${ticketNo}</strong>:</p>
            
            <div class="reply-box">
              <p style="margin: 0; color: #6b7280; font-size: 12px; margin-bottom: 10px;">Support Team:</p>
              <p style="margin: 0;">${adminMessage.replace(/\n/g, '<br>')}</p>
            </div>

            <p>Please login to your support portal to view the full conversation and reply:</p>
            <div style="text-align: center;">
              <a href="${ticketLink}" class="button">View Ticket</a>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              <strong>Ticket:</strong> ${ticketNo}<br>
              <strong>Subject:</strong> ${subject}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending client reply notification:', error);
    throw error;
  }
}

// Email notification when client replies (notify admin and assigned user)
export async function notifyAdminClientReply(
  ticketNo: string,
  companyName: string,
  subject: string,
  clientMessage: string,
  assignedEmail?: string
) {
  const recipients = assignedEmail 
    ? ['support@ansartechnologies.my', assignedEmail]
    : ['support@ansartechnologies.my'];

  const mailOptions = {
    from: '"Ansar Technologies Support Portal" <support@ansartechnologies.my>',
    to: recipients.join(', '),
    subject: `[Client Reply] ${ticketNo} - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: white; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
          .message-box { background: #f0fdf4; padding: 15px; border-left: 4px solid #059669; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">💬 Client Replied to Ticket</h2>
          </div>
          <div class="content">
            <h3 style="color: #059669;">Ticket: ${ticketNo}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            
            <div class="message-box">
              <p style="margin: 0; color: #065f46; font-size: 12px; margin-bottom: 8px;"><strong>Client Message:</strong></p>
              <p style="margin: 0;">${clientMessage.replace(/\n/g, '<br>')}</p>
            </div>

            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View & Reply in Portal
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin client reply notification:', error);
    throw error;
  }
}

// Email notification when ticket is assigned to a user
export async function notifyUserAssignment(
  userEmail: string,
  userName: string,
  ticketNo: string,
  companyName: string,
  subject: string,
  priority: string
) {
  const mailOptions = {
    from: '"Ansar Technologies Support Portal" <support@ansartechnologies.my>',
    to: userEmail,
    subject: `[Assigned] ${ticketNo} - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { background: white; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📌 Ticket Assigned to You</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>A support ticket has been assigned to you:</p>
            
            <h3 style="color: #7c3aed;">Ticket: ${ticketNo}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Priority:</strong> <span class="badge" style="background: #fef3c7; color: #d97706;">${priority}</span></p>

            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login" 
                 style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket Details
              </a>
            </p>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              Please review and respond to this ticket as soon as possible.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending assignment notification:', error);
    throw error;
  }
}

// Email notification when ticket status changes
export async function notifyClientStatusChange(
  clientEmail: string,
  contactPerson: string,
  ticketNo: string,
  subject: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    'open': 'Your ticket is now open and being reviewed by our team.',
    'in_progress': 'Our team is actively working on your ticket.',
    'waiting_client': 'We are waiting for additional information from you.',
    'resolved': 'Your ticket has been resolved. Please login to view the solution.',
    'closed': 'Your ticket has been closed. If you need further assistance, please create a new ticket.',
  };

  const message = statusMessages[newStatus] || 'Your ticket status has been updated.';

  const mailOptions = {
    from: '"Ansar Technologies Support" <support@ansartechnologies.my>',
    to: clientEmail,
    subject: `[Status Update] ${ticketNo} - ${newStatus.replace('_', ' ').toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0891b2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🔔 Ticket Status Updated</h2>
          </div>
          <div class="content">
            <p>Dear <strong>${contactPerson}</strong>,</p>
            <p>The status of your ticket <strong>${ticketNo}</strong> has been updated:</p>
            
            <div style="text-align: center;">
              <span class="status-badge" style="background: #cffafe; color: #0891b2;">${newStatus.replace('_', ' ').toUpperCase()}</span>
            </div>

            <p>${message}</p>

            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login" 
                 style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Ticket Details
              </a>
            </p>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              <strong>Ticket:</strong> ${ticketNo}<br>
              <strong>Subject:</strong> ${subject}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending status change notification:', error);
    throw error;
  }
}

// Email notification when admin resets client password
export async function sendPasswordResetEmail(
  clientEmail: string,
  contactPerson: string,
  newPassword: string
) {
  const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login`;

  const mailOptions = {
    from: '"Ansar Technologies Support" <support@ansartechnologies.my>',
    to: clientEmail,
    subject: 'Your Password Has Been Reset - Ansar Technologies Support Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .credentials { background: #ffffff; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px; }
          .button { display: inline-block; background: #f59e0b; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🔑 Password Reset</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${contactPerson}</strong>,</p>
            <p>Your password has been reset by our support team.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #dc2626;">🔐 Your New Login Credentials</h3>
              <p style="margin: 8px 0;"><strong>Login URL:</strong> <a href="${loginLink}">${loginLink}</a></p>
              <p style="margin: 8px 0;"><strong>Username:</strong> ${clientEmail}</p>
              <p style="margin: 8px 0; font-size: 18px;"><strong>New Password:</strong> <code style="background: #fee2e2; padding: 8px 12px; border-radius: 4px; font-size: 16px;">${newPassword}</code></p>
            </div>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
              <p style="margin: 5px 0 0 0;">Please change this password immediately after logging in. Keep your password secure and do not share it with anyone.</p>
            </div>

            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Login to Your Account</a>
            </div>

            <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
              If you did not request this password reset, please contact our support team immediately.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ansar Technologies. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

