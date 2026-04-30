import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { securePublicAPI } from '@/lib/api-security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  const security = await securePublicAPI(req, res, {
    requireToken: false, // Public website access
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 500,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch system settings (public endpoint, no auth required for branding)
    const settings = await query('SELECT * FROM system_settings WHERE id = 1') as any[];
    
    if (settings.length === 0) {
      // Return default settings if not found
      return res.status(200).json({
        settings: {
          site_name: 'ANSAR TECHNOLOGIES SDN BHD',
          company_name: 'ANSAR TECHNOLOGIES SDN BHD',
          company_registration_no: '201101012342 (940482-W)',
          company_address_line1: 'No. 53-2, Jalan Medan Putra 3,',
          company_address_line2: 'Bandar Manjalara, 52200 Kuala Lumpur',
          company_phone: '+603-6275 1128',
          company_email: 'info@ansartechnologies.com',
          logo_path: '/assets/img/logo.png',
          favicon_path: '/assets/img/favicon.ico',
        }
      });
    }
    
    // Return public-safe settings (no sensitive data)
    return res.status(200).json({ 
      settings: {
        site_name: settings[0].site_name,
        site_tagline: settings[0].site_tagline,
        company_name: settings[0].company_name,
        company_registration_no: settings[0].company_registration_no,
        company_address_line1: settings[0].company_address_line1,
        company_address_line2: settings[0].company_address_line2,
        company_phone: settings[0].company_phone,
        company_email: settings[0].company_email,
        company_website: settings[0].company_website,
        logo_path: settings[0].logo_path,
        favicon_path: settings[0].favicon_path,
        primary_color: settings[0].primary_color,
        secondary_color: settings[0].secondary_color,
      }
    });
    
  } catch (error) {
    console.error('Public system settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

