import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

const NotificationCenter = () => {
  const navigate = useNavigate();
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
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-900/50 border border-brand-border hover:bg-slate-800/50 transition-all group backdrop-blur-sm"
      >
        <span className="text-xl inline-block transition-all">🔔</span>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-brand-primary text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-sm border border-brand-primary/30 min-w-[18px] text-center"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-4 w-80 max-h-[480px] bg-slate-900 border border-brand-border rounded-lg z-50 overflow-hidden flex flex-col backdrop-blur-xl"
            >
              <div className="p-4 border-b border-brand-border bg-slate-950/80 flex justify-between items-center">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Status Updates</h4>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)} 
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <span className="text-sm">✕</span>
                </motion.button>
              </div>

              <div className="overflow-y-auto custom-scrollbar bg-slate-900/40">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-4 opacity-10">📭</div>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Queue Synchronized</p>
                  </div>
                ) : (
                  <div className="divide-y divide-brand-border/20">
                    {notifications.map((n, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={n.id} 
                        className={`p-5 hover:bg-brand-primary/5 transition-all cursor-pointer relative group ${n.is_read ? 'opacity-40' : ''}`}
                        onClick={() => {
                          if (n.found_item_id && n.lost_item_id && n.title.includes("Direct Match")) {
                            navigate(`/match-review/${n.lost_item_id}/${n.found_item_id}`);
                            setIsOpen(false);
                          }
                          markAsRead(n.id);
                        }}
                      >
                        {!n.is_read && (
                          <div className="absolute top-6 right-5 w-1.5 h-1.5 bg-brand-primary rounded-full border border-brand-primary/40"></div>
                        )}
                        <div className="font-black text-[11px] text-white uppercase tracking-wider mb-2 pr-6 group-hover:text-brand-primary transition-colors">{n.title}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mb-3 italic font-bold">
                          "{n.message}"
                        </div>
                        <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center justify-between">
                          <span>{new Date(n.created_at).toLocaleDateString()}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">MARK AS READ →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-brand-border bg-slate-950/80 text-center">
                <button 
                  className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Terminate Interface
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
