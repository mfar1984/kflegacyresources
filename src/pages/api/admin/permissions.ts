import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

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
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const hash = req.query.hash;
    if (!hash || typeof hash !== 'string') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isValid = await verifySessionFromDB(hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    // Ensure new helpdesk client permissions exist
    await query(`
      INSERT INTO permissions (module, action, name, description)
      SELECT 'helpdesk_clients', 'view', 'helpdesk_clients_view', 'View helpdesk clients'
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM permissions WHERE module = 'helpdesk_clients' AND action = 'view' LIMIT 1
      )
    `);
    
    await query(`
      INSERT INTO permissions (module, action, name, description)
      SELECT 'helpdesk_clients', 'edit', 'helpdesk_clients_edit', 'Edit helpdesk clients'
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM permissions WHERE module = 'helpdesk_clients' AND action = 'edit' LIMIT 1
      )
    `);
    
    await query(`
      INSERT INTO permissions (module, action, name, description)
      SELECT 'helpdesk_clients', 'delete', 'helpdesk_clients_delete', 'Delete helpdesk clients'
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM permissions WHERE module = 'helpdesk_clients' AND action = 'delete' LIMIT 1
      )
    `);

    // Ensure all procurement permissions exist
    const procurementPermissions = [
      { action: 'view', name: 'procurement_view', description: 'View procurement requests' },
      { action: 'create', name: 'procurement_create', description: 'Create procurement requests' },
      { action: 'edit', name: 'procurement_edit', description: 'Edit procurement requests' },
      { action: 'delete', name: 'procurement_delete', description: 'Delete procurement requests' },
      { action: 'approve', name: 'procurement_approve', description: 'Approve procurement requests' }
    ];

    for (const perm of procurementPermissions) {
      await query(`
        INSERT INTO permissions (module, action, name, description, category)
        SELECT 'procurement', ?, ?, ?, 'web_tools'
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM permissions WHERE module = 'procurement' AND action = ? LIMIT 1
        )
      `, [perm.action, perm.name, perm.description, perm.action]);
    }

    // Get all permissions
    const permissions = await query(`
      SELECT id, module, action, name, description, category
      FROM permissions
      ORDER BY module, action
    `) as Array<{
      id: number;
      module: string;
      action: string;
      name: string;
      description: string | null;
      category: string | null;
    }>;

    // Define exact order as per sidebar
    const moduleOrder = [
      'dashboard',
      'career',
      'applicants',
      'career_archive',
      'employees',
      'leave',
      'claims',
      'overtime',
      'expenses',
      // KPI modules (placed before payroll & compensation in HR)
      'kpi_templates',
      'kpi_periods',
      'kpi_assignments',
      'kpi_reviews',
      'kpi_competencies',
      'kpi_grades',
      'payroll',
      'achievement',
      'certificates',
      'downloads',
      'news',
      'procurement',
      'projects',
      'helpdesk',
      'helpdesk_clients',
      'global-config',
      'integration',
      'role-groups',
      'users',
      'activity-logs'
    ];

    // Group by module and sort by defined order
    const grouped: Record<string, Array<{
      id: number;
      module: string;
      action: string;
      name: string;
      description: string | null;
      category: string | null;
    }>> = {};
    
    // Initialize in correct order
    moduleOrder.forEach(mod => {
      grouped[mod] = [];
    });
    
    // Fill with permissions
    permissions.forEach(perm => {
      if (grouped[perm.module]) {
        grouped[perm.module].push(perm);
      } else {
        // If module not in order, still add it
        if (!grouped[perm.module]) {
          grouped[perm.module] = [];
        }
        grouped[perm.module].push(perm);
      }
    });

    return res.status(200).json({ success: true, permissions, grouped });
  } catch (error) {
    console.error('Permissions API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
