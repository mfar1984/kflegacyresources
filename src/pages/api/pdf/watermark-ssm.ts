import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Read original PDF
    const pdfPath = path.join(process.cwd(), 'public', 'assets', 'pdf', 'ssm.pdf');
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

      // Add "KF LEGACY RESOURCES" watermarks (BLUE)
      const watermarkText2 = 'KF LEGACY RESOURCES';
      const fontSize2 = 35;
      
      // Add multiple "KF LEGACY RESOURCES" watermarks across page
      for (let y = 75; y < height; y += 150) {
        for (let x = -50; x < width; x += 300) {
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
      page.drawText('© KF Legacy Resources - Confidential Document', {
        x: width / 2 - 150,
        y: 20,
        size: 10,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.5,
      });
    }

    // Set PDF metadata
    pdfDoc.setTitle('KF Legacy Resources - SSM Registration (CONFIDENTIAL)');
    pdfDoc.setSubject('SSM Registration - Confidential');
    pdfDoc.setAuthor('KF Legacy Resources');
    pdfDoc.setKeywords(['confidential', 'protected', 'ssm']);
    pdfDoc.setProducer('KF Legacy Resources');
    pdfDoc.setCreator('KF Legacy Resources');

    // Save watermarked PDF
    const pdfBytes = await pdfDoc.save();

    // Set headers to display PDF inline with no download option
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="ssm-confidential.pdf"');
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

