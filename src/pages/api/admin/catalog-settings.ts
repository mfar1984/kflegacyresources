import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import type { DbQueryResults } from '@/types/database';

/**
 * Admin API: Catalog Settings
 * GET: Get all settings
 * PUT: Update settings
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add authentication check here

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET: Get all settings
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const settings = await query(
      `SELECT * FROM catalog_settings ORDER BY setting_key ASC`
    ) as DbQueryResults;

    // Convert to key-value object
    const settingsObj: Record<string, { value: string | number | boolean | null; type: string; description: string }> = {};
    settings.forEach(setting => {
      let value: string | number | boolean | null = setting.setting_value as string;
      
      // Parse based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch {
          value = null;
        }
      }

      settingsObj[setting.setting_key as string] = {
        value,
        type: setting.setting_type as string,
        description: setting.description as string
      };
    });

    return res.status(200).json({
      success: true,
      settings: settingsObj
    });

  } catch (error) {
    console.error('Error fetching catalog settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// PUT: Update settings
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      let stringValue: string;

      // Convert value to string based on type
      if (typeof value === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }

      // Update or insert setting
      await query(
        `INSERT INTO catalog_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
        [key, stringValue, stringValue]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating catalog settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update catalog settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

