"use client";

import { useState, useEffect, useMemo } from 'react';
import { getSocket } from '@/lib/socket';
import { usePermissions } from '@/hooks/usePermissions';

interface HelpdeskTicket {
  id: number;
  ticket_no: string;
  client_id: number;
  company_name: string;
  contact_person: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  attachments: string[];
  assigned_to: number | null;
  assigned_to_email: string | null;
  assigned_user_name: string | null;
  created_at: string;
  updated_at: string;
  ip_address?: string;
}

interface HelpdeskReply {
  id: number;
  ticket_id: number;
  replied_by_type: string;
  replied_by_name: string;
  replied_by_email: string;
  message: string;
  attachments: string[];
  is_internal_note: number;
  created_at: string;
  ip_address?: string;
}

// Helper function to format date with day name and IP
function formatDateTimeWithIP(dateString: string, ipAddress?: string): string {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  
  return `${dayName}, ${formattedDate} - ${formattedTime}${ipAddress ? ` - ${ipAddress}` : ''}`;
}

interface HelpdeskManagementProps {
  hash: string;
}

export default function HelpdeskManagement({ hash }: HelpdeskManagementProps) {
  const { canPerformAction } = usePermissions(hash);
  
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [replies, setReplies] = useState<HelpdeskReply[]>([]);
  
  // Form states
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [assignToEmail, setAssignToEmail] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [hash]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/helpdesk?hash=${hash}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
      }
      
      setTickets(data.tickets || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: HelpdeskTicket) => {
    try {
      const response = await fetch(`/api/admin/helpdesk/${ticket.id}?hash=${hash}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ticket details');
      }
      
      setSelectedTicket(data.ticket);
      setReplies(data.replies || []);
      setShowViewModal(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const formData = new FormData();
      formData.append('message', replyMessage);
      formData.append('is_internal_note', isInternalNote ? 'true' : 'false');
      
      // Append attachments
      replyAttachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(`/api/admin/helpdesk/${selectedTicket.id}?hash=${hash}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reply');
      }

      // Emit Socket.IO event for real-time notification
      const socket = getSocket();
      socket.emit('new_reply', {
        ticketNo: selectedTicket.ticket_no,
        ticketId: selectedTicket.id,
        repliedByType: 'admin',
        company: selectedTicket.company_name,
        clientId: selectedTicket.client_id
      });

      alert('Reply sent successfully!');
      setReplyMessage('');
      setIsInternalNote(false);
      setReplyAttachments([]);
      setShowReplyModal(false);
      handleViewTicket(selectedTicket);
      fetchTickets();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`/api/admin/helpdesk/${ticketId}?hash=${hash}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      alert('Status updated successfully!');
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        handleViewTicket(selectedTicket);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssignTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !assignToEmail.trim()) return;

    try {
      const formData = new FormData();
      formData.append('assigned_to_email', assignToEmail);

      const response = await fetch(`/api/admin/helpdesk/${selectedTicket.id}?hash=${hash}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign ticket');
      }

      alert('Ticket assigned successfully!');
      setAssignToEmail('');
      setShowAssignModal(false);
      fetchTickets();
      if (selectedTicket) {
        handleViewTicket(selectedTicket);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`/api/admin/helpdesk/${ticketId}?hash=${hash}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete ticket');
      }

      alert('Ticket deleted successfully!');
      setShowViewModal(false);
      fetchTickets();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#fef3c7',
      'open': '#dbeafe',
      'in_progress': '#fed7aa',
      'waiting_client': '#fef3c7',
      'resolved': '#d1fae5',
      'closed': '#e5e7eb',
    };
    return colors[status] || '#f3f4f6';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Urgent': '#fee2e2',
      'High': '#fed7aa',
      'Medium': '#fef3c7',
      'Low': '#dbeafe',
    };
    return colors[priority] || '#f3f4f6';
  };

  const statusOptions = ['pending', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            <i className="bi bi-headset me-2"></i>
            Helpdesk Management
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
            Manage and respond to support tickets
          </p>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={fetchTickets}
          style={{ fontSize: '12px' }}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px' }}>Total Tickets</p>
                  <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: 600 }}>{tickets.length}</h5>
                </div>
                <i className="bi bi-ticket-detailed" style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px' }}>Open</p>
                  <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {tickets.filter(t => ['pending', 'open'].includes(t.status)).length}
                  </h5>
                </div>
                <i className="bi bi-clock-history" style={{ fontSize: '32px', color: '#f59e0b', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px' }}>Urgent</p>
                  <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {tickets.filter(t => t.priority === 'Urgent' && !['resolved', 'closed'].includes(t.status)).length}
                  </h5>
                </div>
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '32px', color: '#ef4444', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '11px' }}>Resolved</p>
                  <h5 className="mb-0" style={{ fontSize: '20px', fontWeight: 600 }}>
                    {tickets.filter(t => t.status === 'resolved').length}
                  </h5>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: '32px', color: '#10b981', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'visible',
        position: 'relative'
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <table className="table mb-0" style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Ticket No</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Subject</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Priority</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Assigned To</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
                <th style={{ padding: '12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', textAlign: 'center', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4" style={{ fontSize: '12px', color: '#6b7280' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', opacity: 0.3 }}></i>
                    <p className="mb-0 mt-2">No tickets found</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600 }}>
                      {ticket.ticket_no}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      <div>{ticket.company_name}</div>
                      <small className="text-muted" style={{ fontSize: '10px' }}>{ticket.contact_person}</small>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px' }}>
                      {ticket.category}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        backgroundColor: getPriorityBadgeColor(ticket.priority),
                        color: '#1f2937'
                      }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        backgroundColor: getStatusBadgeColor(ticket.status),
                        color: '#1f2937',
                        textTransform: 'capitalize'
                      }}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px' }}>
                      {ticket.assigned_user_name || <span className="text-muted">Unassigned</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px' }}>
                      {new Date(ticket.created_at).toLocaleDateString('en-MY')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {canPerformAction('helpdesk', 'view') && (
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          style={{ 
                            background: 'transparent',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            padding: '4px 6px'
                          }}
                          title="View Details"
                        >
                          <i className="bi bi-eye" style={{ fontSize: '16px' }}></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: '1200px' }}>
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '16px 20px' }}>
                <div>
                  <h5 className="modal-title mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                    Ticket Details - {selectedTicket.ticket_no}
                  </h5>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Created: {formatDateTimeWithIP(selectedTicket.created_at, selectedTicket.ip_address)}
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="row g-3">
                  {/* Left Column */}
                  <div className="col-lg-8">
                    {/* Ticket Info */}
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-info-circle me-2"></i>Ticket Information
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Company</span>
                              <span style={{ fontWeight: 500 }}>{selectedTicket.company_name}</span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Contact Person</span>
                              <span style={{ fontWeight: 500 }}>{selectedTicket.contact_person}</span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Email</span>
                              <span style={{ fontWeight: 500 }}>{selectedTicket.client_email}</span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Phone</span>
                              <span style={{ fontWeight: 500 }}>{selectedTicket.client_phone}</span>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Subject</span>
                              <span style={{ fontWeight: 500 }}>{selectedTicket.subject}</span>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="d-flex flex-column">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Description</span>
                              <div className="mt-2 p-2" style={{ background: '#f9fafb', borderRadius: '4px' }}>
                                {selectedTicket.description}
                              </div>
                            </div>
                          </div>
                          {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                            <div className="col-12">
                              <div className="d-flex flex-column">
                                <span className="text-muted" style={{ fontSize: '10px', fontWeight: 500 }}>Attachments</span>
                                <div className="mt-2 d-flex flex-wrap gap-2">
                                  {selectedTicket.attachments.map((file, idx) => (
                                    <a key={idx} href={`/uploads/helpdesk/${file}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '11px' }}>
                                      <i className="bi bi-paperclip me-1"></i>{file}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Conversation Thread */}
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-chat-dots me-2"></i>Conversation ({replies.length})
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                        {replies.length === 0 ? (
                          <p className="text-muted text-center mb-0">No replies yet</p>
                        ) : (
                          replies.map((reply) => (
                            <div key={reply.id} className="mb-3 p-3" style={{
                              background: reply.replied_by_type === 'client' ? '#f0f9ff' : '#f0fdf4',
                              borderLeft: `3px solid ${reply.replied_by_type === 'client' ? '#3b82f6' : '#10b981'}`,
                              borderRadius: '4px'
                            }}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <strong>{reply.replied_by_name}</strong>
                                  {reply.is_internal_note === 1 && (
                                    <span className="badge bg-warning ms-2" style={{ fontSize: '9px' }}>Internal Note</span>
                                  )}
                                  <div className="text-muted" style={{ fontSize: '10px' }}>
                                    {formatDateTimeWithIP(reply.created_at, reply.ip_address)}
                                  </div>
                                </div>
                                <span className="badge" style={{
                                  fontSize: '9px',
                                  background: reply.replied_by_type === 'client' ? '#dbeafe' : '#d1fae5',
                                  color: '#1f2937'
                                }}>
                                  {reply.replied_by_type}
                                </span>
                              </div>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{reply.message}</div>
                              {reply.attachments && reply.attachments.length > 0 && (
                                <div className="mt-2 d-flex flex-wrap gap-2">
                                  {reply.attachments.map((file, idx) => (
                                    <a key={idx} href={`/uploads/helpdesk/${file}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: '10px' }}>
                                      <i className="bi bi-paperclip me-1"></i>{file}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-4">
                    {/* Status & Priority */}
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-gear me-2"></i>Status & Priority
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="mb-3">
                          <span className="text-muted d-block mb-1" style={{ fontSize: '10px', fontWeight: 500 }}>Status</span>
                          <select
                            className="form-select form-select-sm"
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                            style={{ fontSize: '11px' }}
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <span className="text-muted d-block mb-1" style={{ fontSize: '10px', fontWeight: 500 }}>Category</span>
                          <span style={{ fontWeight: 500 }}>{selectedTicket.category}</span>
                        </div>
                        <div>
                          <span className="text-muted d-block mb-1" style={{ fontSize: '10px', fontWeight: 500 }}>Priority</span>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            backgroundColor: getPriorityBadgeColor(selectedTicket.priority),
                            color: '#1f2937'
                          }}>
                            {selectedTicket.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Assignment */}
                    <div className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-person-check me-2"></i>Assignment
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        <div className="mb-2">
                          <strong>Assigned To:</strong>
                          <div className="mt-1">
                            {selectedTicket.assigned_user_name || <span className="text-muted">Unassigned</span>}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary w-100"
                          onClick={() => setShowAssignModal(true)}
                          style={{ fontSize: '11px' }}
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          {selectedTicket.assigned_user_name ? 'Reassign' : 'Assign'} Ticket
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <i className="bi bi-lightning me-2"></i>Quick Actions
                        </h6>
                      </div>
                      <div className="card-body" style={{ fontSize: '12px' }}>
                        {canPerformAction('helpdesk', 'reply') && (
                          <button
                            className="btn btn-primary btn-sm w-100 mb-2"
                            onClick={() => setShowReplyModal(true)}
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-reply me-2"></i>Reply to Client
                          </button>
                        )}
                        {canPerformAction('helpdesk', 'delete') && (
                          <button
                            className="btn btn-danger btn-sm w-100"
                            onClick={() => handleDeleteTicket(selectedTicket.id)}
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-trash me-2"></i>Delete Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                  onClick={() => setShowViewModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1051 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '14px' }}>Reply to Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setShowReplyModal(false)}></button>
              </div>
              <form onSubmit={handleReply}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Message *</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      style={{ fontSize: '12px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Attachments (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => setReplyAttachments(e.target.files ? Array.from(e.target.files) : [])}
                      style={{ fontSize: '11px' }}
                    />
                    <small className="text-muted" style={{ fontSize: '10px' }}>Max 10MB per file</small>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="internalNote"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="internalNote" style={{ fontSize: '11px' }}>
                      Internal Note (visible to admins only)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReplyModal(false)} disabled={isSendingReply} style={{ fontSize: '11px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSendingReply} style={{ fontSize: '11px' }}>
                    {isSendingReply ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1051 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: '14px' }}>Assign Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignTicket}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '12px' }}>Assign To Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={assignToEmail}
                      onChange={(e) => setAssignToEmail(e.target.value)}
                      placeholder="user@example.com"
                      style={{ fontSize: '12px' }}
                      required
                    />
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      User will receive email notification
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(false)} style={{ fontSize: '11px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '11px' }}>
                    <i className="bi bi-person-check me-2"></i>Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

