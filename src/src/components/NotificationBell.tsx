"use client";

import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  view?: string | null;
  ticketNo?: string;
  ticketId?: number;
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  sessionHash: string;
  userType: 'admin' | 'client' | 'employee';
  userId: number;
}

export default function NotificationBell({ sessionHash, userType, userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const socket = getSocket();

    // Function to join room
    const joinRoom = () => {
      if (socket && socket.connected && sessionHash && userId) {
        console.log(`🔌 Joining room as ${userType} (ID: ${userId})`);
        socket.emit('join', { sessionHash, userType, userId });
      } else {
        console.warn('⚠️ Socket not ready, will retry:', { connected: socket?.connected, sessionHash: !!sessionHash, userId });
      }
    };

    // Join immediately if socket is connected
    if (socket.connected) {
      joinRoom();
    } else {
      // Wait for socket to connect
      socket.on('connect', () => {
        console.log('✅ Socket connected, joining room...');
        joinRoom();
      });
    }

    // Listen for join confirmation
    socket.on('joined', (data) => {
      if (data.success) {
        console.log('✅ Successfully joined room');
      } else {
        console.error('❌ Failed to join room:', data.reason);
        // Retry after 1 second if failed
        setTimeout(() => {
          if (socket.connected) {
            console.log('🔄 Retrying join room...');
            joinRoom();
          }
        }, 1000);
      }
    });

    // Listen for notifications
    socket.on('notification', (data) => {
      console.log('🔔 New notification received:', data);
      
      const newNotification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type,
        message: data.message,
        link: data.link,
        view: data.view,
        ticketNo: data.ticketNo,
        ticketId: data.ticketId,
        timestamp: data.timestamp,
        read: false
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20

      // Play notification sound
      if (playSound && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Sound play failed:', e));
      }
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.off('notification');
      socket.off('joined');
      socket.off('connect');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sessionHash, userType, userId, playSound]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const navigateTo = (n: Notification) => {
    if (n.view) {
      window.dispatchEvent(new CustomEvent('navigate_to_view', { detail: n.view }));
    } else if (n.link) {
      if (n.link.startsWith('#')) {
        window.location.hash = n.link;
      } else {
        window.location.href = n.link;
      }
    }
    setShowDropdown(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_ticket': return '🎫';
      case 'admin_reply': return '💬';
      case 'client_reply': return '📨';
      case 'status_change': return '🔄';
      case 'ticket_assigned': return '👨‍💼';
      case 'task_submitted': return '📝';
      case 'task_reviewed': return '✅';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Sound */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Bell Icon */}
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '24px',
            color: '#374151',
            borderRadius: '6px',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '6px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 600,
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '380px',
            maxHeight: '500px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            zIndex: 9999,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9fafb'
            }}>
              <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                Notifications ({unreadCount})
              </h6>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  <i className="bi bi-bell-slash" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                  No notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => { markAsRead(notif.id); navigateTo(notif); }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: notif.read ? 'white' : '#eff6ff',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'white' : '#eff6ff'}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{getNotificationIcon(notif.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#111827',
                          fontWeight: notif.read ? 400 : 600,
                          lineHeight: '1.4'
                        }}>
                          {notif.message}
                        </p>
                        {notif.ticketNo && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {notif.ticketNo}
                          </span>
                        )}
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '10px',
                          color: '#9ca3af'
                        }}>
                          {formatTime(notif.timestamp)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          flexShrink: 0,
                          marginTop: '4px'
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={playSound}
                  onChange={(e) => setPlaySound(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                <span style={{ color: '#6b7280' }}>Sound notifications</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

