import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hasPermission } from '@/lib/permissions';

async function verifySession(hash: string) {
  if (!hash) return null;
  const [sessions] = await pool.query<RowDataPacket[]>(
    'SELECT username, expires_at FROM admin_sessions WHERE hash = ? LIMIT 1',
    [hash]
  );
  if (!sessions || sessions.length === 0) return null;
  const s = sessions[0];
  if (new Date(s.expires_at) < new Date()) return null;
  return s;
}

async function getUserPermissions(username: string): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE username = ? LIMIT 1',
      [username]
    );
    if (!admins || admins.length === 0) return [];
    const adminId = admins[0].id;
    const [permissions] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ?
      ORDER BY p.module, p.action
    `, [adminId]);
    return permissions.map(p => `${p.module}_${p.action}`);
  } finally {
    connection.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_periods_view')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { year, status } = req.query as { year?: string; status?: string };
      const where: string[] = [];
      const params: any[] = [];
      if (year) {
        where.push('(YEAR(start_date) = ? OR YEAR(end_date) = ?)');
        params.push(Number(year), Number(year));
      }
      if (status) {
        where.push('status = ?');
        params.push(status);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT p.*, 
                (SELECT COUNT(*) FROM kpi_assignments a WHERE a.period_id = p.id) AS total_assignments,
                (SELECT COUNT(*) FROM kpi_assignments a WHERE a.period_id = p.id AND a.status IN ('submitted','reviewed','approved')) AS submitted_count,
                (SELECT COUNT(*) FROM kpi_assignments a WHERE a.period_id = p.id AND a.status = 'approved') AS approved_count
         FROM kpi_periods p
         ${whereSql}
         ORDER BY p.start_date DESC, p.id DESC`,
        params
      );
      return res.status(200).json({ periods: rows });
    } catch (error) {
      console.error('KPI periods fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch KPI periods' });
    }
  }

  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store');
    if (!hasPermission(userPermissions, 'kpi_periods_create')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { name, start_date, end_date, has_midyear, mid_review_start_date, mid_review_end_date } = req.body as { name?: string; start_date?: string; end_date?: string; has_midyear?: any; mid_review_start_date?: string; mid_review_end_date?: string };
      if (!name || !start_date || !end_date) {
        return res.status(422).json({ error: 'name, start_date and end_date are required' });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(422).json({ error: 'start_date must be before end_date' });
      }
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO kpi_periods (name, start_date, end_date, has_midyear, mid_review_start_date, mid_review_end_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'draft', (SELECT id FROM admins WHERE username = ? LIMIT 1))`,
        [name, start_date, end_date, has_midyear ? 1 : 0, mid_review_start_date || null, mid_review_end_date || null, session.username]
      );
      return res.status(200).json({ id: result.insertId });
    } catch (error) {
      console.error('KPI period create error:', error);
      return res.status(500).json({ error: 'Failed to create KPI period' });
    }
  }

  if (req.method === 'PUT') {
    res.setHeader('Cache-Control', 'no-store');
    // Update status or fields
    try {
      const { id, action, name, start_date, end_date, status, has_midyear, mid_review_start_date, mid_review_end_date } = req.body as { id?: number; action?: string; name?: string; start_date?: string; end_date?: string; status?: string; has_midyear?: any; mid_review_start_date?: string; mid_review_end_date?: string };
      if (!id) return res.status(422).json({ error: 'id is required' });

      if (action === 'open' || status === 'open') {
        if (!hasPermission(userPermissions, 'kpi_periods_edit')) return res.status(403).json({ error: 'Forbidden' });
        await pool.query<ResultSetHeader>(`UPDATE kpi_periods SET status = 'open' WHERE id = ?`, [id]);
        return res.status(200).json({ updated: true });
      }
      if (action === 'close' || status === 'closed') {
        if (!hasPermission(userPermissions, 'kpi_periods_close')) return res.status(403).json({ error: 'Forbidden' });
        // Compute final results per employee for this period
        try {
          // Get distinct employees with assignments in this period
          const [empRows] = await pool.query<RowDataPacket[]>(
            `SELECT DISTINCT employee_id FROM kpi_assignments WHERE period_id = ?`,
            [id]
          );
          for (const er of empRows as any[]) {
            const empId = Number(er.employee_id);
            // Fetch assignments for employee
            const [assignments] = await pool.query<RowDataPacket[]>(
              `SELECT a.id, a.weight, t.unit, a.target_value,
                      (
                        SELECT u.actual_value FROM kpi_updates u
                        WHERE u.assignment_id = a.id
                        ORDER BY u.update_date DESC LIMIT 1
                      ) as latest_actual
               FROM kpi_assignments a
               INNER JOIN kpi_templates t ON a.template_id = t.id
               WHERE a.period_id = ? AND a.employee_id = ?`,
              [id, empId]
            );
            let totalWeighted = 0;
            let totalWeight = 0;
            for (const a of assignments as any[]) {
              const unit = String(a.unit);
              const actual = a.latest_actual != null ? parseFloat(a.latest_actual) : 0;
              const target = a.target_value != null ? parseFloat(a.target_value) : 0;
              const weight = a.weight != null ? parseFloat(a.weight) : 0;
              let scoreItem = 0;
              if (unit === 'boolean') {
                scoreItem = actual ? 100 : 0;
              } else {
                scoreItem = target > 0 ? Math.min(actual / target, 1) * 100 : 0;
              }
              totalWeighted += scoreItem * weight;
              totalWeight += weight;
            }

            // Optional: incorporate competency scores (final phase) as 30% weight
            let finalScore = 0;
            if (totalWeight > 0) {
              const kpiPart = totalWeighted / totalWeight; // 0..100
              // Competency avg
              const [compRows] = await pool.query<RowDataPacket[]>(
                `SELECT AVG(score) as avg_score FROM kpi_competency_scores
                 WHERE period_id = ? AND employee_id = ? AND phase = 'final'`,
                [id, empId]
              );
              const compAvg = parseFloat(String((compRows as any)[0]?.avg_score || 0));
              // Blend 70% KPI assignments, 30% competency if any competency scores exist
              const hasComp = !isNaN(compAvg) && compAvg > 0;
              finalScore = hasComp ? (kpiPart * 0.7 + compAvg * 0.3) : kpiPart;
            }

            // Determine grade band
            let grade = null as string | null;
            let kpiBonus = 0;
            const [bands] = await pool.query<RowDataPacket[]>(
              `SELECT * FROM kpi_grade_bands WHERE ? BETWEEN min_score AND max_score LIMIT 1`,
              [finalScore]
            );
            if ((bands as any[]).length > 0) {
              const b: any = (bands as any[])[0];
              grade = b.grade;
              if (b.bonus_type === 'fixed') {
                kpiBonus = parseFloat(b.bonus_value);
              } else {
                // percent of basic salary
                const [emp] = await pool.query<RowDataPacket[]>(`SELECT basic_salary FROM employees WHERE id = ?`, [empId]);
                const basic = parseFloat(String((emp as any)[0]?.basic_salary || 0));
                kpiBonus = basic * (parseFloat(b.bonus_value) / 100);
              }
            }

            await pool.query<ResultSetHeader>(
              `INSERT INTO kpi_employee_results (period_id, employee_id, final_score, grade, bonus_amount)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE final_score = VALUES(final_score), grade = VALUES(grade), bonus_amount = VALUES(bonus_amount), computed_at = NOW()`,
              [id, empId, Number(finalScore.toFixed(3)), grade, Number(kpiBonus.toFixed(2))]
            );
          }
        } catch (e) {
          console.error('KPI period close compute error:', e);
        }
        await pool.query<ResultSetHeader>(`UPDATE kpi_periods SET status = 'closed' WHERE id = ?`, [id]);
        return res.status(200).json({ updated: true });
      }

      if (!hasPermission(userPermissions, 'kpi_periods_edit')) return res.status(403).json({ error: 'Forbidden' });
      const fields: string[] = [];
      const params: any[] = [];
      if (name) { fields.push('name = ?'); params.push(name); }
      if (start_date) { fields.push('start_date = ?'); params.push(start_date); }
      if (end_date) { fields.push('end_date = ?'); params.push(end_date); }
      if (status) { fields.push('status = ?'); params.push(status); }
      if (typeof has_midyear !== 'undefined') { fields.push('has_midyear = ?'); params.push(has_midyear ? 1 : 0); }
      if (typeof mid_review_start_date !== 'undefined') { fields.push('mid_review_start_date = ?'); params.push(mid_review_start_date || null); }
      if (typeof mid_review_end_date !== 'undefined') { fields.push('mid_review_end_date = ?'); params.push(mid_review_end_date || null); }
      if (fields.length === 0) return res.status(422).json({ error: 'No fields to update' });
      params.push(id);
      await pool.query<ResultSetHeader>(`UPDATE kpi_periods SET ${fields.join(', ')} WHERE id = ?`, params);
      return res.status(200).json({ updated: true });
    } catch (error) {
      console.error('KPI period update error:', error);
      return res.status(500).json({ error: 'Failed to update KPI period' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


