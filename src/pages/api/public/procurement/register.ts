import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import { query } from '@/lib/db';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Generate unique application number
function generateApplicationNo(): string {
  const prefix = 'PROC';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Prepare upload directory first
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'procurement');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Parse form data with formidable (using uploadDir like Career API)
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      multiples: true,
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Helper to get field value
    const getField = (name: string): string | null => {
      const value = fields[name];
      if (Array.isArray(value)) return value[0] || null;
      return value || null;
    };

    // Generate application number
    const applicationNo = generateApplicationNo();

    // Get file paths (formidable already saved files to uploadDir)
    const getFilePath = (fileKey: string) => {
      const file = files[fileKey];
      if (!file) return null;
      const fileObj = Array.isArray(file) ? file[0] : file;
      return fileObj && fileObj.size > 0 ? require('path').basename(fileObj.filepath) : null;
    };

    const attachments: any = {
      doc_ssm: getFilePath('doc_ssm'),
      doc_profile: getFilePath('doc_profile'),
      doc_mof: getFilePath('doc_mof'),
      doc_cidb: getFilePath('doc_cidb'),
      doc_financial: getFilePath('doc_financial'),
      doc_bank: getFilePath('doc_bank'),
    };

    // Process multiple files for doc_others
    const otherFiles = files.doc_others;
    if (otherFiles) {
      const otherFilesArray = Array.isArray(otherFiles) ? otherFiles : [otherFiles];
      attachments.doc_others = otherFilesArray
        .filter(file => file && file.size > 0)
        .map(file => require('path').basename(file.filepath));
    }

    // Insert into database
    await query(
      `INSERT INTO procurement_applications (
        application_no, company_name, ssm_number, company_type, incorporation_date,
        business_address, city, state, postcode, office_phone, mobile_phone, email, website,
        mof_number, cidb_number, cidb_grade, bumiputera_status, paid_up_capital,
        num_employees, annual_turnover, years_in_business,
        bank_name, bank_account_number, bank_account_name,
        service_civil, service_mne, service_ict, service_pmc, service_trading, service_others,
        nature_of_business, products_services,
        director_name, director_ic, director_position, director_contact,
        attachments, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        applicationNo,
        getField('company_name'),
        getField('ssm_number'),
        getField('company_type'),
        getField('incorporation_date'),
        getField('business_address'),
        getField('city'),
        getField('state'),
        getField('postcode'),
        getField('office_phone'),
        getField('mobile_phone'),
        getField('email'),
        getField('website'),
        getField('mof_number'),
        getField('cidb_number'),
        getField('cidb_grade'),
        getField('bumiputera_status'),
        getField('paid_up_capital'),
        getField('num_employees'),
        getField('annual_turnover'),
        getField('years_in_business'),
        getField('bank_name'),
        getField('bank_account_number'),
        getField('bank_account_name'),
        getField('service_civil') === 'on' ? 'Yes' : 'No',
        getField('service_mne') === 'on' ? 'Yes' : 'No',
        getField('service_ict') === 'on' ? 'Yes' : 'No',
        getField('service_pmc') === 'on' ? 'Yes' : 'No',
        getField('service_trading') === 'on' ? 'Yes' : 'No',
        getField('service_others') === 'on' ? 'Yes' : 'No',
        getField('nature_of_business'),
        getField('products_services'),
        getField('director_name'),
        getField('director_ic'),
        getField('director_position'),
        getField('director_contact'),
        JSON.stringify(attachments),
        'pending'
      ]
    );

    // Send notification email to HR
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hr@ansartechnologies.my',
        pass: 'toim jetm qyps youu'
      }
    });

    const hrEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; }
    .section h2 { margin-top: 0; color: #007bff; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Supplier Registration</h1>
      <p>Application No: ${applicationNo}</p>
    </div>

    <div class="section">
      <h2>📋 Company Information</h2>
      <table>
        <tr><td>Company Name</td><td>${getField('company_name')}</td></tr>
        <tr><td>SSM Number</td><td>${getField('ssm_number')}</td></tr>
        <tr><td>Email</td><td>${getField('email')}</td></tr>
        <tr><td>Phone</td><td>${getField('office_phone')}</td></tr>
        <tr><td>City, State</td><td>${getField('city')}, ${getField('state')}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>🔧 Services Interested</h2>
      <ul>
        ${getField('service_civil') === 'on' ? '<li>Civil Engineering</li>' : ''}
        ${getField('service_mne') === 'on' ? '<li>Mechanical & Electrical Engineering</li>' : ''}
        ${getField('service_ict') === 'on' ? '<li>ICT Engineering</li>' : ''}
        ${getField('service_pmc') === 'on' ? '<li>Project Management & Consultancy</li>' : ''}
        ${getField('service_trading') === 'on' ? '<li>General Trading</li>' : ''}
        ${getField('service_others') === 'on' ? '<li>Others</li>' : ''}
      </ul>
    </div>

    <div style="margin-top: 30px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #0dcaf0;">
      <p><strong>📝 Action Required:</strong> Please review this application in the Procurement Management system.</p>
      <p>Documents have been uploaded and stored in the system.</p>
    </div>

    <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
      <p>Submitted on: ${new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await transporter.sendMail({
        from: '"ANSAR TECHNOLOGIES Procurement Portal" <hr@ansartechnologies.my>',
        to: 'hr@ansartechnologies.my',
        subject: `New Supplier Registration: ${getField('company_name')} (${applicationNo})`,
        html: hrEmailHtml,
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    // Send confirmation email to applicant
    const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 40px 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #ffffff; }
    .success-icon { text-align: center; margin: 20px 0; }
    h2 { color: #007bff; text-align: center; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
    .footer { background-color: #343a40; color: #ffffff; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ANSAR TECHNOLOGIES SDN. BHD.</h1>
      <p>Procurement Portal</p>
    </div>

    <div class="content">
      <h2>✓ Registration Received Successfully!</h2>
      
      <p>Dear <strong>${getField('company_name')}</strong>,</p>
      
      <p>Thank you for your interest in becoming a registered supplier with ANSAR TECHNOLOGIES SDN. BHD.</p>
      
      <div class="info-box">
        <p><strong>Application No:</strong> ${applicationNo}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</p>
      </div>

      <p>Our procurement team will review your application within 5-7 working days. You will be notified via email once the review is complete.</p>

      <p style="color: #666; font-size: 13px; margin-top: 30px;">
        <strong>Need assistance?</strong> Contact us at hr@ansartechnologies.my or call 03-8959 0530.
      </p>
    </div>

    <div class="footer">
      <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      <p style="font-size: 11px;">( 940482-W / 201101012342 )</p>
      <p>© ${new Date().getFullYear()} ANSAR TECHNOLOGIES. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await transporter.sendMail({
        from: '"ANSAR TECHNOLOGIES Procurement Team" <hr@ansartechnologies.my>',
        to: getField('email') as string,
        subject: 'Registration Confirmed - ANSAR TECHNOLOGIES Supplier Portal',
        html: clientEmailHtml,
      });
    } catch (emailError) {
      console.error('Client email error:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Registration submitted successfully',
      application_no: applicationNo
    });

  } catch (error) {
    console.error('Procurement registration error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process registration'
    });
  }
}

