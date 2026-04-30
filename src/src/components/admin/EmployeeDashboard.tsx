'use client';

export default function EmployeeDashboard({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Employee Dashboard</h2>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body">
              <h6 style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Leave Balance</h6>
              <h3 style={{ fontSize: 24, fontWeight: 600 }}>14 Days</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body">
              <h6 style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Pending Claims</h6>
              <h3 style={{ fontSize: 24, fontWeight: 600 }}>2</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body">
              <h6 style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Overtime (This Month)</h6>
              <h3 style={{ fontSize: 24, fontWeight: 600 }}>8 Hours</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
            <div className="card-body">
              <h6 style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Pending Expenses</h6>
              <h3 style={{ fontSize: 24, fontWeight: 600 }}>1</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p style={{ fontSize: 12, color: '#6b7280' }}>Employee ID: {employeeId}</p>
      </div>
    </div>
  );
}

