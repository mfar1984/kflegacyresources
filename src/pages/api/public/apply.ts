import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { sendApplicationNotificationToHR, sendApplicationConfirmationToApplicant } from '@/lib/email';
import { securePublicAPI } from '@/lib/api-security';
import formidable, { File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

interface ApplicationData {
  career_posting_id: string;
  full_name: string;
  ic_number: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  religion: string;
  marital_status: string;
  email: string;
  phone_number: string;
  alt_phone_number: string;
  ic_address: string;
  ic_postcode: string;
  ic_city: string;
  ic_state: string;
  ic_country: string;
  current_address: string;
  current_postcode: string;
  current_city: string;
  current_state: string;
  current_country: string;
  same_as_ic_address: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  emergency_email: string;
  emergency_address: string;
  highest_education: string;
  field_of_study: string;
  years_of_experience: string;
  current_employer: string;
  current_position: string;
  expected_salary: string;
  notice_period: string;
  available_start_date: string;
  cover_message: string;
  how_did_you_hear: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply security middleware
  // Note: requireToken is false for public website access
  // Security via CORS + Rate Limiting (max 50 applications/hour per IP to prevent spam)
  const security = await securePublicAPI(req, res, {
    requireToken: false,
    checkCORS: true,
    checkRateLimit: true,
    maxRequestsPerHour: 50, // Lower limit for submissions to prevent spam
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applicants');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Extract field values (formidable returns arrays)
    const getField = (field: string) => {
      const value = fields[field];
      return Array.isArray(value) ? value[0] : value || '';
    };

    // Generate unique application number
    const year = new Date().getFullYear();
    const countResult = await query(
      'SELECT COUNT(*) as count FROM career_applicants WHERE YEAR(submitted_at) = ?',
      [year]
    ) as any[];
    const appNumber = `APP-${year}-${String((countResult[0]?.count || 0) + 1).padStart(4, '0')}`;

    // Get file paths
    const getFilePath = (fileKey: string) => {
      const file = files[fileKey];
      if (!file) return null;
      const fileObj = Array.isArray(file) ? file[0] : file;
      return fileObj ? path.basename(fileObj.filepath) : null;
    };

    const passportPhoto = getFilePath('passport_photo');
    const resumePdf = getFilePath('resume_pdf');
    const coverLetterPdf = getFilePath('cover_letter_pdf');

    if (!passportPhoto || !resumePdf) {
      return res.status(400).json({ error: 'Passport photo and resume are required' });
    }

    // Insert application
    const result = await query(
      `INSERT INTO career_applicants (
        career_posting_id, application_no, full_name, ic_number, gender, date_of_birth,
        nationality, religion, marital_status, email, phone_number, alt_phone_number,
        ic_address, ic_postcode, ic_city, ic_state, ic_country,
        current_address, current_postcode, current_city, current_state, current_country,
        same_as_ic_address, emergency_name, emergency_relationship, emergency_phone,
        emergency_email, emergency_address, highest_education, field_of_study,
        years_of_experience, current_employer, current_position, expected_salary,
        notice_period, available_start_date, passport_photo, resume_pdf, cover_letter_pdf,
        cover_message, how_did_you_hear, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        getField('career_posting_id'),
        appNumber,
        getField('full_name'),
        getField('ic_number'),
        getField('gender'),
        getField('date_of_birth'),
        getField('nationality') || 'Malaysian',
        getField('religion'),
        getField('marital_status') || 'Single',
        getField('email'),
        getField('phone_number'),
        getField('alt_phone_number'),
        getField('ic_address'),
        getField('ic_postcode'),
        getField('ic_city'),
        getField('ic_state'),
        getField('ic_country') || 'Malaysia',
        getField('same_as_ic_address') === 'true' ? getField('ic_address') : getField('current_address'),
        getField('same_as_ic_address') === 'true' ? getField('ic_postcode') : getField('current_postcode'),
        getField('same_as_ic_address') === 'true' ? getField('ic_city') : getField('current_city'),
        getField('same_as_ic_address') === 'true' ? getField('ic_state') : getField('current_state'),
        getField('same_as_ic_address') === 'true' ? getField('ic_country') || 'Malaysia' : getField('current_country'),
        getField('same_as_ic_address') === 'true',
        getField('emergency_name'),
        getField('emergency_relationship'),
        getField('emergency_phone'),
        getField('emergency_email'),
        getField('emergency_address'),
        getField('highest_education'),
        getField('field_of_study'),
        parseInt(getField('years_of_experience')) || 0,
        getField('current_employer'),
        getField('current_position'),
        parseFloat(getField('expected_salary')) || null,
        getField('notice_period'),
        getField('available_start_date') || null,
        passportPhoto,
        resumePdf,
        coverLetterPdf,
        getField('cover_message'),
        getField('how_did_you_hear'),
      ]
    );

    // Get job title for email
    const jobPostings = await query(
      'SELECT title FROM career_postings WHERE id = ?',
      [getField('career_posting_id')]
    ) as { title: string }[];
    
    const jobTitle = jobPostings.length > 0 ? jobPostings[0].title : 'Position';

    // Send notification emails
    try {
      // Send to HR
      await sendApplicationNotificationToHR({
        application_no: appNumber,
        full_name: getField('full_name'),
        email: getField('email'),
        phone_number: getField('phone_number'),
        position: jobTitle,
        years_of_experience: parseInt(getField('years_of_experience')) || 0
      });

      // Send confirmation to applicant
      await sendApplicationConfirmationToApplicant({
        full_name: getField('full_name'),
        email: getField('email'),
        application_no: appNumber,
        position: jobTitle
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application_no: appNumber,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

