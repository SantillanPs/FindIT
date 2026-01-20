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
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/50 border border-brand-border hover:bg-slate-700/50 transition-all group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform inline-block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-primary text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-brand-primary/20 min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-slate-900 border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-brand-border bg-slate-950/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Notifications</h4>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-500 hover:text-white transition-colors"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-3xl mb-3 opacity-20">📭</div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">All caught up</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-border/30">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer relative ${n.is_read ? 'opacity-60' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      {!n.is_read && (
                        <div className="absolute top-5 right-4 w-2 h-2 bg-brand-primary rounded-full shadow-sm shadow-brand-primary/50"></div>
                      )}
                      <div className="font-bold text-xs text-slate-100 mb-1 pr-4">{n.title}</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2 italic">
                        "{n.message}"
                      </div>
                      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-brand-border bg-slate-950/50 text-center">
              <button 
                className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:text-brand-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close Panel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
