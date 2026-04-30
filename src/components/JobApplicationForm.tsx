"use client";

import { useState } from 'react';
import { getSocket } from '@/lib/socket';

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  // Personal Information
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
  
  // IC Address
  ic_address: string;
  ic_postcode: string;
  ic_city: string;
  ic_state: string;
  ic_country: string;
  
  // Current Address
  current_address: string;
  current_postcode: string;
  current_city: string;
  current_state: string;
  current_country: string;
  same_as_ic_address: boolean;
  
  // Emergency Contact
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  emergency_email: string;
  emergency_address: string;
  
  // Education & Experience
  highest_education: string;
  field_of_study: string;
  years_of_experience: number;
  current_employer: string;
  current_position: string;
  expected_salary: string;
  notice_period: string;
  available_start_date: string;
  
  // Additional
  cover_message: string;
  how_did_you_hear: string;
}

const malaysianStates = [
  'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan', 
  'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 
  'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
];

export default function JobApplicationForm({ jobId, jobTitle, onClose, onSuccess }: JobApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    ic_number: '',
    gender: '',
    date_of_birth: '',
    nationality: 'Malaysian',
    religion: '',
    marital_status: '',
    email: '',
    phone_number: '',
    alt_phone_number: '',
    
    ic_address: '',
    ic_postcode: '',
    ic_city: '',
    ic_state: '',
    ic_country: 'Malaysia',
    
    current_address: '',
    current_postcode: '',
    current_city: '',
    current_state: '',
    current_country: 'Malaysia',
    same_as_ic_address: false,
    
    emergency_name: '',
    emergency_relationship: '',
    emergency_phone: '',
    emergency_email: '',
    emergency_address: '',
    
    highest_education: '',
    field_of_study: '',
    years_of_experience: 0,
    current_employer: '',
    current_position: '',
    expected_salary: '',
    notice_period: '',
    available_start_date: '',
    
    cover_message: '',
    how_did_you_hear: ''
  });
  
  const [files, setFiles] = useState({
    passport_photo: null as File | null,
    resume_pdf: null as File | null,
    cover_letter_pdf: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const updated = { ...prev, [name]: checked };
        
        if (name === 'same_as_ic_address' && checked) {
          updated.current_address = prev.ic_address;
          updated.current_postcode = prev.ic_postcode;
          updated.current_city = prev.ic_city;
          updated.current_state = prev.ic_state;
          updated.current_country = prev.ic_country;
        }
        
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'passport_photo' | 'resume_pdf' | 'cover_letter_pdf') => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch(step) {
      case 1: // Personal Information
        if (!formData.full_name || !formData.ic_number || !formData.email || 
            !formData.phone_number || !formData.date_of_birth || !formData.gender) {
          setError('Please fill in all required personal information fields');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (formData.ic_number.length < 12) {
          setError('Please enter a valid IC number');
          return false;
        }
        break;
        
      case 2: // Address Information
        if (!formData.ic_address || !formData.ic_postcode || !formData.ic_city || !formData.ic_state) {
          setError('Please fill in all required IC address fields');
          return false;
        }
        if (!formData.same_as_ic_address && 
            (!formData.current_address || !formData.current_postcode || 
             !formData.current_city || !formData.current_state)) {
          setError('Please fill in all required current address fields');
          return false;
        }
        break;
        
      case 3: // Emergency Contact
        if (!formData.emergency_name || !formData.emergency_relationship || !formData.emergency_phone) {
          setError('Please fill in emergency contact information');
          return false;
        }
        break;
        
      case 4: // Education & Experience
        if (!formData.highest_education) {
          setError('Please select your highest education level');
          return false;
        }
        break;
        
      case 5: // Documents
        if (!files.passport_photo) {
          setError('Passport photo is required');
          return false;
        }
        if (!files.resume_pdf) {
          setError('Resume/CV is required');
          return false;
        }
        // Validate file sizes
        if (files.passport_photo.size > 2 * 1024 * 1024) {
          setError('Passport photo must be less than 2MB');
          return false;
        }
        if (files.resume_pdf.size > 5 * 1024 * 1024) {
          setError('Resume file must be less than 5MB');
          return false;
        }
        if (files.cover_letter_pdf && files.cover_letter_pdf.size > 5 * 1024 * 1024) {
          setError('Cover letter must be less than 5MB');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = new FormData();
      
      // Add career_posting_id
      submitData.append('career_posting_id', jobId.toString());
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value.toString());
        }
      });
      
      // Add files
      if (files.passport_photo) submitData.append('passport_photo', files.passport_photo);
      if (files.resume_pdf) submitData.append('resume_pdf', files.resume_pdf);
      if (files.cover_letter_pdf) submitData.append('cover_letter_pdf', files.cover_letter_pdf);
      
      const response = await fetch('/api/public/apply', {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }
      
      // Success
      if (onSuccess) onSuccess();
      alert(`Application submitted successfully! Your application number: ${result.application_no}`);
      
      // Notify admins (public → bell)
      try {
        const socket = getSocket();
        if (socket && socket.connected) {
          console.log('📤 Emitting task_submitted for job application:', result.application_no);
          socket.emit('task_submitted', {
            module: 'career',
            action: 'apply',
            entityId: result.application_no || null,
            message: `New job application ${result.application_no || ''} for ${jobTitle}`,
            view: 'applicants'
          });
          console.log('✅ Notification emitted successfully');
        } else {
          console.warn('⚠️ Socket not connected, notification not sent');
        }
      } catch (err) {
        console.error('❌ Error emitting notification:', err);
      }
      
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-between mb-4">
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} className="flex-fill text-center">
          <div 
            className={`rounded-circle mx-auto mb-2 ${currentStep >= step ? 'bg-primary' : 'bg-secondary'}`}
            style={{ 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            {step}
          </div>
          <small className={`${currentStep >= step ? 'text-primary fw-semibold' : 'text-muted'}`} style={{ fontSize: '10px' }}>
            {step === 1 && 'Personal'}
            {step === 2 && 'Address'}
            {step === 3 && 'Emergency'}
            {step === 4 && 'Education'}
            {step === 5 && 'Documents'}
          </small>
        </div>
      ))}
    </div>
  );

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title mb-1" style={{ fontSize: '14px' }}>Job Application</h5>
              <small className="text-muted" style={{ fontSize: '11px' }}>{jobTitle}</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {renderStepIndicator()}
            
            {error && (
              <div className="alert alert-danger" role="alert" style={{ fontSize: '11px' }}>
                <i className="bi bi-exclamation-triangle me-2"></i>{error}
              </div>
            )}
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <h6 className="mb-3 pb-2 border-bottom" style={{ fontSize: '12px' }}>Personal Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Full Name (as per IC) <span className="text-danger">*</span></label>
                    <input type="text" className="form-control form-control-sm" name="full_name" value={formData.full_name} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>IC Number <span className="text-danger">*</span></label>
                    <input type="text" className="form-control form-control-sm" name="ic_number" value={formData.ic_number} onChange={handleInputChange} placeholder="e.g., 900101011234" style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control form-control-sm" name="email" value={formData.email} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Phone Number <span className="text-danger">*</span></label>
                    <input type="tel" className="form-control form-control-sm" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="e.g., 0123456789" style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Alternative Phone</label>
                    <input type="tel" className="form-control form-control-sm" name="alt_phone_number" value={formData.alt_phone_number} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Date of Birth <span className="text-danger">*</span></label>
                    <input type="date" className="form-control form-control-sm" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Gender <span className="text-danger">*</span></label>
                    <select className="form-select form-select-sm" name="gender" value={formData.gender} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Nationality</label>
                    <input type="text" className="form-control form-control-sm" name="nationality" value={formData.nationality} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Religion</label>
                    <input type="text" className="form-control form-control-sm" name="religion" value={formData.religion} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Marital Status</label>
                    <select className="form-select form-select-sm" name="marital_status" value={formData.marital_status} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div>
                <h6 className="mb-3 pb-2 border-bottom" style={{ fontSize: '12px' }}>Address Information</h6>
                
                <div className="mb-4">
                  <h6 className="small text-primary mb-3" style={{ fontSize: '11px' }}>Address as per IC</h6>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Full Address <span className="text-danger">*</span></label>
                      <textarea className="form-control form-control-sm" name="ic_address" value={formData.ic_address} onChange={handleInputChange} rows={2} style={{ fontSize: '11px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Postcode <span className="text-danger">*</span></label>
                      <input type="text" className="form-control form-control-sm" name="ic_postcode" value={formData.ic_postcode} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small" style={{ fontSize: '11px' }}>City <span className="text-danger">*</span></label>
                      <input type="text" className="form-control form-control-sm" name="ic_city" value={formData.ic_city} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small" style={{ fontSize: '11px' }}>State <span className="text-danger">*</span></label>
                      <select className="form-select form-select-sm" name="ic_state" value={formData.ic_state} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                        <option value="">Select</option>
                        {malaysianStates.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small" style={{ fontSize: '11px' }}>Country</label>
                      <input type="text" className="form-control form-control-sm" name="ic_country" value={formData.ic_country} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                    </div>
                  </div>
                </div>
                
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" name="same_as_ic_address" checked={formData.same_as_ic_address} onChange={handleInputChange} id="sameAsIC" />
                  <label className="form-check-label small" htmlFor="sameAsIC" style={{ fontSize: '11px' }}>Current address same as IC address</label>
                </div>
                
                {!formData.same_as_ic_address && (
                  <div>
                    <h6 className="small text-primary mb-3" style={{ fontSize: '11px' }}>Current Address</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small" style={{ fontSize: '11px' }}>Full Address <span className="text-danger">*</span></label>
                        <textarea className="form-control form-control-sm" name="current_address" value={formData.current_address} onChange={handleInputChange} rows={2} style={{ fontSize: '11px' }} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small" style={{ fontSize: '11px' }}>Postcode <span className="text-danger">*</span></label>
                        <input type="text" className="form-control form-control-sm" name="current_postcode" value={formData.current_postcode} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small" style={{ fontSize: '11px' }}>City <span className="text-danger">*</span></label>
                        <input type="text" className="form-control form-control-sm" name="current_city" value={formData.current_city} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small" style={{ fontSize: '11px' }}>State <span className="text-danger">*</span></label>
                        <select className="form-select form-select-sm" name="current_state" value={formData.current_state} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                          <option value="">Select</option>
                          {malaysianStates.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small" style={{ fontSize: '11px' }}>Country</label>
                        <input type="text" className="form-control form-control-sm" name="current_country" value={formData.current_country} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Emergency Contact */}
            {currentStep === 3 && (
              <div>
                <h6 className="mb-3 pb-2 border-bottom" style={{ fontSize: '12px' }}>Emergency Contact</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control form-control-sm" name="emergency_name" value={formData.emergency_name} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Relationship <span className="text-danger">*</span></label>
                    <input type="text" className="form-control form-control-sm" name="emergency_relationship" value={formData.emergency_relationship} onChange={handleInputChange} placeholder="e.g., Spouse, Parent" style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Phone <span className="text-danger">*</span></label>
                    <input type="tel" className="form-control form-control-sm" name="emergency_phone" value={formData.emergency_phone} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Email</label>
                    <input type="email" className="form-control form-control-sm" name="emergency_email" value={formData.emergency_email} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Address</label>
                    <textarea className="form-control form-control-sm" name="emergency_address" value={formData.emergency_address} onChange={handleInputChange} rows={2} style={{ fontSize: '11px' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Education & Experience */}
            {currentStep === 4 && (
              <div>
                <h6 className="mb-3 pb-2 border-bottom" style={{ fontSize: '12px' }}>Education & Experience</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Highest Education <span className="text-danger">*</span></label>
                    <select className="form-select form-select-sm" name="highest_education" value={formData.highest_education} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                      <option value="">Select</option>
                      <option value="SPM">SPM</option>
                      <option value="STPM">STPM</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                      <option value="Master's Degree">Master&apos;s Degree</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Field of Study</label>
                    <input type="text" className="form-control form-control-sm" name="field_of_study" value={formData.field_of_study} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Years of Experience</label>
                    <input type="number" className="form-control form-control-sm" name="years_of_experience" value={formData.years_of_experience} onChange={handleInputChange} min="0" style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Current/Last Position</label>
                    <input type="text" className="form-control form-control-sm" name="current_position" value={formData.current_position} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Current/Last Employer</label>
                    <input type="text" className="form-control form-control-sm" name="current_employer" value={formData.current_employer} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Expected Salary (RM)</label>
                    <input type="text" className="form-control form-control-sm" name="expected_salary" value={formData.expected_salary} onChange={handleInputChange} placeholder="e.g., 5000" style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Notice Period</label>
                    <select className="form-select form-select-sm" name="notice_period" value={formData.notice_period} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                      <option value="">Select</option>
                      <option value="Immediate">Immediate</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Available Start Date</label>
                    <input type="date" className="form-control form-control-sm" name="available_start_date" value={formData.available_start_date} onChange={handleInputChange} style={{ fontSize: '11px' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>How did you hear about us?</label>
                    <select className="form-select form-select-sm" name="how_did_you_hear" value={formData.how_did_you_hear} onChange={handleInputChange} style={{ fontSize: '11px' }}>
                      <option value="">Select</option>
                      <option value="Company Website">Company Website</option>
                      <option value="Job Portal">Job Portal</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Cover Message</label>
                    <textarea className="form-control form-control-sm" name="cover_message" value={formData.cover_message} onChange={handleInputChange} rows={4} placeholder="Tell us why you're interested in this position..." style={{ fontSize: '11px' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div>
                <h6 className="mb-3 pb-2 border-bottom" style={{ fontSize: '12px' }}>Upload Documents</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Passport Photo <span className="text-danger">*</span> <span className="text-muted">(Max 2MB, JPG/PNG)</span></label>
                    <input type="file" className="form-control form-control-sm" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleFileChange(e, 'passport_photo')} style={{ fontSize: '11px' }} />
                    {files.passport_photo && <small className="text-success d-block mt-1" style={{ fontSize: '10px' }}><i className="bi bi-check-circle me-1"></i>{files.passport_photo.name}</small>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Resume/CV <span className="text-danger">*</span> <span className="text-muted">(Max 5MB, PDF)</span></label>
                    <input type="file" className="form-control form-control-sm" accept=".pdf" onChange={(e) => handleFileChange(e, 'resume_pdf')} style={{ fontSize: '11px' }} />
                    {files.resume_pdf && <small className="text-success d-block mt-1" style={{ fontSize: '10px' }}><i className="bi bi-check-circle me-1"></i>{files.resume_pdf.name}</small>}
                  </div>
                  <div className="col-12">
                    <label className="form-label small" style={{ fontSize: '11px' }}>Cover Letter <span className="text-muted">(Optional, Max 5MB, PDF)</span></label>
                    <input type="file" className="form-control form-control-sm" accept=".pdf" onChange={(e) => handleFileChange(e, 'cover_letter_pdf')} style={{ fontSize: '11px' }} />
                    {files.cover_letter_pdf && <small className="text-success d-block mt-1" style={{ fontSize: '10px' }}><i className="bi bi-check-circle me-1"></i>{files.cover_letter_pdf.name}</small>}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <div className="d-flex justify-content-between w-100">
              <div>
                {currentStep > 1 && (
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handlePrevious} disabled={loading} style={{ fontSize: '11px' }}>
                    <i className="bi bi-arrow-left me-2"></i>Previous
                  </button>
                )}
              </div>
              <div>
                <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={onClose} disabled={loading} style={{ fontSize: '11px' }}>Cancel</button>
                {currentStep < 5 ? (
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleNext} style={{ fontSize: '11px' }}>
                    Next<i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button type="button" className="btn btn-success btn-sm" onClick={handleSubmit} disabled={loading} style={{ fontSize: '11px' }}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
