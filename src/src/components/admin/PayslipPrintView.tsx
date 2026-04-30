'use client';

import React, { useEffect, useState } from 'react';
import '@/app/globals.css';
import jsPDF from 'jspdf';

interface PayslipPrintViewProps {
  recordId: number;
  hash: string;
  onClose: () => void;
}

interface PayslipRecord {
  id: number;
  payslip_number: string;
  employee_number: string;
  employee_name: string;
  ic_number: string;
  department_name: string;
  period_name: string;
  period_month: number;
  period_year: number;
  start_date: string;
  end_date: string;
  payment_date: string;
  basic_salary: string;
  housing_allowance: string;
  transport_allowance: string;
  meal_allowance: string;
  other_allowances: string;
  overtime_amount: string;
  bonus_amount: string;
  commission_amount: string;
  gross_salary: string;
  epf_employee: string;
  socso_employee: string;
  eis_employee: string;
  tax_deduction: string;
  loan_deduction: string;
  advance_deduction: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  epf_employer: string;
  socso_employer: string;
  eis_employer: string;
  bank_name: string;
  bank_account_number: string;
  status: string;
}

interface LeaveBalance {
  total_days: number;
  used_days: number;
  remaining_days: number;
}

interface SystemSettings {
  company_name: string;
  company_registration_no: string;
  company_address_line1: string;
  company_address_line2: string;
  company_phone: string;
  company_email: string;
  logo_path: string;
}

export default function PayslipPrintView({ recordId, hash, onClose }: PayslipPrintViewProps) {
  const [record, setRecord] = useState<PayslipRecord | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPayslipData();
    fetchSystemSettings();
  }, [recordId]);

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/public/system-settings');
      if (response.ok) {
        const data = await response.json();
        setSystemSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // Use defaults if fetch fails
      setSystemSettings({
        company_name: 'ANSAR TECHNOLOGIES SDN BHD',
        company_registration_no: '201101012342 (940482-W)',
        company_address_line1: 'No. 53-2, Jalan Medan Putra 3,',
        company_address_line2: 'Bandar Manjalara, 52200 Kuala Lumpur',
        company_phone: '+603-6275 1128',
        company_email: 'info@ansartechnologies.com',
        logo_path: '/assets/img/logo.png',
      });
    }
  };

  const fetchPayslipData = async () => {
    try {
      // Try employee endpoint first (works for staff portal). Fallback to admin endpoint for admin portal.
      let recordData: any = null;
      let recordRes = await fetch(`/api/employee/payslips/${recordId}?hash=${hash}`);
      if (recordRes.ok) {
        recordData = await recordRes.json();
      } else {
        recordRes = await fetch(`/api/admin/payroll/records/${recordId}?hash=${hash}`);
        recordData = await recordRes.json();
      }
      
      if (recordData.record) {
        setRecord(recordData.record);
        
        // Fetch leave balance (employee-safe if possible)
        let leaveData: any = [];
        try {
          const empLeaveRes = await fetch(`/api/employee/leave/balance?hash=${hash}&employee_id=${recordData.record.employee_id}&year=${recordData.record.period_year}`);
          if (empLeaveRes.ok) {
            const emp = await empLeaveRes.json();
            leaveData = emp.balances || [];
          } else {
            const adminLeaveRes = await fetch(`/api/admin/leave/balance?hash=${hash}&employee_id=${recordData.record.employee_id}&year=${recordData.record.period_year}`);
            if (adminLeaveRes.ok) {
              leaveData = await adminLeaveRes.json();
            }
          }
        } catch {}
        
        // Find Annual Leave balance
        const annualLeave = Array.isArray(leaveData) ? leaveData.find((lb: any) => lb.leave_type_code === 'AL' || lb.leave_type === 'Annual Leave') : null;
        if (annualLeave) {
          setLeaveBalance({
            total_days: annualLeave.total_days,
            used_days: annualLeave.used_days,
            remaining_days: annualLeave.remaining_days
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payslip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!record || !systemSettings) return;
    
    setGenerating(true);
    try {
      // Create PDF - A5 Landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5'
      });

      const pageWidth = 210;
      const pageHeight = 148;
      let y = 8; // Starting Y position

      // Helper functions
      const formatCurrency = (val: string | number) => parseFloat(String(val)).toFixed(2);
      
      // Add logo as image (BALANCED SIZE & CENTERED) - DYNAMIC
      const logoWidth = 32;
      const logoHeight = 16;
      const companyInfoHeight = 16; // Total height of company info block
      const logoY = y + (companyInfoHeight / 2) - (logoHeight / 2); // Center vertically with company info
      
      try {
        const logoImg = new Image();
        logoImg.src = systemSettings.logo_path; // DYNAMIC LOGO
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          setTimeout(reject, 2000); // 2s timeout
        });
        // 32x16 - balanced size, vertically centered
        pdf.addImage(logoImg, 'PNG', 12, logoY, logoWidth, logoHeight);
      } catch {
        // Fallback to text if image fails
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 138);
        pdf.text(systemSettings.company_name.substring(0, 20), 12, logoY + 8); // DYNAMIC FALLBACK
      }
      
      // Company info (right aligned) - ALL DYNAMIC
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(systemSettings.company_name, pageWidth - 12, y + 3, { align: 'right' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(31, 41, 55);
      pdf.text(systemSettings.company_address_line1, pageWidth - 12, y + 7, { align: 'right' });
      pdf.text(systemSettings.company_address_line2, pageWidth - 12, y + 10, { align: 'right' });
      pdf.text(`Tel: ${systemSettings.company_phone} | Email: ${systemSettings.company_email}`, pageWidth - 12, y + 13, { align: 'right' });
      pdf.text(`SSM: ${systemSettings.company_registration_no}`, pageWidth - 12, y + 16, { align: 'right' });
      
      // Blue line
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.line(12, y + 19, pageWidth - 12, y + 19);
      
      y = y + 22;
      
      // Title - Blue background
      pdf.setFillColor(30, 58, 138);
      pdf.rect(12, y, pageWidth - 24, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SLIP GAJI / PAY SLIP', pageWidth / 2, y + 5, { align: 'center' });
      
      y = y + 11;
      
      // Employee Info - Light gray background
      pdf.setFillColor(249, 250, 251);
      pdf.rect(12, y, pageWidth - 24, 18, 'F');
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(12, y, pageWidth - 24, 18, 'S');
      
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      
      // Left column
      let col1X = 15;
      let col2X = 105;
      let lineY = y + 4;
      
      pdf.text('Nama / Name:', col1X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.employee_name, col1X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('No. K/P / IC No:', col1X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.ic_number || '-', col1X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('No. Pekerja / Employee No:', col1X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.employee_number, col1X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('No. Slip Gaji / Payslip No:', col1X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.payslip_number, col1X + 45, lineY);
      
      // Right column
      lineY = y + 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Jabatan / Department:', col2X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.department_name || '-', col2X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tempoh Gaji / Pay Period:', col2X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(record.period_name, col2X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tarikh Bayaran / Payment Date:', col2X, lineY);
      pdf.setFont('helvetica', 'normal');
      const paymentDate = new Date(record.payment_date);
      pdf.text(paymentDate.toLocaleDateString('en-GB'), col2X + 45, lineY);
      
      lineY += 4;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bank / Akaun:', col2X, lineY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${record.bank_name || '-'} (${record.bank_account_number || '-'})`, col2X + 45, lineY);
      
      y = lineY + 8;  // Increased spacing from 5 to 8
      
      // Earnings & Deductions Table (2 sections, each 50%)
      const tableStartY = y;
      const tableWidth = pageWidth - 24; // Total width: 186mm
      const halfWidth = tableWidth / 2; // 93mm each side
      const col1Width = halfWidth * 0.72; // Earnings label: 67mm
      const col2Width = halfWidth * 0.28; // Earnings RM: 26mm
      const col3Width = halfWidth * 0.72; // Deductions label: 67mm
      const col4Width = halfWidth * 0.28; // Deductions RM: 26mm
      
      // Table header with borders - ONLY 4 columns total (2 for earnings, 2 for deductions)
      pdf.setFillColor(30, 58, 138);
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.3);
      
      // Left side: Earnings (Label + RM)
      pdf.rect(12, tableStartY, col1Width, 7, 'FD');
      pdf.rect(12 + col1Width, tableStartY, col2Width, 7, 'FD');
      
      // Right side: Deductions (Label + RM)
      pdf.rect(12 + col1Width + col2Width, tableStartY, col3Width, 7, 'FD');
      pdf.rect(12 + col1Width + col2Width + col3Width, tableStartY, col4Width, 7, 'FD');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      // Earnings header
      pdf.text('PEROLEHAN / EARNINGS', 14, tableStartY + 4.5);
      pdf.text('RM', 12 + col1Width + col2Width - 3, tableStartY + 4.5, { align: 'right' });
      
      // Deductions header
      pdf.text('POTONGAN / DEDUCTIONS', 12 + col1Width + col2Width + 2, tableStartY + 4.5);
      pdf.text('RM', 12 + col1Width + col2Width + col3Width + col4Width - 3, tableStartY + 4.5, { align: 'right' });
      
      y = tableStartY + 9;
      
      // Earnings
      const earnings = [
        { label: 'Gaji Asas / Basic Salary', value: record.basic_salary },
        { label: 'Elaun Pengangkutan / Transport Allowance', value: record.transport_allowance },
        { label: 'Bayaran Lebih Masa / Overtime', value: record.overtime_amount },
        { label: 'Bonus / Bonus', value: record.bonus_amount },
        { label: 'Komisen / Commission', value: record.commission_amount },
      ].filter(e => parseFloat(String(e.value)) > 0);
      
      // Deductions
      const deductions = [
        { label: 'KWSP Pekerja / EPF Employee (11%)', value: record.epf_employee },
        { label: 'PERKESO Pekerja / SOCSO Employee (0.5%)', value: record.socso_employee },
        { label: 'SIP / EIS (0.2%)', value: record.eis_employee },
      ];
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      
      const maxRows = Math.max(earnings.length, deductions.length);
      
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.2);
      
      for (let i = 0; i < maxRows; i++) {
        const rowHeight = 5; // Increased from 4 to 5 for more space
        const rowY = y - 2.5;
        
        // Alternate row colors with borders
        if (i % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        
        // Draw row background with borders (using col4Width instead of col2Width for last column)
        pdf.rect(12, rowY, col1Width, rowHeight, 'FD');
        pdf.rect(12 + col1Width, rowY, col2Width, rowHeight, 'FD');
        pdf.rect(12 + col1Width + col2Width, rowY, col3Width, rowHeight, 'FD');
        pdf.rect(12 + col1Width + col2Width + col3Width, rowY, col4Width, rowHeight, 'FD');
        
        // Center text vertically in row: rowY + (rowHeight / 2) + 1.2
        const textY = rowY + (rowHeight / 2) + 1.2;
        
        // Earnings
        if (earnings[i]) {
          pdf.text(earnings[i].label, 14, textY);
          pdf.text(formatCurrency(earnings[i].value), 12 + col1Width + col2Width - 3, textY, { align: 'right' });
        }
        
        // Deductions
        if (deductions[i]) {
          pdf.text(deductions[i].label, 12 + col1Width + col2Width + 2, textY);
          pdf.text(formatCurrency(deductions[i].value), 12 + col1Width + col2Width + col3Width + col4Width - 3, textY, { align: 'right' });
        }
        
        y += rowHeight;
      }
      
      // Total row with borders
      const totalRowHeight = 6;
      pdf.setFillColor(219, 234, 254);
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.rect(12, y - 2.5, col1Width, totalRowHeight, 'FD');
      pdf.rect(12 + col1Width, y - 2.5, col2Width, totalRowHeight, 'FD');
      pdf.rect(12 + col1Width + col2Width, y - 2.5, col3Width, totalRowHeight, 'FD');
      pdf.rect(12 + col1Width + col2Width + col3Width, y - 2.5, col4Width, totalRowHeight, 'FD');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138);
      // Center text vertically in 6mm row: y position adjusted for middle
      const totalTextY = y - 2.5 + (totalRowHeight / 2) + 1.5;
      pdf.text('Jumlah Perolehan Kasar / Gross Salary', 14, totalTextY);
      pdf.text(formatCurrency(record.gross_salary), 12 + col1Width + col2Width - 3, totalTextY, { align: 'right' });
      pdf.text('Jumlah Potongan / Total Deductions', 12 + col1Width + col2Width + 2, totalTextY);
      pdf.text(formatCurrency(record.total_deductions), 12 + col1Width + col2Width + col3Width + col4Width - 3, totalTextY, { align: 'right' });
      
      y += 8;
      
      // Net Salary - Green box
      const netSalaryHeight = 8;
      pdf.setFillColor(4, 120, 87);
      pdf.setDrawColor(6, 95, 70);
      pdf.setLineWidth(0.5);
      pdf.rect(12, y - 2, pageWidth - 24, netSalaryHeight, 'FD');
      pdf.setTextColor(255, 255, 255);
      
      // Center text vertically in 8mm box
      const netSalaryTextY = (y - 2) + (netSalaryHeight / 2) + 1.5;
      pdf.setFontSize(10);
      pdf.text('GAJI BERSIH / NET SALARY', 14, netSalaryTextY);
      pdf.setFontSize(14);
      pdf.text(`RM ${formatCurrency(record.net_salary)}`, pageWidth - 14, netSalaryTextY, { align: 'right' });
      
      y += 10;
      
      // Employer Contributions - Blue box (VERTICALLY CENTERED)
      const employerBoxHeight = 13;
      const employerBoxY = y - 1;
      pdf.setFillColor(224, 231, 255);
      pdf.setDrawColor(99, 102, 241);
      pdf.rect(12, employerBoxY, pageWidth - 24, employerBoxHeight, 'FD');
      pdf.setTextColor(49, 46, 129);
      
      // Center title vertically: boxY + (height/2) - 1.5 (offset for 2 lines)
      pdf.setFontSize(6);
      const employerTitleY = employerBoxY + (employerBoxHeight / 2) - 1;
      pdf.text('CARUMAN MAJIKAN / EMPLOYER CONTRIBUTIONS (Untuk Rujukan / For Reference)', pageWidth / 2, employerTitleY, { align: 'center' });
      
      // Center details vertically: boxY + (height/2) + 2 (below title)
      pdf.setFontSize(6.5);
      const employerDetailsY = employerBoxY + (employerBoxHeight / 2) + 2.5;
      pdf.text(`KWSP Majikan / EPF Employer (13%): RM ${formatCurrency(record.epf_employer)}`, 22, employerDetailsY);
      pdf.text(`PERKESO Majikan / SOCSO Employer (1.75%): RM ${formatCurrency(record.socso_employer)}`, 90, employerDetailsY);
      pdf.text(`SIP / EIS (0.2%): RM ${formatCurrency(record.eis_employer)}`, 155, employerDetailsY);
      
      y += employerBoxHeight + 1;
      
      // Footer
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'italic');
      pdf.text('* Slip gaji ini dijana secara automatik dan tidak memerlukan tandatangan.', 12, y);
      pdf.text('* This payslip is computer-generated and does not require a signature.', pageWidth - 12, y, { align: 'right' });
      
      y += 3;
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rujukan KWSP: Jadual Ketiga (Akta KWSP 1991)', 12, y);
      pdf.text('EPF Reference: Third Schedule (EPF Act 1991)', pageWidth - 12, y, { align: 'right' });
      
      y += 3;
      pdf.setTextColor(156, 163, 175);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      const printDate = new Date().toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      pdf.text(`Dicetak pada / Printed on: ${printDate}`, pageWidth / 2, y, { align: 'center' });
      
      // Download
      const filename = `Payslip_${record.employee_number}_${record.period_name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toFixed(2);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="payslip-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="payslip-error">
        <p>Payslip not found</p>
        <button onClick={onClose} className="btn btn-secondary">Close</button>
      </div>
    );
  }

  return (
    <>
      {/* Modal Header */}
      <div className="modal-header no-print" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#0891b2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffffff',
            border: '2px solid #e5e7eb'
          }}>
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <div>
            <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
              {record.employee_name}
            </h5>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {record.employee_number} • {record.department_name}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleDownloadPDF}
            disabled={generating || !systemSettings}
            style={{ fontSize: '12px' }}
          >
            {generating ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : !systemSettings ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              <>
                <i className="bi bi-download me-1"></i>
                Download PDF
              </>
            )}
          </button>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="modal-body" style={{ padding: '20px', backgroundColor: '#f5f5f5', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
        <div className="payslip-container">
          {/* A5 Landscape Payslip */}
          <div className="payslip-page">
          {/* Header with Logo and Company Info */}
          <div className="payslip-header">
            <div className="header-logo">
              <img src={systemSettings?.logo_path || '/assets/img/logo.png'} alt="Company Logo" className="company-logo" />
            </div>
            <div className="header-company-info">
              <h5 className="company-name">{systemSettings?.company_name || 'ANSAR TECHNOLOGIES SDN BHD'}</h5>
              <p className="company-address">
                {systemSettings?.company_address_line1 || 'No. 53-2, Jalan Medan Putra 3,'}<br />
                {systemSettings?.company_address_line2 || 'Bandar Manjalara, 52200 Kuala Lumpur'}<br />
                Tel: {systemSettings?.company_phone || '+603-6275 1128'} | Email: {systemSettings?.company_email || 'info@ansartechnologies.com'}<br />
                SSM: {systemSettings?.company_registration_no || '201101012342 (940482-W)'}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="payslip-title">
            <h3>SLIP GAJI / PAY SLIP</h3>
          </div>

          {/* Employee Information */}
          <div className="payslip-employee-info">
            <div className="info-row">
              <div className="info-left">
                <div className="info-item">
                  <span className="info-label">Nama / Name:</span>
                  <span className="info-value">{record.employee_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">No. K/P / IC No:</span>
                  <span className="info-value">{record.ic_number || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">No. Pekerja / Employee No:</span>
                  <span className="info-value">{record.employee_number}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">No. Slip Gaji / Payslip No:</span>
                  <span className="info-value">{record.payslip_number}</span>
                </div>
              </div>
              <div className="info-right">
                <div className="info-item">
                  <span className="info-label">Jabatan / Department:</span>
                  <span className="info-value">{record.department_name || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tempoh Gaji / Pay Period:</span>
                  <span className="info-value">{record.period_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tarikh Bayaran / Payment Date:</span>
                  <span className="info-value">{formatDate(record.payment_date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bank / Akaun:</span>
                  <span className="info-value">{record.bank_name || '-'} ({record.bank_account_number || '-'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings and Deductions Table */}
          <div className="payslip-table-container">
            <table className="payslip-table">
              <thead>
                <tr>
                  <th className="earnings-header">PEROLEHAN / EARNINGS</th>
                  <th className="amount-header">RM</th>
                  <th className="deductions-header">POTONGAN / DEDUCTIONS</th>
                  <th className="amount-header">RM</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic Earnings and Deductions - Only show if value > 0 */}
                {(() => {
                  // Define all possible earnings
                  const earnings = [
                    { label: 'Gaji Asas / Basic Salary', value: record.basic_salary, alwaysShow: true },
                    { label: 'Elaun Perumahan / Housing Allowance', value: record.housing_allowance },
                    { label: 'Elaun Pengangkutan / Transport Allowance', value: record.transport_allowance },
                    { label: 'Elaun Makan / Meal Allowance', value: record.meal_allowance },
                    { label: 'Elaun Lain-lain / Other Allowances', value: record.other_allowances },
                    { label: 'Bayaran Lebih Masa / Overtime', value: record.overtime_amount },
                    { label: 'Bonus / Bonus', value: record.bonus_amount },
                    { label: 'Komisen / Commission', value: record.commission_amount },
                  ];

                  // Filter to only show items with value > 0 (except always show items)
                  const filteredEarnings = earnings.filter(item => item.alwaysShow || (item.value && parseFloat(String(item.value)) > 0));

                  // Define all possible deductions
                  const deductions = [
                    { label: 'KWSP Pekerja / EPF Employee (11%)', value: record.epf_employee, alwaysShow: true },
                    { label: 'PERKESO Pekerja / SOCSO Employee (0.5%)', value: record.socso_employee, alwaysShow: true },
                    { label: 'SIP / EIS (0.2%)', value: record.eis_employee, alwaysShow: true },
                    { label: 'Cukai Pendapatan / Income Tax', value: record.tax_deduction },
                    { label: 'Potongan Pinjaman / Loan Deduction', value: record.loan_deduction },
                    { label: 'Potongan Pendahuluan / Advance Deduction', value: record.advance_deduction },
                    { label: 'Potongan Lain-lain / Other Deductions', value: record.other_deductions },
                  ].filter(item => item.alwaysShow || (item.value && parseFloat(String(item.value)) > 0));

                  // Get max length to determine number of rows
                  const maxRows = Math.max(filteredEarnings.length, deductions.length);
                  
                  return Array.from({ length: maxRows }).map((_, index) => (
                    <tr key={index}>
                      <td>{filteredEarnings[index]?.label || ''}</td>
                      <td className="amount">{filteredEarnings[index] ? formatCurrency(filteredEarnings[index].value) : ''}</td>
                      <td>{deductions[index]?.label || ''}</td>
                      <td className="amount">{deductions[index] ? formatCurrency(deductions[index].value) : ''}</td>
                    </tr>
                  ));
                })()}
                
                {/* Total Row */}
                <tr className="total-row">
                  <td><strong>Jumlah Perolehan Kasar / Gross Salary</strong></td>
                  <td className="amount"><strong>{formatCurrency(record.gross_salary)}</strong></td>
                  <td><strong>Jumlah Potongan / Total Deductions</strong></td>
                  <td className="amount"><strong>{formatCurrency(record.total_deductions)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary */}
          <div className="payslip-net-salary">
            <div className="net-salary-label">GAJI BERSIH / NET SALARY</div>
            <div className="net-salary-amount">RM {formatCurrency(record.net_salary)}</div>
          </div>

          {/* Employer Contributions */}
          <div className="payslip-employer-contributions">
            <div className="employer-title">CARUMAN MAJIKAN / EMPLOYER CONTRIBUTIONS (Untuk Rujukan / For Reference)</div>
            <div className="employer-details">
              <div className="employer-item">
                <span className="employer-label">KWSP Majikan / EPF Employer (13%):</span>
                <span className="employer-value">RM {formatCurrency(record.epf_employer)}</span>
              </div>
              <div className="employer-divider">|</div>
              <div className="employer-item">
                <span className="employer-label">PERKESO Majikan / SOCSO Employer (1.75%):</span>
                <span className="employer-value">RM {formatCurrency(record.socso_employer)}</span>
              </div>
              <div className="employer-divider">|</div>
              <div className="employer-item">
                <span className="employer-label">SIP / EIS (0.2%):</span>
                <span className="employer-value">RM {formatCurrency(record.eis_employer)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="payslip-footer">
            <div className="footer-notes-row">
              <p className="footer-note-left">
                * Slip gaji ini dijana secara automatik dan tidak memerlukan tandatangan.
              </p>
              <p className="footer-note-right">
                * This payslip is computer-generated and does not require a signature.
              </p>
            </div>
            <div className="footer-reference-row">
              <p className="footer-reference-left">
                Rujukan KWSP: Jadual Ketiga (Akta KWSP 1991)
              </p>
              <p className="footer-reference-right">
                EPF Reference: Third Schedule (EPF Act 1991)
              </p>
            </div>
            <p className="footer-print-date">
              Dicetak pada / Printed on: {new Date().toLocaleString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        .payslip-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          background: transparent;
          font-family: 'Poppins', Arial, sans-serif;
        }

        .payslip-page {
          width: 210mm;
          height: 148mm;
          margin: 0 auto;
          padding: 8mm 12mm;
          background: white;
          box-shadow: none;
          border: none;
          page-break-after: always;
          box-sizing: border-box;
        }

        /* Header */
        .payslip-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 8px;
          border-bottom: 3px solid #1e3a8a;
          margin-bottom: 8px;
        }

        .header-logo {
          width: 80px;
        }

        .company-logo {
          width: 100%;
          height: auto;
          max-height: 50px;
          object-fit: contain;
        }

        .header-company-info {
          text-align: right;
          flex: 1;
        }

        .company-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }

        .company-address {
          font-size: 9px;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        /* Title */
        .payslip-title {
          text-align: center;
          padding: 6px 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          margin-bottom: 8px;
        }

        .payslip-title h3 {
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: 1px;
        }

        /* Employee Info */
        .payslip-employee-info {
          margin-bottom: 8px;
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          background: #f9fafb;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .info-left,
        .info-right {
          display: flex;
          flex-direction: column;
        }

        .info-item {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 8px;
          margin-bottom: 3px;
          font-size: 9px;
          align-items: baseline;
        }

        .info-label {
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
        }

        .info-value {
          color: #1f2937;
          word-break: break-word;
        }

        /* Table */
        .payslip-table-container {
          margin-bottom: 6px;
        }

        .payslip-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
        }

        .payslip-table thead th {
          background: #1e3a8a;
          color: white;
          padding: 5px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
          border: 1px solid #1e3a8a;
        }

        .earnings-header,
        .deductions-header {
          width: 42%;
        }

        .amount-header {
          width: 16%;
          text-align: right;
        }

        .payslip-table tbody td {
          padding: 3px 8px;
          border: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .payslip-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .payslip-table tbody tr:nth-child(odd) {
          background: white;
        }

        .payslip-table .amount {
          text-align: right;
          font-family: 'Courier New', monospace;
        }

        .payslip-table .total-row {
          background: #dbeafe !important;
          font-weight: 700;
        }

        .payslip-table .total-row td {
          padding: 5px 8px;
          border-top: 2px solid #1e3a8a;
          color: #1e3a8a;
        }

        /* Net Salary */
        .payslip-net-salary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 20px;
          background: linear-gradient(135deg, #047857 0%, #059669 100%);
          margin-bottom: 6px;
          border-radius: 2px;
          border: 2px solid #065f46;
        }

        .net-salary-label {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .net-salary-amount {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Courier New', monospace;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        /* Employer Contributions */
        .payslip-employer-contributions {
          padding: 4px 10px;
          background: #e0e7ff;
          border: 1px solid #6366f1;
          margin-bottom: 5px;
        }

        .employer-title {
          font-size: 8px;
          font-weight: 700;
          color: #312e81;
          margin-bottom: 3px;
          text-align: center;
        }

        .employer-details {
          display: flex;
          justify-content: space-around;
          align-items: center;
          font-size: 8px;
        }

        .employer-item {
          display: flex;
          gap: 5px;
        }

        .employer-label {
          color: #3730a3;
          font-weight: 600;
        }

        .employer-value {
          color: #312e81;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }

        .employer-divider {
          color: #4338ca;
          font-size: 12px;
          font-weight: 300;
        }

        /* Footer */
        .payslip-footer {
          font-size: 8px;
          line-height: 1.4;
        }

        .footer-notes-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 15px;
        }

        .footer-note-left {
          margin: 0;
          font-style: italic;
          color: #374151;
          text-align: left;
          flex: 1;
        }

        .footer-note-right {
          margin: 0;
          font-style: italic;
          color: #374151;
          text-align: right;
          flex: 1;
        }

        .footer-reference-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 15px;
        }

        .footer-reference-left {
          margin: 0;
          color: #1e3a8a;
          font-weight: 600;
          text-align: left;
          flex: 1;
        }

        .footer-reference-right {
          margin: 0;
          color: #1e3a8a;
          font-weight: 600;
          text-align: right;
          flex: 1;
        }

        .footer-print-date {
          margin: 0;
          color: #9ca3af;
          font-size: 7px;
          text-align: center;
        }

        /* Loading and Error */
        .payslip-loading,
        .payslip-error {
          text-align: center;
          padding: 50px;
        }

        /* Print Styles */
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .modal-header,
          .modal-footer,
          .modal-body {
            padding: 0 !important;
            border: none !important;
            background: white !important;
          }

          .payslip-container {
            background: white;
            padding: 0;
            max-width: none;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .no-print {
            display: none !important;
          }

          .payslip-page {
            width: 210mm;
            height: 148mm;
            margin: 0 auto;
            padding: 8mm 12mm;
            box-shadow: none;
            page-break-after: always;
            box-sizing: border-box;
          }

          @page {
            size: A5 landscape;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
