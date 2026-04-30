import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: Verify session and get username
async function verifySessionFromDB(hash: string): Promise<string | null> {
  try {
    const rows = await query(
      'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
      [hash]
    ) as { username: string; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      if (expires > new Date()) {
        return rows[0].username;
      }
    }
    return null;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}

// Helper: Get user permissions
async function getUserPermissions(username: string): Promise<string[]> {
  try {
    const admins = await query(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    ) as any[];
    
    if (!admins || admins.length === 0) return [];
    
    const adminId = admins[0].id;
    
    const permissions = await query(`
      SELECT DISTINCT p.module, p.action 
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
    `, [adminId]) as any[];
    
    return permissions.map((p: any) => `${p.module}_${p.action}`);
  } catch (err) {
    console.error('Get permissions error:', err);
    return [];
  }
}

// Helper: Parse form data
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'branding');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext) => {
        return `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
      },
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  
  if (!hash || typeof hash !== 'string') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const username = await verifySessionFromDB(hash);
  if (!username) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  const permissions = await getUserPermissions(username);
  
  try {
    if (req.method === 'GET') {
      // Check view permission
      if (!permissions.includes('global-config_view')) {
        return res.status(403).json({ error: 'No permission to view global config' });
      }
      
      // Fetch system settings
      const settings = await query('SELECT * FROM system_settings WHERE id = 1') as any[];
      
      if (settings.length === 0) {
        return res.status(404).json({ error: 'System settings not found' });
      }
      
      return res.status(200).json({ settings: settings[0] });
      
    } else if (req.method === 'PUT') {
      // Check edit permission
      if (!permissions.includes('global-config_edit')) {
        return res.status(403).json({ error: 'No permission to edit global config' });
      }
      
      // Parse form data (supports file uploads for logo/favicon)
      const { fields, files } = await parseForm(req);
      
      // Extract fields
      const site_name = Array.isArray(fields.site_name) ? fields.site_name[0] : fields.site_name;
      const site_tagline = Array.isArray(fields.site_tagline) ? fields.site_tagline[0] : fields.site_tagline;
      const site_url = Array.isArray(fields.site_url) ? fields.site_url[0] : fields.site_url;
      const company_name = Array.isArray(fields.company_name) ? fields.company_name[0] : fields.company_name;
      const company_registration_no = Array.isArray(fields.company_registration_no) ? fields.company_registration_no[0] : fields.company_registration_no;
      const company_address_line1 = Array.isArray(fields.company_address_line1) ? fields.company_address_line1[0] : fields.company_address_line1;
      const company_address_line2 = Array.isArray(fields.company_address_line2) ? fields.company_address_line2[0] : fields.company_address_line2;
      const company_phone = Array.isArray(fields.company_phone) ? fields.company_phone[0] : fields.company_phone;
      const company_email = Array.isArray(fields.company_email) ? fields.company_email[0] : fields.company_email;
      const company_website = Array.isArray(fields.company_website) ? fields.company_website[0] : fields.company_website;
      const primary_color = Array.isArray(fields.primary_color) ? fields.primary_color[0] : fields.primary_color;
      const secondary_color = Array.isArray(fields.secondary_color) ? fields.secondary_color[0] : fields.secondary_color;
      const email_from_name = Array.isArray(fields.email_from_name) ? fields.email_from_name[0] : fields.email_from_name;
      const email_from_address = Array.isArray(fields.email_from_address) ? fields.email_from_address[0] : fields.email_from_address;
      const email_footer_text = Array.isArray(fields.email_footer_text) ? fields.email_footer_text[0] : fields.email_footer_text;
      const date_format = Array.isArray(fields.date_format) ? fields.date_format[0] : fields.date_format;
      const time_format = Array.isArray(fields.time_format) ? fields.time_format[0] : fields.time_format;
      const timezone = Array.isArray(fields.timezone) ? fields.timezone[0] : fields.timezone;
      const currency = Array.isArray(fields.currency) ? fields.currency[0] : fields.currency;
      const currency_symbol = Array.isArray(fields.currency_symbol) ? fields.currency_symbol[0] : fields.currency_symbol;
      const facebook_url = Array.isArray(fields.facebook_url) ? fields.facebook_url[0] : fields.facebook_url;
      const tiktok_url = Array.isArray(fields.tiktok_url) ? fields.tiktok_url[0] : fields.tiktok_url;
      const whatsapp_number = Array.isArray(fields.whatsapp_number) ? fields.whatsapp_number[0] : fields.whatsapp_number;
      const contact_email = Array.isArray(fields.contact_email) ? fields.contact_email[0] : fields.contact_email;
      const linkedin_url = Array.isArray(fields.linkedin_url) ? fields.linkedin_url[0] : fields.linkedin_url;
      const twitter_url = Array.isArray(fields.twitter_url) ? fields.twitter_url[0] : fields.twitter_url;
      const maintenance_mode = Array.isArray(fields.maintenance_mode) ? fields.maintenance_mode[0] : fields.maintenance_mode;
      const maintenance_message = Array.isArray(fields.maintenance_message) ? fields.maintenance_message[0] : fields.maintenance_message;
      
      // Handle file uploads
      let logo_path: string | undefined;
      let favicon_path: string | undefined;
      
      if (files.logo) {
        const logoFile = Array.isArray(files.logo) ? files.logo[0] : files.logo;
        logo_path = `/uploads/branding/${path.basename(logoFile.filepath)}`;
      }
      
      if (files.favicon) {
        const faviconFile = Array.isArray(files.favicon) ? files.favicon[0] : files.favicon;
        favicon_path = `/uploads/branding/${path.basename(faviconFile.filepath)}`;
      }
      
      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (site_name !== undefined) {
        updateFields.push('site_name = ?');
        updateValues.push(site_name);
      }
      if (site_tagline !== undefined) {
        updateFields.push('site_tagline = ?');
        updateValues.push(site_tagline);
      }
      if (site_url !== undefined) {
        updateFields.push('site_url = ?');
        updateValues.push(site_url);
      }
      if (company_name !== undefined) {
        updateFields.push('company_name = ?');
        updateValues.push(company_name);
      }
      if (company_registration_no !== undefined) {
        updateFields.push('company_registration_no = ?');
        updateValues.push(company_registration_no);
      }
      if (company_address_line1 !== undefined) {
        updateFields.push('company_address_line1 = ?');
        updateValues.push(company_address_line1);
      }
      if (company_address_line2 !== undefined) {
        updateFields.push('company_address_line2 = ?');
        updateValues.push(company_address_line2);
      }
      if (company_phone !== undefined) {
        updateFields.push('company_phone = ?');
        updateValues.push(company_phone);
      }
      if (company_email !== undefined) {
        updateFields.push('company_email = ?');
        updateValues.push(company_email);
      }
      if (company_website !== undefined) {
        updateFields.push('company_website = ?');
        updateValues.push(company_website);
      }
      if (logo_path !== undefined) {
        updateFields.push('logo_path = ?');
        updateValues.push(logo_path);
      }
      if (favicon_path !== undefined) {
        updateFields.push('favicon_path = ?');
        updateValues.push(favicon_path);
      }
      if (primary_color !== undefined) {
        updateFields.push('primary_color = ?');
        updateValues.push(primary_color);
      }
      if (secondary_color !== undefined) {
        updateFields.push('secondary_color = ?');
        updateValues.push(secondary_color);
      }
      if (email_from_name !== undefined) {
        updateFields.push('email_from_name = ?');
        updateValues.push(email_from_name);
      }
      if (email_from_address !== undefined) {
        updateFields.push('email_from_address = ?');
        updateValues.push(email_from_address);
      }
      if (email_footer_text !== undefined) {
        updateFields.push('email_footer_text = ?');
        updateValues.push(email_footer_text);
      }
      if (date_format !== undefined) {
        updateFields.push('date_format = ?');
        updateValues.push(date_format);
      }
      if (time_format !== undefined) {
        updateFields.push('time_format = ?');
        updateValues.push(time_format);
      }
      if (timezone !== undefined) {
        updateFields.push('timezone = ?');
        updateValues.push(timezone);
      }
      if (currency !== undefined) {
        updateFields.push('currency = ?');
        updateValues.push(currency);
      }
      if (currency_symbol !== undefined) {
        updateFields.push('currency_symbol = ?');
        updateValues.push(currency_symbol);
      }
      if (facebook_url !== undefined) {
        updateFields.push('facebook_url = ?');
        updateValues.push(facebook_url || null);
      }
      if (tiktok_url !== undefined) {
        updateFields.push('tiktok_url = ?');
        updateValues.push(tiktok_url || null);
      }
      if (whatsapp_number !== undefined) {
        updateFields.push('whatsapp_number = ?');
        updateValues.push(whatsapp_number || null);
      }
      if (contact_email !== undefined) {
        updateFields.push('contact_email = ?');
        updateValues.push(contact_email || null);
      }
      if (linkedin_url !== undefined) {
        updateFields.push('linkedin_url = ?');
        updateValues.push(linkedin_url || null);
      }
      if (twitter_url !== undefined) {
        updateFields.push('twitter_url = ?');
        updateValues.push(twitter_url || null);
      }
      if (maintenance_mode !== undefined) {
        updateFields.push('maintenance_mode = ?');
        updateValues.push(maintenance_mode === '1' || maintenance_mode === 'true' ? 1 : 0);
      }
      if (maintenance_message !== undefined) {
        updateFields.push('maintenance_message = ?');
        updateValues.push(maintenance_message || null);
      }
      
      // Get admin ID for updated_by
      const admins = await query('SELECT id FROM admins WHERE username = ? LIMIT 1', [username]) as any[];
      const adminId = admins[0]?.id || null;
      
      updateFields.push('updated_by = ?');
      updateValues.push(adminId);
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      // Update system settings
      await query(
        `UPDATE system_settings SET ${updateFields.join(', ')} WHERE id = 1`,
        updateValues
      );
      
      // Fetch updated settings
      const updatedSettings = await query('SELECT * FROM system_settings WHERE id = 1') as any[];
      
      return res.status(200).json({ 
        message: 'System settings updated successfully',
        settings: updatedSettings[0]
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('System settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
