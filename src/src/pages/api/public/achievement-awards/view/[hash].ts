import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Invalid hash' });
  }

  try {
    // Find award by hash
    const [rows] = await db.query(
      'SELECT * FROM achievement_awards WHERE view_hash = ? AND is_active = 1',
      [hash]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Achievement award not found' });
    }

    const award = (rows as any[])[0];

    // Read original PDF
    const pdfPath = path.join(process.cwd(), 'public', award.file_path);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);

    // Load PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Add watermarks to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Add "CONFIDENTIAL" watermarks (RED)
      const watermarkText1 = 'CONFIDENTIAL';
      const fontSize1 = 50;
      
      // Add multiple "CONFIDENTIAL" watermarks across page
      for (let y = 0; y < height; y += 150) {
        for (let x = -100; x < width; x += 300) {
          page.drawText(watermarkText1, {
            x: x,
            y: y,
            size: fontSize1,
            color: rgb(0.86, 0.21, 0.27), // Red color
            opacity: 0.1,
            rotate: degrees(-45),
          });
        }
      }

      // Add "ANSAR TECHNOLOGIES SDN BHD" watermarks (BLUE)
      const watermarkText2 = 'ANSAR TECHNOLOGIES SDN BHD';
      const fontSize2 = 30;
      
      // Add multiple "ANSAR TECHNOLOGIES SDN BHD" watermarks across page
      for (let y = 75; y < height; y += 150) {
        for (let x = -50; x < width; x += 350) {
          page.drawText(watermarkText2, {
            x: x,
            y: y,
            size: fontSize2,
            color: rgb(0.05, 0.43, 0.99), // Blue color
            opacity: 0.08,
            rotate: degrees(-45),
          });
        }
      }

      // Add footer watermark
      page.drawText('© ANSAR TECHNOLOGIES SDN BHD - Confidential Document', {
        x: width / 2 - 180,
        y: 20,
        size: 10,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.5,
      });
    }

    // Set PDF metadata
    pdfDoc.setTitle(`ANSAR TECHNOLOGIES SDN BHD - ${award.award_name} (CONFIDENTIAL)`);
    pdfDoc.setSubject(`${award.award_name} - Confidential`);
    pdfDoc.setAuthor('ANSAR TECHNOLOGIES SDN BHD');
    pdfDoc.setKeywords(['confidential', 'protected', 'achievement', award.category.toLowerCase()]);
    pdfDoc.setProducer('ANSAR TECHNOLOGIES SDN BHD');
    pdfDoc.setCreator('ANSAR TECHNOLOGIES SDN BHD');

    // Save watermarked PDF
    const pdfBytes = await pdfDoc.save();

    // Set headers to display PDF inline with no download option
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${award.award_name}-confidential.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Disable caching
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating watermarked PDF:', error);
    res.status(500).json({ error: 'Failed to generate watermarked PDF' });
  }
}

