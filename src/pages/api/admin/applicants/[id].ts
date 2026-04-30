import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { sendInterviewScheduleToApplicant, sendRejectionEmailToApplicant, sendShortlistedEmailToApplicant } from '@/lib/email';

async function verifySessionFromDB(hash: string): Promise<{ admin_id: number } | null> {
  try {
    const rows = await query(
      'SELECT a.id as admin_id, s.expires_at FROM admin_sessions s JOIN admins a ON s.username = a.username WHERE s.hash = ? LIMIT 1',
      [hash]
    ) as { admin_id: number; expires_at: string }[];
    
    if (rows && rows.length > 0) {
      const expires = new Date(rows[0].expires_at);
      if (expires > new Date()) {
        return { admin_id: rows[0].admin_id };
      }
    }
    return null;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash, id } = req.query;

  // Verify session
  const session = await verifySessionFromDB(hash as string);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const applicantId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  if (!applicantId) {
    return res.status(400).json({ error: 'Invalid applicant ID' });
  }

  if (req.method === 'GET') {
    // Get single applicant details
    try {
      const applicants = await query(
        `SELECT 
          a.*,
          c.title as job_title,
          c.department as job_department
         FROM career_applicants a
         LEFT JOIN career_postings c ON a.career_posting_id = c.id
         WHERE a.id = ?`,
        [applicantId]
      ) as any[];

      if (applicants.length === 0) {
        return res.status(404).json({ error: 'Applicant not found' });
      }

      res.status(200).json(applicants[0]);
    } catch (error) {
      console.error('Applicant API error:', error);
      res.status(500).json({ error: 'Failed to fetch applicant' });
    }
  } else if (req.method === 'PATCH') {
    // Update applicant status
    try {
      const { status: newStatus, interview_date, interview_notes, rejection_reason, admin_notes } = req.body;

      const updates: string[] = [];
      const params: any[] = [];

      if (newStatus) {
        updates.push('status = ?');
        params.push(newStatus);
        
        if (newStatus === 'archived') {
          updates.push('archived_at = NOW()');
        }
      }

      if (interview_date !== undefined) {
        updates.push('interview_date = ?');
        params.push(interview_date);
      }

      if (interview_notes !== undefined) {
        updates.push('interview_notes = ?');
        params.push(interview_notes);
      }

      if (rejection_reason !== undefined) {
        updates.push('rejection_reason = ?');
        params.push(rejection_reason);
      }

      if (admin_notes !== undefined) {
        updates.push('admin_notes = ?');
        params.push(admin_notes);
      }

      updates.push('reviewed_at = NOW()');
      updates.push('reviewed_by = ?');
      params.push(session.admin_id);

      params.push(applicantId);

      await query(
        `UPDATE career_applicants SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Send interview email if status changed to interview-scheduled
      if (newStatus === 'interview-scheduled' && interview_date) {
        try {
          // Get applicant details
          const applicants = await query(
            `SELECT 
              a.full_name,
              a.email,
              a.application_no,
              a.interview_notes,
              c.title as job_title
             FROM career_applicants a
             LEFT JOIN career_postings c ON a.career_posting_id = c.id
             WHERE a.id = ?`,
            [applicantId]
          ) as Array<{
            full_name: string;
            email: string;
            application_no: string;
            interview_notes: string;
            job_title: string;
          }>;

          if (applicants.length > 0) {
            const applicant = applicants[0];
            await sendInterviewScheduleToApplicant({
              full_name: applicant.full_name,
              email: applicant.email,
              application_no: applicant.application_no,
              position: applicant.job_title || 'Position',
              interview_date: interview_date,
              interview_notes: interview_notes || applicant.interview_notes
            });
          }
        } catch (emailError) {
          console.error('Interview email error:', emailError);
          // Don't fail the update if email fails
        }
      }

      // Send shortlisted email if status changed to shortlisted
      if (newStatus === 'shortlisted') {
        try {
          // Get applicant details
          const applicants = await query(
            `SELECT 
              a.full_name,
              a.email,
              a.application_no,
              a.expected_salary,
              a.interview_date,
              a.interview_notes,
              c.title as job_title
             FROM career_applicants a
             LEFT JOIN career_postings c ON a.career_posting_id = c.id
             WHERE a.id = ?`,
            [applicantId]
          ) as Array<{
            full_name: string;
            email: string;
            application_no: string;
            expected_salary: number;
            interview_date: string;
            interview_notes: string;
            job_title: string;
          }>;

          if (applicants.length > 0) {
            const applicant = applicants[0];
            await sendShortlistedEmailToApplicant({
              full_name: applicant.full_name,
              email: applicant.email,
              application_no: applicant.application_no,
              position: applicant.job_title || 'Position',
              expected_salary: applicant.expected_salary,
              interview_date: applicant.interview_date,
              interview_notes: applicant.interview_notes
            });
          }
        } catch (emailError) {
          console.error('Shortlisted email error:', emailError);
          // Don't fail the update if email fails
        }
      }

      // Send rejection email if status changed to rejected
      if (newStatus === 'rejected') {
        try {
          // Get applicant details
          const applicants = await query(
            `SELECT 
              a.full_name,
              a.email,
              a.application_no,
              a.rejection_reason,
              c.title as job_title
             FROM career_applicants a
             LEFT JOIN career_postings c ON a.career_posting_id = c.id
             WHERE a.id = ?`,
            [applicantId]
          ) as Array<{
            full_name: string;
            email: string;
            application_no: string;
            rejection_reason: string;
            job_title: string;
          }>;

          if (applicants.length > 0) {
            const applicant = applicants[0];
            await sendRejectionEmailToApplicant({
              full_name: applicant.full_name,
              email: applicant.email,
              application_no: applicant.application_no,
              position: applicant.job_title || 'Position',
              rejection_reason: rejection_reason || applicant.rejection_reason
            });
          }
        } catch (emailError) {
          console.error('Rejection email error:', emailError);
          // Don't fail the update if email fails
        }
      }

      // Auto-create employee if status changed to hired
      if (newStatus === 'hired') {
        try {
          // Get full applicant details
          const applicants = await query(
            `SELECT a.*, c.title as job_title, c.department 
             FROM career_applicants a
             LEFT JOIN career_postings c ON a.career_posting_id = c.id
             WHERE a.id = ?`,
            [applicantId]
          ) as any[];

          if (applicants.length > 0) {
            const applicant = applicants[0];
            
            // Check if employee already exists (prevent duplicate)
            const existingEmployees = await query(
              'SELECT id FROM employees WHERE ic_number = ? OR email = ?',
              [applicant.ic_number, applicant.email]
            ) as any[];

            if (existingEmployees.length === 0) {
              // Get department ID (default to Admin if not found)
              let departmentId = 9; // Default to Admin department
              const departments = await query(
                'SELECT id FROM departments WHERE LOWER(name) LIKE ? OR LOWER(code) LIKE ? LIMIT 1',
                [`%${(applicant.department || '').toLowerCase()}%`, `%${(applicant.department || '').toLowerCase()}%`]
              ) as any[];
              if (departments.length > 0) {
                departmentId = departments[0].id;
              }

              // Generate employee ID (format: ANSR-YYYY-DEPT-XXX)
              const year = new Date().getFullYear();
              const deptRows = await query('SELECT code FROM departments WHERE id = ?', [departmentId]) as any[];
              const deptCode = deptRows.length > 0 ? deptRows[0].code : 'GEN';
              
              // Get last employee number for this year and department
              const lastEmployees = await query(
                "SELECT employee_id FROM employees WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1",
                [`ANSR-${year}-${deptCode}-%`]
              ) as any[];
              
              let nextNum = 1;
              if (lastEmployees.length > 0) {
                const lastId = lastEmployees[0].employee_id;
                const match = lastId.match(/-(\d+)$/);
                if (match) {
                  nextNum = parseInt(match[1]) + 1;
                }
              }
              
              const employeeId = `ANSR-${year}-${deptCode}-${String(nextNum).padStart(3, '0')}`;
              
              // Generate QR code (simple unique string)
              const qrCode = `EMP-${Date.now()}-${Math.random().toString(36).substring(7)}`;

              // Insert employee record with ALL applicant data
              const insertResult = await query(
                `INSERT INTO employees (
                  employee_id, full_name, email, phone, ic_number, date_of_birth,
                  gender, nationality, marital_status,
                  address, postcode, city, state, country,
                  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                  position, department_id, employment_type, join_date, basic_salary, status,
                  resume_path, cover_letter_path, certificates_path,
                  highest_education, field_of_study, institution, graduation_year, years_of_experience,
                  created_by, qr_code, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  employeeId,
                  applicant.full_name,
                  applicant.email,
                  applicant.phone || applicant.phone_number || '',
                  applicant.identity_card || applicant.ic_number,
                  applicant.date_of_birth,
                  applicant.gender || 'Male',
                  applicant.nationality || 'Malaysian',
                  (applicant.marital_status || 'single').toLowerCase(),
                  applicant.correspondence_address || applicant.ic_address || applicant.current_address || '',
                  applicant.correspondence_postcode || applicant.ic_postcode || applicant.current_postcode || '',
                  applicant.correspondence_city || applicant.ic_city || applicant.current_city || '',
                  applicant.correspondence_state || applicant.ic_state || applicant.current_state || '',
                  applicant.current_country || 'Malaysia',
                  applicant.emergency_contact_name || applicant.emergency_name || '',
                  applicant.emergency_contact_phone || applicant.emergency_phone || '',
                  applicant.emergency_contact_relationship || applicant.emergency_relationship || '',
                  applicant.job_title || 'Employee',
                  departmentId,
                  'Permanent',
                  applicant.available_start_date || new Date().toISOString().split('T')[0],
                  applicant.expected_salary || 0,
                  'active',
                  applicant.resume_path || null,
                  applicant.cover_letter_path || null,
                  applicant.certificates_path || null,
                  applicant.highest_education || null,
                  applicant.field_of_study || null,
                  applicant.institution || null,
                  applicant.graduation_year || null,
                  applicant.years_of_experience || 0,
                  session.admin_id,
                  qrCode,
                  `Auto-created from application ${applicant.application_no} - Includes resume, education, and all applicant details`
                ]
              ) as any;

              const newEmployeeId = insertResult.insertId;

              console.log(`Employee created: ${employeeId} from applicant ${applicant.application_no}`);

              // Auto-initialize leave balances for new employee
              try {
                const currentYear = new Date().getFullYear();
                
                // Get all active leave types
                const leaveTypes = await query(
                  'SELECT id, days_per_year FROM leave_types WHERE status = ? AND days_per_year > 0',
                  ['active']
                ) as Array<{ id: number; days_per_year: number }>;

                // Create leave balance for each leave type
                for (const leaveType of leaveTypes) {
                  await query(
                    `INSERT INTO leave_balances (
                      employee_id, leave_type_id, year, 
                      total_days, used_days, carried_forward
                    ) VALUES (?, ?, ?, ?, 0, 0)
                    ON DUPLICATE KEY UPDATE total_days = VALUES(total_days)`,
                    [newEmployeeId, leaveType.id, currentYear, leaveType.days_per_year]
                  );
                }

                console.log(`Leave balances initialized for employee ${employeeId}: ${leaveTypes.length} leave types`);
              } catch (balanceError) {
                console.error('Leave balance initialization error:', balanceError);
                // Don't fail employee creation if balance init fails
              }
            } else {
              console.log(`Employee already exists for applicant ${applicant.application_no}`);
            }
          }
        } catch (employeeCreationError) {
          console.error('Employee creation error:', employeeCreationError);
          // Don't fail the status update if employee creation fails
          // Just log the error
        }
      }

      res.status(200).json({ success: true, message: 'Applicant updated successfully' });
    } catch (error) {
      console.error('Update applicant error:', error);
      res.status(500).json({ error: 'Failed to update applicant' });
    }
  } else if (req.method === 'DELETE') {
    // Delete applicant (soft delete - move to archive)
    try {
      await query(
        'UPDATE career_applicants SET status = ?, archived_at = NOW() WHERE id = ?',
        ['archived', applicantId]
      );

      res.status(200).json({ success: true, message: 'Applicant archived successfully' });
    } catch (error) {
      console.error('Delete applicant error:', error);
      res.status(500).json({ error: 'Failed to delete applicant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

