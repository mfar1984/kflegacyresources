import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { sendVerificationEmail, notifyAdminNewTicket } from '@/lib/email-helpdesk';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to generate unique ticket number
function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000000) + 10000000;
  return `TKT-${year}-${random}`;
}

// Helper to generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper to get client IP
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]) : req.socket.remoteAddress;
  return ip || 'Unknown';
}

// Helper to verify reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  const RECAPTCHA_SECRET = "6Lf7hforAAAAAJrNd5KuXL9Hhi9U_j5ueHrGBxcO";
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'helpdesk');
    await fs.mkdir(uploadDir, { recursive: true });

    // Parse form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Extract form fields
    const companyName = Array.isArray(fields.company_name) ? fields.company_name[0] : fields.company_name;
    const contactPerson = Array.isArray(fields.contact_person) ? fields.contact_person[0] : fields.contact_person;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
    const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const priority = Array.isArray(fields.priority) ? fields.priority[0] : fields.priority;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const recaptchaToken = Array.isArray(fields.recaptcha_token) ? fields.recaptcha_token[0] : fields.recaptcha_token;

    // Validation
    if (!companyName || !contactPerson || !email || !phone || !password || !subject || !category || !priority || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken as string);
    if (!isRecaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    // Get client IP
    const clientIP = getClientIP(req);

    // Check if email already exists
    const existingClient = await query(
      'SELECT id FROM client_users WHERE email = ?',
      [email]
    ) as any[];

    if (existingClient && existingClient.length > 0) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password as string, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert client user
    const clientResult = await query(
      `INSERT INTO client_users (
        company_name, contact_person, email, phone, password_hash, address,
        status, email_verified, email_verification_token, token_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending_verification', 0, ?, ?)`,
      [companyName, contactPerson, email, phone, passwordHash, address || '', verificationToken, tokenExpiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    ) as any;

    const clientId = clientResult.insertId;

    // Handle file attachments
    const attachments: string[] = [];
    if (files.attachments) {
      const fileArray = Array.isArray(files.attachments) ? files.attachments : [files.attachments];
      for (const file of fileArray) {
        if (file && (file as FormidableFile).size > 0) {
          const filename = path.basename((file as FormidableFile).filepath);
          attachments.push(filename);
        }
      }
    }

    // Generate ticket number
    const ticketNo = generateTicketNumber();

    // Insert ticket with IP address
    await query(
      `INSERT INTO helpdesk_tickets (
        ticket_no, client_id, subject, category, priority, status, description, attachments, ip_address
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [ticketNo, clientId, subject, category, priority, description, JSON.stringify(attachments), clientIP]
    );

    // Send verification email to client
    try {
      await sendVerificationEmail(email as string, contactPerson as string, verificationToken, ticketNo);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail the request if email fails
    }

    // Notify admin about new ticket
    try {
      await notifyAdminNewTicket(
        ticketNo,
        companyName as string,
        contactPerson as string,
        email as string,
        subject as string,
        category as string,
        priority as string
      );
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Ticket submitted successfully! Please check your email to verify your account.',
      ticketNo,
    });
  } catch (error: any) {
    console.error('Error in helpdesk submit:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

