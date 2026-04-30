import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { notifyClientAdminReply, notifyUserAssignment, notifyClientStatusChange } from '@/lib/email-helpdesk';

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

// Get admin context (username, id, permissions) from session hash
async function getAdminContextFromHash(hash: string): Promise<{
  adminId: number;
  username: string;
  permissionNames: string[];
} | null> {
  if (!hash) return null;

  const sessions = await query(
    `SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1`,
    [hash]
  ) as { username: string; expires_at: string }[];

  if (!sessions || sessions.length === 0) return null;
  const { username, expires_at } = sessions[0];
  if (new Date(expires_at) <= new Date()) return null;

  const admins = await query(
    `SELECT id FROM admins WHERE username = ? LIMIT 1`,
    [username]
  ) as { id: number }[];
  if (!admins || admins.length === 0) return null;
  const adminId = admins[0].id;

  const permissions = await query(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]) as { module: string; action: string }[];
  const permissionNames = permissions.map(p => `${p.module}_${p.action}`);

  return { adminId, username, permissionNames };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, hash } = req.query;
    const sessionHash = (hash as string) || '';

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const context = await getAdminContextFromHash(sessionHash);

    if (!context) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Permissions as module_action strings
    const can = (perm: string) => context.permissionNames.includes(perm);

    if (req.method === 'GET') {
      if (!can('helpdesk_view')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get ticket details with client info and replies
      const tickets = await query(
        `SELECT 
          t.*,
          c.company_name,
          c.contact_person,
          c.email as client_email,
          c.phone as client_phone,
          c.address as client_address,
          u.full_name as assigned_user_name
        FROM helpdesk_tickets t
        JOIN client_users c ON t.client_id = c.id
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = ?`,
        [id]
      ) as any[];

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticket = tickets[0];
      // Normalize attachments for ticket
      if (ticket.attachments !== undefined && ticket.attachments !== null && ticket.attachments !== '') {
        const raw = ticket.attachments as any;
        if (Array.isArray(raw)) {
          // keep as-is
        } else if (typeof raw === 'object') {
          // keep parsed JSON object/array
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
      // Admin reply to ticket
      // Use existing permission naming convention: helpdesk_edit covers replies/updates
      if (!can('helpdesk_edit')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'helpdesk');
      await fs.mkdir(uploadDir, { recursive: true });

      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true,
      });

      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
      const isInternalNote = Array.isArray(fields.is_internal_note) 
        ? fields.is_internal_note[0] === 'true' 
        : fields.is_internal_note === 'true';

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get ticket info
      const tickets = await query(
        `SELECT t.*, c.email as client_email, c.contact_person 
         FROM helpdesk_tickets t
         JOIN client_users c ON t.client_id = c.id
         WHERE t.id = ?`,
        [id]
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
          ticket_id, replied_by_type, replied_by_id, replied_by_name, replied_by_email, message, attachments, is_internal_note, ip_address
        ) VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, ?)`,
        [id, context.adminId, context.username, context.username, message, JSON.stringify(attachments), isInternalNote ? 1 : 0, clientIP]
      );

      // Update ticket
      await query(
        `UPDATE helpdesk_tickets 
         SET updated_at = NOW(), status = CASE 
           WHEN status = 'pending' THEN 'open'
           WHEN status = 'waiting_client' THEN 'in_progress'
           ELSE status
         END
         WHERE id = ?`,
        [id]
      );

      // Send email notification to client (if not internal note)
      if (!isInternalNote) {
        try {
          await notifyClientAdminReply(
            ticket.client_email,
            ticket.contact_person,
            ticket.ticket_no,
            ticket.subject,
            message as string
          );
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
      });
    }

    if (req.method === 'PATCH') {
      // Update ticket (status, priority, assignment)
      // Use helpdesk_edit for updates
      if (!can('helpdesk_edit')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'helpdesk');
      await fs.mkdir(uploadDir, { recursive: true });

      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        multiples: true,
      });

      const [fields] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const status = Array.isArray(fields.status) ? fields.status[0] : fields.status;
      const priority = Array.isArray(fields.priority) ? fields.priority[0] : fields.priority;
      const assignedTo = Array.isArray(fields.assigned_to) ? fields.assigned_to[0] : fields.assigned_to;
      const assignedToEmail = Array.isArray(fields.assigned_to_email) ? fields.assigned_to_email[0] : fields.assigned_to_email;

      // Get current ticket info
      const tickets = await query(
        `SELECT t.*, c.email as client_email, c.contact_person, c.company_name 
         FROM helpdesk_tickets t
         JOIN client_users c ON t.client_id = c.id
         WHERE t.id = ?`,
        [id]
      ) as any[];

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticket = tickets[0];
      const oldStatus = ticket.status;

      const updates: string[] = [];
      const values: any[] = [];

      if (status) {
        updates.push('status = ?');
        values.push(status);
        
        if (status === 'resolved') {
          updates.push('resolved_at = NOW()');
        } else if (status === 'closed') {
          updates.push('closed_at = NOW()');
        }
      }

      if (priority) {
        updates.push('priority = ?');
        values.push(priority);
      }

      if (assignedTo !== undefined) {
        updates.push('assigned_to = ?');
        values.push(assignedTo || null);
      }

      if (assignedToEmail !== undefined) {
        updates.push('assigned_to_email = ?');
        values.push(assignedToEmail || null);
      }

      if (updates.length > 0) {
        values.push(id);
        await query(
          `UPDATE helpdesk_tickets SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      // If assigned to someone, create assignment record and send notification
      if (assignedTo && assignedTo !== ticket.assigned_to) {
        await query(
          `INSERT INTO helpdesk_assignments (ticket_id, assigned_by, assigned_to, assigned_to_email)
           VALUES (?, ?, ?, ?)`,
          [id, context.adminId, assignedTo || null, assignedToEmail || null]
        );

        if (assignedToEmail) {
          try {
            const assignedUsers = await query(
              `SELECT full_name FROM users WHERE id = ?`,
              [assignedTo]
            ) as any[];
            const assignedUserName = assignedUsers && assignedUsers.length > 0 ? assignedUsers[0].full_name : 'User';

            await notifyUserAssignment(
              assignedToEmail as string,
              assignedUserName,
              ticket.ticket_no,
              ticket.company_name,
              ticket.subject,
              ticket.priority
            );
          } catch (emailError) {
            console.error('Error sending assignment notification:', emailError);
          }
        }
      }

      // If status changed, notify client
      if (status && status !== oldStatus) {
        try {
          await notifyClientStatusChange(
            ticket.client_email,
            ticket.contact_person,
            ticket.ticket_no,
            ticket.subject,
            status as string
          );
        } catch (emailError) {
          console.error('Error sending status change notification:', emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
      });
    }

    if (req.method === 'DELETE') {
      // Delete ticket
      if (!can('helpdesk_delete')) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await query('DELETE FROM helpdesk_tickets WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in admin helpdesk detail API:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

