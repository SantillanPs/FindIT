import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, Info, BellRing, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Synchronized Data Fetching (Backend Standard 2.1)
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    // Only poll when the center is open to save resources, 
    // but keep a reasonable staleTime for background freshness.
    refetchInterval: isOpen ? 10000 : 60000, 
  });

  // 2. Optimized Mutations (Backend Standard 2.2)
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAsRead = (id) => markReadMutation.mutate(id);

  // Auto-mark as read when opened
  React.useEffect(() => {
    if (isOpen && notifications.some(n => !n.is_read)) {
      markAllAsReadMutation.mutate();
    }
  }, [isOpen]);

  const getNotificationStyle = (title) => {
    const t = title.toLowerCase();
    
    if (t.includes('denied') || t.includes('rejected') || t.includes('failed')) {
      return {
        Icon: AlertCircle,
        iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        titleText: 'text-rose-400',
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
      };
    }
    
    if (t.includes('verified') || t.includes('approved') || t.includes('success')) {
      return {
        Icon: CheckCircle2,
        iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        titleText: 'text-emerald-400',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
      };
    }

    if (t.includes('update') || t.includes('pending')) {
      return {
        Icon: BellRing,
        iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        titleText: 'text-amber-400',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      };
    }

    return {
      Icon: Info,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      titleText: 'text-sky-400',
      dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
    };
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
              className="absolute right-0 mt-4 w-[360px] max-h-[500px] bg-slate-900 border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-xl"
            >
              <div className="p-4 border-b border-white/5 bg-slate-950/80 flex justify-between items-center">
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BellRing size={14} className="text-brand-primary" />
                  Live Status Updates
                </h4>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)} 
                  className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <span className="text-xs">✕</span>
                </motion.button>
              </div>

              <div className="overflow-y-auto custom-scrollbar bg-slate-900/40">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <BellRing size={24} className="text-slate-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Inbox Zero</p>
                    <p className="text-xs text-slate-600 mt-2">You have no pending updates.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((n, index) => {
                      const style = getNotificationStyle(n.title);
                      const Icon = style.Icon;
                      
                      return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={n.id} 
                        className={`p-4 hover:bg-white/[0.03] transition-all cursor-pointer relative group flex gap-3.5 ${n.is_read ? 'opacity-50' : ''}`}
                        onClick={() => {
                          const titleLower = n.title.toLowerCase();
                          if (n.found_item_id && n.lost_item_id && titleLower.includes("direct match")) {
                            navigate(`/match-review/${n.lost_item_id}/${n.found_item_id}`);
                          } else if (titleLower.includes("verified") || titleLower.includes("verification")) {
                            navigate('/profile');
                          } else if (titleLower.includes("claim")) {
                            navigate('/my-claims');
                          }
                          markAsRead(n.id);
                          setIsOpen(false);
                        }}
                      >
                        {!n.is_read ? (
                          <div className={`absolute top-5 right-4 w-2 h-2 rounded-full ${style.dot}`}></div>
                        ) : (
                          <motion.button
                            initial={{ opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(n.id);
                            }}
                            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:border-rose-400/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={10} />
                          </motion.button>
                        )}
                        
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg} shadow-sm mt-0.5`}>
                          <Icon size={16} strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className={`font-black text-[11px] uppercase tracking-wider mb-1 ${style.titleText}`}>
                            {n.title}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed font-medium">
                            {n.message}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-3 flex justify-between items-center group-hover:text-slate-400 transition-colors">
                            <span>{new Date(n.created_at).toLocaleDateString()}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold text-brand-primary">
                              VIEW {n.title.toLowerCase().includes('claim') ? 'CLAIM' : 'PROFILE'} <ChevronRight size={10} strokeWidth={3} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )})}
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
