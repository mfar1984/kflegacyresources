import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export const config = { api: { bodyParser: false } };

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

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
    return obj;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { hash } = req.query as { hash?: string };
  const session = await verifySession(String(hash || ''));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Invalid form data' });
    try {
      const period_id = Number(fields.period_id?.[0] || fields.period_id);
      const file: any = files.file;
      if (!period_id || !file || !file.filepath) return res.status(422).json({ error: 'period_id and file are required' });
      const buf = await (await import('fs/promises')).readFile(file.filepath, 'utf8');
      const rows = parseCSV(String(buf));
      const created: number[] = [];
      for (const r of rows) {
        const employee_id = Number(r.employee_id || r.employee);
        if (!employee_id) continue;
        const [tmpl] = await pool.query<RowDataPacket[]>(`SELECT id, default_weight FROM kpi_templates WHERE code = ? LIMIT 1`, [r.template_code || r.code]);
        const template = (tmpl as any[])[0];
        if (!template) continue;
        const target_value = r.target_value != null ? Number(r.target_value) : 0;
        const weight = r.weight != null ? Number(r.weight) : Number(template.default_weight || 10);
        const [ins] = await pool.query<ResultSetHeader>(
          `INSERT INTO kpi_assignments (period_id, employee_id, template_id, target_value, weight, status)
           VALUES (?, ?, ?, ?, ?, 'draft')
           ON DUPLICATE KEY UPDATE target_value = VALUES(target_value), weight = VALUES(weight)`,
          [period_id, employee_id, template.id, target_value, weight]
        );
        if (ins.insertId) created.push(ins.insertId);
      }
      return res.status(200).json({ imported: rows.length, created: created.length });
    } catch (e) {
      console.error('KPI assignments import error:', e);
      return res.status(500).json({ error: 'Failed to import assignments' });
    }
  });
}


