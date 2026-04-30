'use client';
import { useState, useEffect } from 'react';

interface Profile {
  full_name: string;
  employee_id: string;
  email: string;
  phone_number: string;
  ic_number: string;
  gender: string;
  marital_status: string;
  address: string;
  department_name: string;
  position: string;
  employment_type: string;
  join_date: string;
  basic_salary: number;
}

export default function EmployeeProfile({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetch(`/api/employee/profile?hash=${sessionHash}&employee_id=${employeeId}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setProfile(data.profile))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [employeeId, sessionHash]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  if (!profile) return <div className="alert alert-warning">Profile not found</div>;

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="mb-3">
      <label style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
      <p style={{ fontSize: 12, color: '#1f2937', marginBottom: 0 }}>{value || '-'}</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Profile</h2>
        <div className="alert alert-info mb-0" style={{ fontSize: 11, padding: '8px 12px' }}>
          <i className="bi bi-info-circle me-1"></i>
          Profile is read-only. Contact HR to update your information.
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body" style={{ padding: 20 }}>
              <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Personal Information</h6>
              <InfoRow label="Full Name" value={profile.full_name} />
              <InfoRow label="Employee ID" value={profile.employee_id} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone" value={profile.phone_number} />
              <InfoRow label="IC Number" value={profile.ic_number} />
              <InfoRow label="Gender" value={profile.gender} />
              <InfoRow label="Marital Status" value={profile.marital_status} />
              <InfoRow label="Address" value={profile.address} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body" style={{ padding: 20 }}>
              <h6 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Employment Information</h6>
              <InfoRow label="Department" value={profile.department_name} />
              <InfoRow label="Position" value={profile.position} />
              <InfoRow label="Employment Type" value={profile.employment_type} />
              <InfoRow label="Join Date" value={profile.join_date ? new Date(profile.join_date).toLocaleDateString('en-MY') : '-'} />
              <InfoRow label="Basic Salary" value={`RM ${parseFloat(String(profile.basic_salary || 0)).toFixed(2)}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
