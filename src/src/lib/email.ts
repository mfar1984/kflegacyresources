import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hr@ansartechnologies.my',
    pass: 'toim jetm qyps youu'
  }
});

// Send email to HR when new application submitted
export async function sendApplicationNotificationToHR(applicationData: {
  application_no: string;
  full_name: string;
  email: string;
  phone_number: string;
  position: string;
  years_of_experience: number;
}) {
  const mailOptions = {
    from: 'hr@ansartechnologies.my',
    to: 'hr@ansartechnologies.my',
    subject: `New Job Application - ${applicationData.application_no}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">New Job Application Received</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h3 style="color: #0056b3; margin-top: 0;">Application Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Application No:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.application_no}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Position Applied:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.position}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Applicant Name:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.phone_number}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Experience:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${applicationData.years_of_experience} years</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #0056b3;">
            <p style="margin: 0;"><strong>Action Required:</strong> Please review this application in the admin panel.</p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #f0f0f0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            ANSAR TECHNOLOGIES SDN BHD<br>
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending HR notification:', error);
    return { success: false, error };
  }
}

// Send interview schedule email to applicant
export async function sendInterviewScheduleToApplicant(applicantData: {
  full_name: string;
  email: string;
  application_no: string;
  position: string;
  interview_date: string;
  interview_time?: string;
  interview_location?: string;
  interview_notes?: string;
}) {
  const mailOptions = {
    from: 'hr@ansartechnologies.my',
    to: applicantData.email,
    subject: `Interview Invitation - ${applicantData.position}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Interview Invitation</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${applicantData.full_name},</p>
          
          <p>Thank you for applying for the <strong>${applicantData.position}</strong> position at ANSAR TECHNOLOGIES SDN BHD.</p>
          
          <p>We are pleased to invite you for an interview.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #0056b3; margin: 20px 0;">
            <h3 style="color: #0056b3; margin-top: 0;">Interview Details</h3>
            
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;"><strong>Application No:</strong></td>
                <td style="padding: 8px 0;">${applicantData.application_no}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Position:</strong></td>
                <td style="padding: 8px 0;">${applicantData.position}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0;">${new Date(applicantData.interview_date).toLocaleDateString('en-MY', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
              ${applicantData.interview_time ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0;">${applicantData.interview_time}</td>
              </tr>
              ` : ''}
              ${applicantData.interview_location ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">${applicantData.interview_location}</td>
              </tr>
              ` : ''}
            </table>
            
            ${applicantData.interview_notes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="margin: 0;"><strong>Additional Notes:</strong></p>
                <p style="margin: 5px 0 0 0;">${applicantData.interview_notes}</p>
              </div>
            ` : ''}
          </div>
          
          <p><strong>What to bring:</strong></p>
          <ul style="line-height: 1.8;">
            <li>Original and photocopies of your IC/Passport</li>
            <li>Original and photocopies of your academic certificates and transcripts</li>
            <li>Certified true copies of all certificates (verified by relevant authorized personnel)</li>
            <li>Updated resume/CV</li>
            <li>Portfolio or work samples (if applicable)</li>
            <li>Any other relevant supporting documents</li>
          </ul>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              <strong>Important:</strong> Please ensure all certificate copies are certified/authenticated by the relevant authorized officer from your institution or a commissioner of oaths.
            </p>
          </div>
          
          <p>If you need to reschedule or have any questions, please contact us immediately at hr@ansartechnologies.my or call +60 11-6344 0530.</p>
          
          <p>We look forward to meeting you!</p>
          
          <p>Best regards,<br>
          <strong>Human Resources Department</strong><br>
          ANSAR TECHNOLOGIES SDN BHD</p>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #f0f0f0; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            ANSAR TECHNOLOGIES SDN BHD (940482-W)<br>
            Email: hr@ansartechnologies.my | Phone: +60 11-6344 0530
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending interview schedule:', error);
    return { success: false, error };
  }
}

// Send shortlisted email to applicant
export async function sendShortlistedEmailToApplicant(applicantData: {
  full_name: string;
  email: string;
  application_no: string;
  position: string;
  expected_salary?: number;
  interview_date?: string;
  interview_notes?: string;
}) {
  const mailOptions = {
    from: 'hr@ansartechnologies.my',
    to: applicantData.email,
    subject: `Good News - Application Shortlisted`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="background-color: #0284c7; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🎉 Congratulations!</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${applicantData.full_name},</p>
          
          <p>We are pleased to inform you that your application for the <strong>${applicantData.position}</strong> position has been <strong>shortlisted</strong> for further consideration.</p>
          
          <p>Your qualifications and experience have impressed our hiring team, and we would like to proceed to the next stage of our selection process.</p>
          
          <div style="background-color: #dbeafe; padding: 20px; border-left: 4px solid #0284c7; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #0284c7; margin-top: 0; font-size: 16px;">Application Summary</h3>
            
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; width: 40%;"><strong>Application No:</strong></td>
                <td style="padding: 8px 0;">${applicantData.application_no}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Position:</strong></td>
                <td style="padding: 8px 0;">${applicantData.position}</td>
              </tr>
              ${applicantData.expected_salary ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Expected Salary:</strong></td>
                <td style="padding: 8px 0;">RM ${applicantData.expected_salary.toLocaleString()}</td>
              </tr>
              ` : ''}
              ${applicantData.interview_date ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Interview Date:</strong></td>
                <td style="padding: 8px 0;">${new Date(applicantData.interview_date).toLocaleDateString('en-MY', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul style="line-height: 1.8;">
            <li>Our HR team will review your application in detail</li>
            <li>We will conduct further assessments as needed</li>
            <li>You may be contacted for additional interviews or discussions</li>
            <li>Final candidates will be notified of the outcome</li>
          </ul>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              <strong>Please Note:</strong> Being shortlisted does not guarantee a job offer. This is part of our selection process, and we will keep you informed of further developments.
            </p>
          </div>
          
          <p>If you have any questions or need to update any information, please feel free to contact us at hr@ansartechnologies.my or call +60 11-6344 0530.</p>
          
          <p>Thank you for your patience and continued interest in joining ANSAR TECHNOLOGIES SDN BHD. We appreciate your understanding as we work through this process.</p>
          
          <p>Best regards,<br>
          <strong>Human Resources Department</strong><br>
          ANSAR TECHNOLOGIES SDN BHD</p>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #f0f0f0; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            ANSAR TECHNOLOGIES SDN BHD (940482-W)<br>
            Email: hr@ansartechnologies.my | Phone: +60 11-6344 0530
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending shortlisted email:', error);
    return { success: false, error };
  }
}

// Send rejection email to applicant (soft and respectful)
export async function sendRejectionEmailToApplicant(applicantData: {
  full_name: string;
  email: string;
  application_no: string;
  position: string;
  rejection_reason?: string;
}) {
  const mailOptions = {
    from: 'hr@ansartechnologies.my',
    to: applicantData.email,
    subject: `Application Update - ${applicantData.application_no}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Application Update</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${applicantData.full_name},</p>
          
          <p>Thank you for your interest in the <strong>${applicantData.position}</strong> position and for taking the time to apply with ANSAR TECHNOLOGIES SDN BHD.</p>
          
          <p>We appreciate the effort you put into your application and the opportunity to learn more about your qualifications and experience.</p>
          
          <p>After careful consideration of all applications, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received many strong applications from talented candidates.</p>
          
          ${applicantData.rejection_reason ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px;">
              <strong>Feedback:</strong><br>
              ${applicantData.rejection_reason}
            </p>
          </div>
          ` : ''}
          
          <p>We encourage you to apply for future openings that match your skills and experience. Your resume will remain in our database for consideration for other suitable positions that may become available.</p>
          
          <p>We wish you all the best in your job search and future career endeavors. Thank you once again for your interest in joining our team.</p>
          
          <p>Best regards,<br>
          <strong>Human Resources Department</strong><br>
          ANSAR TECHNOLOGIES SDN BHD</p>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #0056b3; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px;">
              <strong>Stay Connected:</strong> Follow us on our social media channels to stay updated on new job opportunities and company news.
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #f0f0f0; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            ANSAR TECHNOLOGIES SDN BHD (940482-W)<br>
            Email: hr@ansartechnologies.my | Phone: +60 11-6344 0530
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error };
  }
}

// Send application confirmation to applicant
export async function sendApplicationConfirmationToApplicant(applicantData: {
  full_name: string;
  email: string;
  application_no: string;
  position: string;
}) {
  const mailOptions = {
    from: 'hr@ansartechnologies.my',
    to: applicantData.email,
    subject: `Application Received - ${applicantData.application_no}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Application Received</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${applicantData.full_name},</p>
          
          <p>Thank you for your interest in joining ANSAR TECHNOLOGIES SDN BHD.</p>
          
          <p>We have successfully received your application for the <strong>${applicantData.position}</strong> position.</p>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #0056b3; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application Number:</strong> ${applicantData.application_no}</p>
          </div>
          
          <p>Our HR team will review your application and contact you if your qualifications match our requirements.</p>
          
          <p>Please keep your application number for future reference.</p>
          
          <p>Best regards,<br>
          <strong>Human Resources Department</strong><br>
          ANSAR TECHNOLOGIES SDN BHD</p>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #f0f0f0; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            ANSAR TECHNOLOGIES SDN BHD (940482-W)<br>
            Email: hr@ansartechnologies.my | Phone: +60 11-6344 0530
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending application confirmation:', error);
    return { success: false, error };
  }
}

