"use client";

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

type Ticket = {
  id: number;
  ticket_no: string;
  subject: string;
  category: string;
  priority: 'Low'|'Medium'|'High'|'Urgent';
  status: string;
  description: string;
  attachments: string[];
  created_at: string;
  ip_address?: string;
};

type Reply = {
  id: number;
  replied_by_type: string;
  replied_by_name: string;
  replied_by_email: string;
  message: string;
  attachments: string[];
  created_at: string;
  ip_address?: string;
};

// Helper function to format date with day name (WITHOUT IP for client view)
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  
  return `${dayName}, ${formattedDate} - ${formattedTime}`;
}

export default function ClientHelpdesk({ hash }: { hash: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyFiles, setReplyFiles] = useState<FileList | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Hardware Issues');
  const [newPriority, setNewPriority] = useState<'Low'|'Medium'|'High'|'Urgent'>('Low');
  const [newDescription, setNewDescription] = useState('');
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  useEffect(() => { fetchTickets(); }, [hash]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await fetch(`/api/client/tickets?hash=${hash}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load tickets');
      setTickets((data.tickets || []) as Ticket[]);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openTicket(ticket: Ticket) {
    try {
      const res = await fetch(`/api/client/tickets/${ticket.id}?hash=${hash}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load ticket');
      setSelected(data.ticket as Ticket);
      setReplies((data.replies || []) as Reply[]);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !replyMsg.trim() || isSendingReply) return;
    
    setIsSendingReply(true);
    const form = new FormData();
    form.append('message', replyMsg);
    
    // Append attachments if any
    if (replyFiles) {
      for (let i = 0; i < replyFiles.length; i++) {
        form.append('attachments', replyFiles[i]);
      }
    }
    
    try {
      const res = await fetch(`/api/client/tickets/${selected.id}?hash=${hash}`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send reply');
      
      // Emit Socket.IO event for real-time notification
      const socket = getSocket();
      socket.emit('new_reply', {
        ticketNo: selected.ticket_no,
        ticketId: selected.id,
        repliedByType: 'client',
        company: 'Client', // You can get actual company name from ticket data
        clientId: selected.id
      });
      
      setReplyMsg('');
      setReplyFiles(null);
      await openTicket(selected);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSendingReply(false);
    }
  }

  const categories = [
    'Hardware Issues',
    'Software Issues',
    'Network & Connectivity',
    'System Performance',
    'Security & Access',
    'Billing & Payments',
    'General Inquiry',
    'Bug Report',
    'Feature Request',
    'Project Support',
  ];

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim() || isCreatingTicket) {
      if (!isCreatingTicket) alert('Please fill all required fields');
      return;
    }
    
    setIsCreatingTicket(true);
    const form = new FormData();
    form.append('subject', newSubject);
    form.append('category', newCategory);
    form.append('priority', newPriority);
    form.append('description', newDescription);
    if (newFiles && newFiles.length > 0) {
      Array.from(newFiles).forEach(f => form.append('attachments', f));
    }
    try {
      const res = await fetch(`/api/client/tickets?hash=${hash}`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create ticket');
      setShowNew(false);
      setNewSubject('');
      setNewCategory('Hardware Issues');
      setNewPriority('Low');
      setNewDescription('');
      setNewFiles(null);
      await fetchTickets();
      alert('Ticket created successfully');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsCreatingTicket(false);
    }
  }

  if (loading) return (
    <div className="text-center py-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
  );
  if (error) return (<div className="alert alert-danger">{error}</div>);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{ fontSize: 16, margin: 0 }}><i className="bi bi-headset me-2"></i>My Tickets</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setShowNew(true)} style={{ fontSize: 12 }}>
            <i className="bi bi-plus-circle me-2"></i>New Ticket
          </button>
          <button className="btn btn-primary btn-sm" onClick={fetchTickets} style={{ fontSize: 12 }}>
            <i className="bi bi-arrow-clockwise me-2"></i>Refresh
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Ticket</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Subject</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Category</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Priority</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Status</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase' }}>Created</th>
              <th style={{ fontSize: 11, textTransform: 'uppercase', textAlign: 'center', width: 100 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted">No tickets</td></tr>
            ) : tickets.map(t => (
              <tr key={t.id}>
                <td style={{ fontSize: 12, fontWeight: 600 }}>{t.ticket_no}</td>
                <td style={{ fontSize: 12 }}>{t.subject}</td>
                <td style={{ fontSize: 12 }}>{t.category}</td>
                <td style={{ fontSize: 12 }}>{t.priority}</td>
                <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{t.status.replace('_',' ')}</td>
                <td style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-MY')}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => openTicket(t)}
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: '4px 6px'
                    }}
                    title="View Details"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      visibility
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Ticket {selected.ticket_no}</h5>
                <button type="button" className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body" style={{ fontSize: 12 }}>
                <div className="mb-3">
                  <strong>Subject:</strong> {selected.subject}
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <div className="mt-1 p-2" style={{ background: '#f9fafb' }}>{selected.description}</div>
                </div>
                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="mb-3">
                    <strong>Attachments:</strong>
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {selected.attachments.map((file, idx) => (
                        <a key={idx} href={`/uploads/helpdesk/${file}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: 11 }}>
                          <i className="bi bi-paperclip me-1"></i>{file}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <strong>Conversation</strong>
                  <div className="mt-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {replies.length === 0 ? (
                      <p className="text-muted mb-0">No replies yet</p>
                    ) : replies.map(r => (
                      <div key={r.id} className="mb-2 p-2" style={{ background: r.replied_by_type==='client'? '#f0f9ff':'#f0fdf4', borderLeft: `3px solid ${r.replied_by_type==='client'?'#3b82f6':'#10b981'}` }}>
                        <div className="d-flex justify-content-between"><strong>{r.replied_by_name}</strong><small style={{ fontSize: 10 }}>{formatDateTime(r.created_at)}</small></div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>
                        {r.attachments && r.attachments.length > 0 && (
                          <div className="mt-2 d-flex flex-wrap gap-2">
                            {r.attachments.map((file, idx) => (
                              <a key={idx} href={`/uploads/helpdesk/${file}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary" style={{ fontSize: 10 }}>
                                <i className="bi bi-paperclip me-1"></i>{file}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={sendReply}>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 12 }}>Reply</label>
                    <textarea className="form-control" rows={4} value={replyMsg} onChange={e=>setReplyMsg(e.target.value)} required style={{ fontSize: 12 }} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 12 }}>Attachments (Optional)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      multiple 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" 
                      onChange={e=>setReplyFiles(e.target.files)} 
                      style={{ fontSize: 11 }} 
                    />
                    <small className="text-muted" style={{ fontSize: 10 }}>Max 10MB per file</small>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setSelected(null)} disabled={isSendingReply} style={{ fontSize: 11 }}>Close</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isSendingReply} style={{ fontSize: 11 }}>
                      {isSendingReply ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-1"></i>
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: 2 }}>
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontSize: 14 }}>Create New Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setShowNew(false)}></button>
              </div>
              <form onSubmit={createTicket}>
                <div className="modal-body" style={{ fontSize: 12 }}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontSize: 12 }}>Subject *</label>
                    <input type="text" className="form-control" value={newSubject} onChange={e=>setNewSubject(e.target.value)} required style={{ fontSize: 12 }} />
                  </div>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: 12 }}>Category *</label>
                      <select className="form-select form-select-sm" value={newCategory} onChange={e=>setNewCategory(e.target.value)} style={{ fontSize: 12 }}>
                        {categories.map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: 12 }}>Priority *</label>
                      <select className="form-select form-select-sm" value={newPriority} onChange={e=>setNewPriority(e.target.value as any)} style={{ fontSize: 12 }}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3 mt-2">
                    <label className="form-label" style={{ fontSize: 12 }}>Description *</label>
                    <textarea className="form-control" rows={5} value={newDescription} onChange={e=>setNewDescription(e.target.value)} required style={{ fontSize: 12 }} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontSize: 12 }}>Attachments</label>
                    <input type="file" multiple className="form-control" onChange={e=>setNewFiles(e.target.files)} style={{ fontSize: 12 }} />
                    <small className="text-muted" style={{ fontSize: 10 }}>Max 10MB per file</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setShowNew(false)} disabled={isCreatingTicket} style={{ fontSize: 11 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isCreatingTicket} style={{ fontSize: 11 }}>
                    {isCreatingTicket ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-1"></i>
                        Create Ticket
                      </>
                    )}
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


