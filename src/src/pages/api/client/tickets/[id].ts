import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { notifyAdminClientReply } from '@/lib/email-helpdesk';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get client IP
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]) : req.socket.remoteAddress;
  return ip || 'Unknown';
}

// Verify client session
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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Get session hash from cookie or query
    const sessionHash = req.cookies.session_token || (req.query.hash as string) || '';
    const client = await verifyClientSession(sessionHash);

    if (!client) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    if (req.method === 'GET') {
      // Get ticket details with replies
      const tickets = await query(
        `SELECT * FROM helpdesk_tickets 
         WHERE id = ? AND client_id = ?`,
        [id, client.client_id]
      ) as any[];

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticket = tickets[0];
      // Normalize ticket attachments
      if (ticket.attachments !== undefined && ticket.attachments !== null && ticket.attachments !== '') {
        const raw = ticket.attachments as any;
        if (Array.isArray(raw)) {
          // keep
        } else if (typeof raw === 'object') {
          // keep parsed object/array
        } else if (typeof raw === 'string') {
          const s = raw.trim();
          if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
            try { ticket.attachments = JSON.parse(s); } catch { ticket.attachments = [s]; }
          } else {
            ticket.attachments = [s];
          }
        } else {
          ticket.attachments = [];
        }
      } else {
        ticket.attachments = [];
      }

      // Get replies
      const replies = await query(
        `SELECT * FROM helpdesk_replies 
         WHERE ticket_id = ? 
         ORDER BY created_at ASC`,
        [id]
      ) as any[];

      const parsedReplies = replies.map(reply => {
        const raw = (reply as any).attachments;
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
        return { ...reply, attachments };
      });

      return res.status(200).json({
        ticket,
        replies: parsedReplies,
      });
    }

    if (req.method === 'POST') {
      // Client reply to ticket
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

      const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Verify ticket belongs to this client
      const tickets = await query(
        `SELECT * FROM helpdesk_tickets WHERE id = ? AND client_id = ?`,
        [id, client.client_id]
      ) as any[];

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticket = tickets[0];

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

      // Get client IP
      const clientIP = getClientIP(req);

      // Insert reply with IP
      await query(
        `INSERT INTO helpdesk_replies (
          ticket_id, replied_by_type, replied_by_id, replied_by_name, replied_by_email, message, attachments, ip_address
        ) VALUES (?, 'client', ?, ?, ?, ?, ?, ?)`,
        [id, client.client_id, client.contact_person, client.email, message, JSON.stringify(attachments), clientIP]
      );

      // Update ticket updated_at and status to waiting_client if it was closed/resolved
      await query(
        `UPDATE helpdesk_tickets 
         SET updated_at = NOW(), status = CASE 
           WHEN status IN ('resolved', 'closed') THEN 'open'
           ELSE status
         END
         WHERE id = ?`,
        [id]
      );

      // Send email notification to admin and assigned user
      try {
        await notifyAdminClientReply(
          ticket.ticket_no,
          client.company_name,
          ticket.subject,
          message as string,
          ticket.assigned_to_email
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in client ticket detail API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

