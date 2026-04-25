import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { sendQuotationEmail } from '@/lib/email';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormFields {
  title: string;
  firstName: string;
  lastName: string;
  hpNumber: string;
  email: string;
  companyName: string;
  companyAddress: string;
  officeTel: string;
  officeFax: string;
  website: string;
  question: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data with file upload
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 30 * 1024 * 1024, // 30MB
      filter: function ({ mimetype }) {
        // Allow pdf, png, jpeg, jpg
        return (
          mimetype === 'application/pdf' ||
          mimetype === 'image/png' ||
          mimetype === 'image/jpeg' ||
          mimetype === 'image/jpg'
        );
      },
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract field values (formidable returns arrays)
    const formData: FormFields = {
      title: Array.isArray(fields.title) ? fields.title[0] : (fields.title || ''),
      firstName: Array.isArray(fields.firstName) ? fields.firstName[0] : (fields.firstName || ''),
      lastName: Array.isArray(fields.lastName) ? fields.lastName[0] : (fields.lastName || ''),
      hpNumber: Array.isArray(fields.hpNumber) ? fields.hpNumber[0] : (fields.hpNumber || ''),
      email: Array.isArray(fields.email) ? fields.email[0] : (fields.email || ''),
      companyName: Array.isArray(fields.companyName) ? fields.companyName[0] : (fields.companyName || ''),
      companyAddress: Array.isArray(fields.companyAddress) ? fields.companyAddress[0] : (fields.companyAddress || ''),
      officeTel: Array.isArray(fields.officeTel) ? fields.officeTel[0] : (fields.officeTel || ''),
      officeFax: Array.isArray(fields.officeFax) ? fields.officeFax[0] : (fields.officeFax || ''),
      website: Array.isArray(fields.website) ? fields.website[0] : (fields.website || ''),
      question: Array.isArray(fields.question) ? fields.question[0] : (fields.question || ''),
    };

    // Handle file upload
    let attachmentPath: string | undefined;
    let attachmentName: string | undefined;
    let attachmentSize: number | undefined;

    if (files.document) {
      const file = Array.isArray(files.document) ? files.document[0] : files.document;
      if (file && 'filepath' in file) {
        attachmentPath = file.filepath;
        attachmentName = file.originalFilename || 'document';
        attachmentSize = file.size;
      }
    }

    // Save to database
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO quotation_requests 
        (title, first_name, last_name, hp_number, email, company_name, company_address, 
         office_tel, office_fax, website, question, attachment_name, attachment_size, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          formData.title,
          formData.firstName,
          formData.lastName,
          formData.hpNumber,
          formData.email,
          formData.companyName,
          formData.companyAddress,
          formData.officeTel,
          formData.officeFax,
          formData.website,
          formData.question,
          attachmentName || null,
          attachmentSize || null,
        ]
      );

      // Send emails
      await sendQuotationEmail({
        ...formData,
        attachmentPath,
        attachmentName,
      });

      connection.release();

      return res.status(200).json({
        success: true,
        message: 'Quotation request submitted successfully',
      });
    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error processing quotation request:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

