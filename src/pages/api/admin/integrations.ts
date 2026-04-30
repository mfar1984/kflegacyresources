import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import formidable from 'formidable';
import crypto from 'crypto';
import { manualRotateToken } from '@/lib/token-rotation';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: Verify admin session and get permissions
async function verifyAdminSession(hash: string) {
  if (!hash) {
    return { valid: false, username: null, adminId: null };
  }

  try {
    // Get session from admin_sessions table
    const sessions: any = await query(
      `SELECT username FROM admin_sessions WHERE hash = ? LIMIT 1`,
      [hash]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { valid: false, username: null, adminId: null };
    }

    const { username } = sessions[0];

    // Get admin ID from admins table
    const admins: any = await query(
      `SELECT id FROM admins WHERE username = ? LIMIT 1`,
      [username]
    );

    if (!Array.isArray(admins) || admins.length === 0) {
      return { valid: false, username, adminId: null };
    }

    return { valid: true, username, adminId: admins[0].id };
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return { valid: false, username: null, adminId: null };
  }
}

async function getUserPermissions(adminId: number) {
  try {
    const permissions: any = await query(
      `
        SELECT DISTINCT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN admin_roles ar ON rp.role_id = ar.role_id
        JOIN admins a ON ar.admin_id = a.id
        WHERE a.id = ?
      `,
      [adminId]
    );
    return Array.isArray(permissions) ? permissions.map((p: any) => p.name) : [];
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}

// Helper: Encrypt sensitive data
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Helper: Decrypt sensitive data
function decrypt(text: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return '';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify session
  const hash = req.headers.authorization?.replace('Bearer ', '') || '';
  const { valid, username, adminId } = await verifyAdminSession(hash);

  if (!valid || !adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userPermissions = await getUserPermissions(adminId);

  if (req.method === 'GET') {
    // Check permission
    if (!hasPermission(userPermissions, 'integrations_view')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      // Get integration settings (singleton)
      const settings: any = await query('SELECT * FROM integrations WHERE id = 1 LIMIT 1');

      if (!Array.isArray(settings) || settings.length === 0) {
        return res.status(404).json({ error: 'Integration settings not found' });
      }

      const config = settings[0];

      // Parse JSON fields
      if (config.api_allowed_origins) {
        try {
          config.api_allowed_origins = JSON.parse(config.api_allowed_origins);
        } catch {
          config.api_allowed_origins = [];
        }
      }

      if (config.weather_current_data) {
        try {
          config.weather_current_data = JSON.parse(config.weather_current_data);
        } catch {
          config.weather_current_data = null;
        }
      }

      if (config.holidays_include_states) {
        try {
          config.holidays_include_states = JSON.parse(config.holidays_include_states);
        } catch {
          config.holidays_include_states = [];
        }
      }

      // Don't send encrypted password to client
      if (config.smtp_password) {
        config.smtp_password = '********'; // Masked
      }

      return res.status(200).json(config);
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      return res.status(500).json({ error: 'Failed to fetch integration settings' });
    }
  }

  if (req.method === 'PUT') {
    // Check permission
    if (!hasPermission(userPermissions, 'integrations_edit')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      const form = formidable({ multiples: false });

      const [fields] = await form.parse(req);

      const getValue = (key: string) => {
        const value = fields[key];
        return Array.isArray(value) ? value[0] : value;
      };

      // Build update object
      const updates: any = {
        updated_by: username,
      };

      // API Configuration
      if (getValue('api_cors_allow_all') !== undefined) {
        updates.api_cors_allow_all = getValue('api_cors_allow_all') === '1' ? 1 : 0;
      }
      if (getValue('api_allowed_origins') !== undefined) {
        const origins = getValue('api_allowed_origins') || '';
        const originsArray = origins
          .split('\n')
          .map((o: string) => o.trim())
          .filter((o: string) => o.length > 0);
        updates.api_allowed_origins = JSON.stringify(originsArray);
      }

      // Email SMTP Configuration
      if (getValue('smtp_host')) updates.smtp_host = getValue('smtp_host');
      if (getValue('smtp_port')) updates.smtp_port = parseInt(getValue('smtp_port') || '587');
      if (getValue('smtp_encryption') !== undefined) updates.smtp_encryption = getValue('smtp_encryption') || null;
      if (getValue('smtp_authentication') !== undefined) {
        updates.smtp_authentication = getValue('smtp_authentication') === '1' ? 1 : 0;
      }
      if (getValue('smtp_username')) updates.smtp_username = getValue('smtp_username');
      if (getValue('smtp_from_address')) updates.smtp_from_address = getValue('smtp_from_address');
      if (getValue('smtp_from_name')) updates.smtp_from_name = getValue('smtp_from_name');
      if (getValue('smtp_reply_to')) updates.smtp_reply_to = getValue('smtp_reply_to');
      if (getValue('smtp_connection_timeout')) updates.smtp_connection_timeout = parseInt(getValue('smtp_connection_timeout') || '30');
      if (getValue('smtp_max_retries')) updates.smtp_max_retries = parseInt(getValue('smtp_max_retries') || '3');

      // Only update password if provided (and not masked)
      const smtpPassword = getValue('smtp_password');
      if (smtpPassword && smtpPassword !== '********') {
        updates.smtp_password = encrypt(smtpPassword);
      }

      // Weather Configuration
      if (getValue('weather_api_key')) updates.weather_api_key = getValue('weather_api_key');
      if (getValue('weather_default_location')) updates.weather_default_location = getValue('weather_default_location');
      if (getValue('weather_default_lat')) updates.weather_default_lat = parseFloat(getValue('weather_default_lat') || '0');
      if (getValue('weather_default_long')) updates.weather_default_long = parseFloat(getValue('weather_default_long') || '0');
      if (getValue('weather_units')) updates.weather_units = getValue('weather_units');
      if (getValue('weather_update_frequency')) updates.weather_update_frequency = parseInt(getValue('weather_update_frequency') || '30');
      if (getValue('weather_cache_duration')) updates.weather_cache_duration = parseInt(getValue('weather_cache_duration') || '60');

      // Public Holidays Configuration
      if (getValue('holidays_enabled') !== undefined) {
        updates.holidays_enabled = getValue('holidays_enabled') === '1' ? 1 : 0;
      }
      if (getValue('holidays_auto_sync') !== undefined) {
        updates.holidays_auto_sync = getValue('holidays_auto_sync') === '1' ? 1 : 0;
      }
      if (getValue('holidays_include_states') !== undefined) {
        const states = getValue('holidays_include_states') || '';
        const statesArray = states
          .split(',')
          .map((s: string) => s.trim().toUpperCase())
          .filter((s: string) => s.length > 0);
        updates.holidays_include_states = JSON.stringify(statesArray);
      }
      if (getValue('holidays_cache_duration')) updates.holidays_cache_duration = parseInt(getValue('holidays_cache_duration') || '1440');

      // Tides Configuration
      if (getValue('tides_enabled') !== undefined) {
        updates.tides_enabled = getValue('tides_enabled') === '1' ? 1 : 0;
      }
      if (getValue('tides_location')) updates.tides_location = getValue('tides_location');

      // Build SQL
      const setClauses = Object.keys(updates).map((key) => `${key} = ?`);
      const values = Object.values(updates) as (string | number | boolean | null)[];

      await query(
        `UPDATE integrations SET ${setClauses.join(', ')} WHERE id = 1`,
        values
      );

      // Fetch tides data if tides settings are provided and enabled
      if (updates.tides_enabled && updates.tides_location) {
        try {
          // Call tides sync API internally
          const tidesResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/admin/tides/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!tidesResponse.ok) {
            console.error('Failed to sync tides data');
          }
        } catch (tidesError) {
          console.error('Failed to fetch tides data:', tidesError);
          // Don't fail the whole update if tides fetch fails
        }
      }

      // Fetch weather data if weather settings are provided
      if (updates.weather_api_key && updates.weather_default_lat && updates.weather_default_long) {
        try {
          const weatherApiKey = updates.weather_api_key;
          const lat = updates.weather_default_lat;
          const lon = updates.weather_default_long;
          const units = updates.weather_units || 'metric';
          
          // Fetch current weather
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${weatherApiKey}`;
          const weatherResponse = await fetch(weatherUrl);
          
          // Fetch 5-day forecast (for today's min/max)
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${weatherApiKey}`;
          const forecastResponse = await fetch(forecastUrl);
          
          if (weatherResponse.ok && forecastResponse.ok) {
            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();
            
            // Get today's min/max from forecast (first 8 entries = today)
            const todayForecasts = forecastData.list.slice(0, 8);
            const temps = todayForecasts.map((f: any) => f.main.temp);
            const tempMin = Math.min(...temps);
            const tempMax = Math.max(...temps);
            
            // Merge data
            const combinedData = {
              ...weatherData,
              temp_min: tempMin,
              temp_max: tempMax,
              rain: todayForecasts.some((f: any) => f.weather[0].main === 'Rain') ? 70 : 10,
            };
            
            // Update weather data in database
            await query(
              `UPDATE integrations SET weather_current_data = ?, weather_last_update = NOW() WHERE id = 1`,
              [JSON.stringify(combinedData)]
            );
          }
        } catch (weatherError) {
          console.error('Failed to fetch weather data:', weatherError);
          // Don't fail the whole update if weather fetch fails
        }
      }

      return res.status(200).json({ message: 'Integration settings updated successfully' });
    } catch (error) {
      console.error('Error updating integration settings:', error);
      return res.status(500).json({ error: 'Failed to update integration settings' });
    }
  }

  if (req.method === 'POST') {
    // POST for special actions (generate API token)
    if (!hasPermission(userPermissions, 'integrations_edit')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      // Parse JSON body (since bodyParser is disabled)
      let body: any = {};
      if (req.body && typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      } else {
        // Read raw body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf8');
        body = JSON.parse(rawBody);
      }

      const { action } = body;

      if (action === 'generate_api_token') {
        // Manual token rotation with logging
        const result = await manualRotateToken(adminId);

        if (!result.success) {
          return res.status(500).json({ error: result.error || 'Failed to generate token' });
        }

        // Also update the updated_by field for audit
        await query(
          `UPDATE integrations SET updated_by = ? WHERE id = 1`,
          [username]
        );

        return res.status(200).json({ 
          message: 'API token generated successfully', 
          token: result.newToken 
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error executing action:', error);
      return res.status(500).json({ error: 'Failed to execute action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

