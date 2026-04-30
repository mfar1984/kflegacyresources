import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { hasPermission } from '@/lib/permissions';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
  const [admins] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM admins WHERE username = ? LIMIT 1',
    [username]
  );
  if (!admins || admins.length === 0) return [];
  const adminId = (admins as any)[0].id;
  const [perms] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT p.module, p.action
     FROM permissions p
     INNER JOIN role_permissions rp ON p.id = rp.permission_id
     INNER JOIN admin_roles ar ON rp.role_id = ar.role_id
     WHERE ar.admin_id = ?`,
    [adminId]
  );
  return (perms as any[]).map(p => `${p.module}_${p.action}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { hash, employee_id, period_id } = req.query as { hash?: string; employee_id?: string; period_id?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userPermissions = await getUserPermissions(session.username);
  if (!hasPermission(userPermissions, 'kpi_reviews_view')) return res.status(403).json({ error: 'Forbidden' });
  if (!employee_id || !period_id) return res.status(422).json({ error: 'employee_id and period_id required' });

  try {
    // Fetch header info
    const [empRows] = await pool.query<RowDataPacket[]>(
      `SELECT e.full_name, e.employee_id as employee_number, d.name as department_name
       FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ? LIMIT 1`,
      [Number(employee_id)]
    );
    const [perRows] = await pool.query<RowDataPacket[]>(`SELECT name, start_date, end_date FROM kpi_periods WHERE id = ?`, [Number(period_id)]);
    const emp = (empRows as any[])[0] || {};
    const per = (perRows as any[])[0] || {};

    // Fetch assignments with latest actual and computed score
    const [assignments] = await pool.query<RowDataPacket[]>(
      `SELECT t.code, t.title, t.unit, a.target_value,
              (
                SELECT u.actual_value FROM kpi_updates u WHERE u.assignment_id = a.id ORDER BY u.update_date DESC LIMIT 1
              ) as latest_actual,
              a.weight
       FROM kpi_assignments a
       INNER JOIN kpi_templates t ON a.template_id = t.id
       WHERE a.period_id = ? AND a.employee_id = ?`,
      [Number(period_id), Number(employee_id)]
    );

    const [resultRows] = await pool.query<RowDataPacket[]>(
      `SELECT final_score, grade, bonus_amount FROM kpi_employee_results WHERE period_id = ? AND employee_id = ? LIMIT 1`,
      [Number(period_id), Number(employee_id)]
    );
    const result = (resultRows as any[])[0] || { final_score: null, grade: null, bonus_amount: 0 };

    // Fetch PPP/PPK reviewers
    const [revRows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT r.reviewer_role, a.full_name
       FROM kpi_reviews kr
       INNER JOIN admins a ON kr.reviewer_admin_id = a.id
       INNER JOIN kpi_assignments ka ON kr.assignment_id = ka.id
       WHERE ka.period_id = ? AND ka.employee_id = ?`,
      [Number(period_id), Number(employee_id)]
    );

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size = 12, bold = false) => {
      page.drawText(text, { x, y, size, font: bold ? fontBold : font, color: rgb(0, 0, 0) });
    };

    let y = 800;
    drawText('KPI Report', 40, y, 18, true); y -= 24;
    drawText(`Employee: ${emp.full_name || ''} (${emp.employee_number || ''})`, 40, y); y -= 16;
    drawText(`Department: ${emp.department_name || '-'}`, 40, y); y -= 16;
    drawText(`Period: ${per.name || ''} (${per.start_date || ''} to ${per.end_date || ''})`, 40, y); y -= 24;

    drawText('Items', 40, y, 14, true); y -= 16;
    drawText('Code', 40, y, 10, true);
    drawText('Title', 100, y, 10, true);
    drawText('Target', 340, y, 10, true);
    drawText('Actual', 400, y, 10, true);
    drawText('Weight', 460, y, 10, true);
    drawText('Score %', 520, y, 10, true); y -= 12;

    const toNum = (v: any) => (v == null ? 0 : typeof v === 'number' ? v : parseFloat(String(v)) || 0);
    assignments.forEach((a: any) => {
      const actual = toNum(a.latest_actual);
      const target = toNum(a.target_value);
      let score = 0;
      if (a.unit === 'boolean') score = actual ? 100 : 0; else score = target > 0 ? Math.min(actual / target, 1) * 100 : 0;
      drawText(String(a.code || ''), 40, y, 10);
      drawText(String(a.title || ''), 100, y, 10);
      drawText(String(target), 340, y, 10);
      drawText(String(actual), 400, y, 10);
      drawText(String(a.weight), 460, y, 10);
      drawText(String(score.toFixed(2)), 520, y, 10);
      y -= 12;
      if (y < 80) { y = 780; pdfDoc.addPage(page); }
    });

    y -= 12;
    drawText(`Final Score: ${result.final_score != null ? Number(result.final_score).toFixed(2) : '-'}`, 40, y, 12, true); y -= 16;
    drawText(`Grade: ${result.grade || '-'}`, 40, y, 12, true); y -= 16;
    drawText(`KPI Bonus: RM ${Number(result.bonus_amount || 0).toFixed(2)}`, 40, y, 12, true); y -= 24;

    // Reviewer signatures
    drawText('Reviewers', 40, y, 14, true); y -= 16;
    const ppp = (revRows as any[]).filter(r => r.reviewer_role === 'PPP').map((r: any) => r.full_name).join(', ');
    const ppk = (revRows as any[]).filter(r => r.reviewer_role === 'PPK').map((r: any) => r.full_name).join(', ');
    drawText(`PPP: ${ppp || '-'}`, 40, y, 12); y -= 16;
    drawText(`PPK: ${ppk || '-'}`, 40, y, 12); y -= 36;
    drawText('Signature PPP: ______________________   Date: __________', 40, y, 10); y -= 20;
    drawText('Signature PPK: ______________________   Date: __________', 40, y, 10);

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="kpi-report-${employee_id}-${period_id}.pdf"`);
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('KPI report error:', error);
    return res.status(500).json({ error: 'Failed to generate KPI report' });
  }
}


