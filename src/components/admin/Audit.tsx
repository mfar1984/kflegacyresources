'use client';

import { useState, useEffect } from 'react';
import styles from './OrdersManagement.module.css';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

interface Session {
  id: number;
  user: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  created_at: string;
  status: 'active' | 'expired';
}

interface ErrorLog {
  id: number;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  stack_trace: string;
}

export default function Audit() {
  const [activeTab, setActiveTab] = useState<'logs' | 'sessions' | 'errors'>('logs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [errorLevelFilter, setErrorLevelFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'sessions') {
      fetchSessions();
    } else if (activeTab === 'errors') {
      fetchErrorLogs();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // TODO: API call
      
      // Mock data
      const mockLogs: AuditLog[] = [
        {
          id: 1,
          user: 'admin',
          action: 'Login',
          resource: 'Authentication',
          details: 'Successful login',
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15 10:30:00',
        },
        {
          id: 2,
          user: 'admin',
          action: 'Update',
          resource: 'Product #123',
          details: 'Updated product price',
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15 10:25:00',
        },
        {
          id: 3,
          user: 'admin',
          action: 'Create',
          resource: 'Order #456',
          details: 'Created new order',
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15 10:20:00',
        },
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // TODO: API call
      
      // Mock data
      const mockSessions: Session[] = [
        {
          id: 1,
          user: 'admin',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          last_activity: '2024-01-15 10:30:00',
          created_at: '2024-01-15 09:00:00',
          status: 'active',
        },
        {
          id: 2,
          user: 'editor',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
          last_activity: '2024-01-14 18:45:00',
          created_at: '2024-01-14 08:00:00',
          status: 'expired',
        },
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      // TODO: API call
      
      // Mock data
      const mockErrorLogs: ErrorLog[] = [
        {
          id: 1,
          timestamp: '2024-01-15 10:35:00',
          level: 'error',
          message: 'Database connection failed',
          file: '/src/lib/database.ts',
          line: 45,
          stack_trace: 'Error: Connection timeout\n  at Database.connect (/src/lib/database.ts:45:10)',
        },
        {
          id: 2,
          timestamp: '2024-01-15 10:30:00',
          level: 'warning',
          message: 'Deprecated API endpoint used',
          file: '/src/pages/api/legacy.ts',
          line: 12,
          stack_trace: 'Warning: /api/legacy is deprecated\n  at handler (/src/pages/api/legacy.ts:12:5)',
        },
        {
          id: 3,
          timestamp: '2024-01-15 10:25:00',
          level: 'info',
          message: 'Cache cleared successfully',
          file: '/src/lib/cache.ts',
          line: 78,
          stack_trace: 'Info: Cache cleared\n  at clearCache (/src/lib/cache.ts:78:3)',
        },
      ];
      
      setErrorLogs(mockErrorLogs);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;
    
    try {
      // TODO: API call
      alert('Terminate session functionality - Coming soon');
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const getActionBadge = (action: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      Login: { bg: '#d1fae5', text: '#065f46' },
      Logout: { bg: '#e5e7eb', text: '#374151' },
      Create: { bg: '#dbeafe', text: '#1e40af' },
      Update: { bg: '#fef3c7', text: '#92400e' },
      Delete: { bg: '#fee2e2', text: '#991b1b' },
    };

    const { bg, text } = config[action] || { bg: '#e5e7eb', text: '#374151' };

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: text,
        }}
      >
        {action}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      active: { bg: '#d1fae5', text: '#065f46' },
      expired: { bg: '#e5e7eb', text: '#374151' },
    };

    const { bg, text } = config[status] || config.active;

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: text,
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading && (logs.length === 0 && sessions.length === 0)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading audit data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Container Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                Audit
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Monitor system activity and user sessions
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'logs' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'logs' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-file-text me-2"></i>
                Logs
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveTab('sessions')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'sessions' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'sessions' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-clock-history me-2"></i>
                Sessions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'errors' ? 'active' : ''}`}
                onClick={() => setActiveTab('errors')}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === 'errors' ? '#3b82f6' : '#6b7280',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === 'errors' ? '2px solid #3b82f6' : 'none',
                  background: 'transparent',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Error Logs
              </button>
            </li>
          </ul>

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <>
              {/* Filter Section */}
              <form className="row g-3 mb-4">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setActionFilter('');
                      setDateFilter('');
                    }}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      borderColor: '#dc2626',
                      color: '#dc2626'
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* Logs Table */}
              <div className="overflow-x-auto shadow" style={{ 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'visible'
              }}>
                <table className="table mb-0" style={{ 
                  fontSize: '12px',
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>USER</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>ACTION</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>RESOURCE</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>DETAILS</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>IP ADDRESS</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                          No audit logs found
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr 
                          key={log.id} 
                          style={{ backgroundColor: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                              {log.user}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {getActionBadge(log.action)}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {log.resource}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {log.details}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontFamily: 'monospace' }}>
                              {log.ip_address}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <>
              {/* Filter Section */}
              <form className="row g-3 mb-4">
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => setSearchTerm('')}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      borderColor: '#dc2626',
                      color: '#dc2626'
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* Sessions Table */}
              <div className="overflow-x-auto shadow" style={{ 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'visible'
              }}>
                <table className="table mb-0" style={{ 
                  fontSize: '12px',
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>USER</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>IP ADDRESS</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>USER AGENT</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>LAST ACTIVITY</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db'
                      }}>STATUS</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db',
                        width: '100px'
                      }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                          No active sessions found
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr 
                          key={session.id} 
                          style={{ backgroundColor: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>
                              {session.user}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontFamily: 'monospace' }}>
                              {session.ip_address}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {session.user_agent}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                              {new Date(session.last_activity).toLocaleString()}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {getStatusBadge(session.status)}
                            </div>
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.actionsContainer}>
                              <button
                                onClick={() => handleTerminateSession(session.id)}
                                className={styles.actionButton}
                                style={{ color: '#dc2626' }}
                                title="Terminate Session"
                                disabled={session.status === 'expired'}
                              >
                                <span className={`material-symbols-outlined ${styles.actionIcon}`}>
                                  block
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Error Logs Tab */}
          {activeTab === 'errors' && (
            <>
              {/* Filter Section */}
              <form className="row g-3 mb-4">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search error logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={errorLevelFilter}
                    onChange={(e) => setErrorLevelFilter(e.target.value)}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setErrorLevelFilter('');
                    }}
                    style={{ 
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      borderColor: '#dc2626',
                      color: '#dc2626'
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>

              {/* Error Logs Table */}
              <div className="overflow-x-auto shadow" style={{ 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'visible'
              }}>
                <table className="table mb-0" style={{ 
                  fontSize: '12px',
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db',
                        width: '150px'
                      }}>TIMESTAMP</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db',
                        width: '100px'
                      }}>LEVEL</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db'
                      }}>MESSAGE</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        borderBottom: '1px solid #d1d5db',
                        width: '200px'
                      }}>FILE</th>
                      <th scope="col" style={{ 
                        padding: '12px 24px',
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        borderBottom: '1px solid #d1d5db',
                        width: '80px'
                      }}>LINE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#ffffff' }}>
                          No error logs found
                        </td>
                      </tr>
                    ) : (
                      errorLogs.map((log) => (
                        <tr 
                          key={log.id} 
                          style={{ backgroundColor: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: log.level === 'error' ? '#fee2e2' : log.level === 'warning' ? '#fef3c7' : '#dbeafe',
                                  color: log.level === 'error' ? '#991b1b' : log.level === 'warning' ? '#92400e' : '#1e40af',
                                }}
                              >
                                {log.level.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '12px', color: '#1f2937', fontWeight: 500 }}>
                              {log.message}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                              {log.file}
                            </div>
                          </td>
                          <td style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontFamily: 'monospace' }}>
                              {log.line}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
