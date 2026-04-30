'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminTableActions, actionPresets } from '@/components/admin/AdminTableActions';
import Pagination from '@/components/Pagination';

interface OvertimeSummary {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  month: string;
  month_display: string;
  total_applications: number;
  total_hours: number;
  total_amount: number;
  status_breakdown: {
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    cancelled: number;
  };
  date_range: {
    earliest: string;
    latest: string;
  };
}

interface Stats {
  total_applications: number;
  total_employees: number;
  total_hours: number;
  total_amount: number;
  pending_count: number;
  pending_amount: number;
}

interface OvertimeManagementProps {
  sessionHash: string;
  onViewDetails: (employeeId: number, month: string) => void;
}

export default function OvertimeManagement({ sessionHash, onViewDetails }: OvertimeManagementProps) {
  const { canPerformAction } = usePermissions(sessionHash);
  
  const [summaries, setSummaries] = useState<OvertimeSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchSummary();
  }, [filterMonth, filterStatus]);

  const fetchSummary = async () => {
      try {
        setLoading(true);
      const params = new URLSearchParams({
        month: filterMonth,
        status: filterStatus
      });
      
      const res = await fetch(`/api/admin/overtime/summary?hash=${sessionHash}&${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setSummaries(data.summaries || []);
        let nextStats = data.stats || null;
        try {
          const countsRes = await fetch(`/api/admin/tasks/counts?hash=${sessionHash}`, { cache: 'no-store' as any });
          if (countsRes.ok) {
            const counts = await countsRes.json();
            if (nextStats) {
              nextStats = { ...nextStats, pending_count: Number(counts?.overtime || nextStats.pending_count) };
            }
          }
        } catch {}
        setStats(nextStats);
      } else {
        alert(data.error || 'Failed to fetch overtime summary');
        }
      } catch (error) {
      console.error('Error fetching summary:', error);
      alert('Failed to fetch overtime summary');
      } finally {
        setLoading(false);
      }
    };

  // Filter summaries based on search
  const filteredSummaries = useMemo(() => {
    return summaries.filter(summary => {
      const matchesSearch = searchQuery === '' || 
        summary.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [summaries, searchQuery]);

  // Paginated data
  const paginatedSummaries = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredSummaries.slice(startIndex, startIndex + pageSize);
  }, [filteredSummaries, page, pageSize]);

  const totalPages = Math.ceil(filteredSummaries.length / pageSize);

  // Generate month options (last 12 months + next 3 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = -12; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleViewDetails = (summary: OvertimeSummary) => {
    onViewDetails(summary.employee_id, summary.month);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const getStatusBadge = (summary: OvertimeSummary) => {
    const { pending, approved, rejected, paid, cancelled } = summary.status_breakdown;
    const total = summary.total_applications;

    if (paid === total) {
      return <span className="badge bg-success">All Paid</span>;
    }
    if (approved === total) {
      return <span className="badge bg-info">All Approved</span>;
    }
    if (rejected === total) {
      return <span className="badge bg-danger">All Rejected</span>;
    }
    if (pending > 0) {
      return <span className="badge bg-warning text-dark">{pending} Pending</span>;
    }
    return <span className="badge bg-secondary">Mixed</span>;
  };

  const tableColumns: AdminTableColumn<OvertimeSummary>[] = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (_: unknown, row: OvertimeSummary) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '12px' }}>{row.employee_name}</div>
          <div style={{ fontSize: '11px', color: '#6c757d' }}>{row.employee_code}</div>
        </div>
      )
    },
    {
      key: 'month_display',
      label: 'Month',
      render: (_: unknown, row: OvertimeSummary) => <span style={{ fontSize: '12px' }}>{row.month_display}</span>
    },
    {
      key: 'total_applications',
      label: 'Total OT',
      render: (_: unknown, row: OvertimeSummary) => (
        <div style={{ textAlign: 'center' }}>
      <span style={{
            fontSize: '14px', 
            fontWeight: 600,
            padding: '4px 12px',
            background: '#e3f2fd',
            borderRadius: '4px',
            color: '#1976d2'
          }}>
            {row.total_applications}
          </span>
        </div>
      )
    },
    {
      key: 'total_hours',
      label: 'Total Hours',
      render: (_: unknown, row: OvertimeSummary) => (
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {formatHours(row.total_hours)}
        </span>
      )
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (_: unknown, row: OvertimeSummary) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2e7d32' }}>
          {formatCurrency(row.total_amount)}
      </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: OvertimeSummary) => getStatusBadge(row)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: OvertimeSummary) => (
        <AdminTableActions
          actions={[
            actionPresets.view(() => handleViewDetails(row))
          ]}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Overtime Management
        </h4>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            border: '1px solid #e0e0e0',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Applications</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.total_applications}</div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            border: '1px solid #e0e0e0',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Employees</div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>{stats.total_employees}</div>
                    </div>
                      <div style={{ 
            padding: '16px', 
            background: '#fff', 
            border: '1px solid #e0e0e0',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Hours</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#1976d2' }}>
              {formatHours(stats.total_hours)}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#fff', 
            border: '1px solid #e0e0e0',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Total Amount</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#2e7d32' }}>
              {formatCurrency(stats.total_amount)}
                    </div>
                  </div>
                    <div style={{ 
            padding: '16px', 
            background: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '11px', color: '#856404', marginBottom: '4px' }}>Pending</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#856404' }}>
              {stats.pending_count} ({formatCurrency(stats.pending_amount)})
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by employee name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: '2px',
            fontSize: '12px'
          }}
        />
                    <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: '2px',
            fontSize: '12px'
          }}
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
                    </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: '2px',
            fontSize: '12px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
                  <button
          onClick={fetchSummary}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
                  </button>
                </div>

      {/* Table */}
      {filteredSummaries.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '2px'
        }}>
          <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
          <p style={{ marginTop: '16px', color: '#666' }}>
            No overtime records found for selected filters
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            columns={tableColumns}
            data={paginatedSummaries}
          />
          
          {totalPages > 1 && (
            <div style={{ marginTop: '20px' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
