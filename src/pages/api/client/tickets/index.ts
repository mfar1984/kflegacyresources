import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

// Verify client session using cookie or hash fallback
async function verifyClientSession(sessionHash: string) {
  if (!sessionHash) return null;

  const sessions = await query(
    `SELECT s.client_id, c.* 
     FROM admin_sessions s
     JOIN client_users c ON s.client_id = c.id
     WHERE s.hash = ? AND s.user_type = 'client' AND s.expires_at > NOW()`,
    [sessionHash]
  ) as any[];

  return sessions && sessions.length > 0 ? sessions[0] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session hash from cookie or query
    const sessionHash = req.cookies.session_token || (req.query.hash as string) || '';
    const client = await verifyClientSession(sessionHash);

    if (!client) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    if (req.method === 'GET') {
      // List all tickets for this client
      const tickets = await query(
        `SELECT * FROM helpdesk_tickets 
         WHERE client_id = ? 
         ORDER BY created_at DESC`,
        [client.client_id]
      ) as any[];

      // Normalize attachments (array, JSON string, single filename, or null)
      const parsedTickets = tickets.map(ticket => {
        const raw = (ticket as any).attachments;
        let attachments: any = [];
        if (raw !== undefined && raw !== null && raw !== '') {
          if (Array.isArray(raw)) {
            attachments = raw;
          } else if (typeof raw === 'object') {
            attachments = raw;
          } else if (typeof raw === 'string') {
            const s = raw.trim();
            if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
              try { attachments = JSON.parse(s); } catch { attachments = [s]; }
            } else {
              attachments = [s];
            }
          }
        }
        return { ...ticket, attachments };
      });

      return res.status(200).json({ tickets: parsedTickets });
    }

    if (req.method === 'POST') {
      // Create new ticket
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'helpdesk');
      await fs.mkdir(uploadDir, { recursive: true });

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

      const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
      const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
      const priority = Array.isArray(fields.priority) ? fields.priority[0] : fields.priority;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;

      if (!subject || !category || !priority || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Handle attachments
      const attachments: string[] = [];
      if (files.attachments) {
        const fileArray = Array.isArray(files.attachments) ? files.attachments : [files.attachments];
        for (const file of fileArray) {
          if (file && file.size > 0) {
            const filename = path.basename(file.filepath);
            attachments.push(filename);
          }
        }
      }

      // Generate ticket number
      const ticketNo = generateTicketNumber();

      // Insert ticket
      await query(
        `INSERT INTO helpdesk_tickets (
          ticket_no, client_id, subject, category, priority, status, description, attachments
        ) VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`,
        [ticketNo, client.client_id, subject, category, priority, description, JSON.stringify(attachments)]
      );

      // TODO: Send email notification to admin

      return res.status(200).json({
        success: true,
        message: 'Ticket created successfully',
        ticketNo,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in client tickets API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

