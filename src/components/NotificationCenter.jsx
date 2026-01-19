import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const resp = await apiClient.get('/notifications');
      setNotifications(resp.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`, { is_read: true });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          fontSize: '1.2rem',
          position: 'relative'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '0.6rem'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          width: '300px',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>No notifications yet.</p>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: n.is_read ? 'transparent' : '#f0f9ff',
                  cursor: 'pointer'
                }}
                onClick={() => markAsRead(n.id)}
              >
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>{n.message}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
