import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECAPTCHA_SECRET_KEY = "6Lf7hforAAAAAK_ZIVv5MvrWkPy4_U397zlLGhW7";

// Configure route for longer execution time (for file uploads)
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Verify reCAPTCHA
    const recaptchaToken = formData.get("recaptcha_token") as string;
    
    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA token missing" },
        { status: 400 }
      );
    }

    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );

    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Extract form data
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const service = formData.get("service") as string;
    const message = formData.get("message") as string;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Create email transporter (Gmail SMTP with App Password)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: "support@ansartechnologies.my",
        pass: "gvvu wdfq qrpt zjnj",
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 45000,
    });
    
    // Test connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      throw new Error("Unable to connect to email server. Please contact support.");
    }

    // Process attachments
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    const attachmentFiles = formData.getAll("attachments");
    
    for (const file of attachmentFiles) {
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type,
        });
      }
    }

    // Email to support team
    const supportEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: #0d6efd; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e9ecef; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .info-label { font-weight: bold; min-width: 150px; color: #6c757d; }
    .info-value { flex: 1; color: #212529; }
    .message-box { background: #f8f9fa; border-left: 4px solid #0d6efd; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 New Contact Form Submission</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">📋 Contact Information</div>
        <div class="info-row">
          <div class="info-label">Full Name:</div>
          <div class="info-value">${name || '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Company:</div>
          <div class="info-value">${company || '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${email}">${email || '-'}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value"><a href="tel:${phone}">${phone || '-'}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">Subject:</div>
          <div class="info-value">${subject || '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Service Interest:</div>
          <div class="info-value">${service || 'Not specified'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💬 Message</div>
        <div class="message-box">
          ${message ? message.replace(/\n/g, '<br>') : '-'}
        </div>
      </div>

      ${attachments.length > 0 ? `
      <div class="alert">
        <strong>📎 Note:</strong> This enquiry includes ${attachments.length} attachment(s). Please check the attached files.
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">⏰ Submission Details</div>
        <div class="info-row">
          <div class="info-label">Date & Time:</div>
          <div class="info-value">${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Reference:</div>
          <div class="info-value">CONTACT-${Date.now()}</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      <p>This is an automated notification from the Contact Us form on ansartechnologies.my</p>
    </div>
  </div>
</body>
</html>
`;

    // Email to client (confirmation)
    const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 30px; }
    .success-box { background: #d1e7dd; border-left: 4px solid #198754; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .info-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
    .button { display: inline-block; padding: 12px 30px; background: #0d6efd; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Message Received</h1>
    </div>
    
    <div class="content">
      <div class="success-box">
        <h2 style="margin: 0 0 10px 0; color: #198754;">Thank You for Contacting Us!</h2>
        <p style="margin: 0;">We have received your message and will get back to you as soon as possible.</p>
      </div>

      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Thank you for reaching out to <strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      
      <p>We have successfully received your enquiry regarding: <strong>${subject}</strong></p>

      <div class="info-box">
        <p style="margin: 0;"><strong>📧 Subject:</strong> ${subject}</p>
        <p style="margin: 10px 0 0 0;"><strong>📅 Submitted:</strong> ${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</p>
        ${attachments.length > 0 ? `<p style="margin: 10px 0 0 0;"><strong>📎 Attachments:</strong> ${attachments.length} file(s)</p>` : ''}
      </div>

      <p>Our team will review your message and respond within <strong>1-2 business days</strong>. If your matter is urgent, please feel free to contact us directly:</p>

      <div class="info-box">
        <p style="margin: 0;"><strong>📞 Phone:</strong> <a href="tel:+60389590530">03-8959 0530</a></p>
        <p style="margin: 10px 0 0 0;"><strong>📧 Email:</strong> <a href="mailto:support@ansartechnologies.my">support@ansartechnologies.my</a></p>
        <p style="margin: 10px 0 0 0;"><strong>💬 WhatsApp:</strong> <a href="https://wa.me/601163440530">+601163440530</a></p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ansartechnologies.my" class="button">Visit Our Website</a>
      </div>

      <p>Best regards,<br><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>ANSAR TECHNOLOGIES SDN. BHD.</strong></p>
      <p>B2-1-34, Tingkat 1, Jalan Pinggiran 1/3, Taman Pinggiran Putra<br>43300 Seri Kembangan, Selangor, Malaysia</p>
      <p>This is an automated confirmation email. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

    // Send email to support team
    await transporter.sendMail({
      from: '"ANSAR TECHNOLOGIES - Contact Form" <support@ansartechnologies.my>',
      to: "support@ansartechnologies.my",
      subject: `New Contact Form: ${subject}`,
      html: supportEmailHtml,
      attachments: attachments,
    });

    // Send confirmation email to client
    await transporter.sendMail({
      from: '"ANSAR TECHNOLOGIES SDN. BHD." <support@ansartechnologies.my>',
      to: email,
      subject: "Thank You for Contacting ANSAR TECHNOLOGIES",
      html: clientEmailHtml,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Contact form error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send message. Please try again later." 
      },
      { status: 500 }
    );
  }
}

