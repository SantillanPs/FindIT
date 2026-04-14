import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FeedbackHub = () => {
  const queryClient = useQueryClient();
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [notes, setNotes] = useState('');

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }) => {
      const { data, error } = await supabase
        .from('feedbacks')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['feedbacks'], (old) => 
        old.map(f => f.id === data.id ? data : f)
      );
      setNotes('');
    }
  });

  const selectedFeedback = feedbacks.find(f => f.id === selectedFeedbackId);

  const handleStatusUpdate = (id, status) => {
    updateMutation.mutate({ id, status, admin_notes: notes });
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'all') return true;
    return f.status === filter;
  });

  const getTypeStyle = (type) => {
    switch (type) {
      case 'bug': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'feature': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'ux': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-header tracking-tight">Feedback Hub</h1>
          <p className="text-xs text-text-muted font-black uppercase tracking-[0.3em] mt-2">Community Insights & System Health</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto whitespace-nowrap">
          {['all', 'pending', 'under_review', 'resolved', 'dismissed'].map((f) => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                 filter === f ? 'bg-uni-500 text-white' : 'text-slate-500 hover:text-white'
               }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className="lg:col-span-5 space-y-4 lg:max-h-[70vh] lg:overflow-y-auto custom-scrollbar pr-2">
            {filteredFeedbacks.length === 0 ? (
               <div className="app-card p-12 text-center">
                  <p className="text-slate-500 uppercase font-black tracking-widest text-[10px]">No feedback records found</p>
               </div>
            ) : filteredFeedbacks.map((f) => (
              <motion.div
                key={f.id}
                layoutId={`card-${f.id}`}
                onClick={() => { setSelectedFeedbackId(f.id); setNotes(f.admin_notes || ''); }}
                className={`app-card p-5 cursor-pointer transition-all border ${
                  selectedFeedbackId === f.id ? 'border-uni-500/50 bg-uni-500/5 ring-1 ring-uni-500/20' : 'hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${getTypeStyle(f.type)}`}>
                    {f.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'pending' ? 'bg-orange-500' : f.status === 'resolved' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      #{f.id}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-text-header mb-1 line-clamp-1">{f.subject}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{f.message}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-white/5">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{f.user_name}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                    {format(new Date(f.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedFeedback ? (
                <motion.div
                  key={selectedFeedback.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="app-card p-8 sticky top-0"
                >
                  <div className="flex justify-between items-start mb-8 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(selectedFeedback.type)}`}>
                          {selectedFeedback.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-700 text-slate-400`}>
                          {selectedFeedback.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-text-header leading-tight">{selectedFeedback.subject}</h2>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Entry Timestamp</p>
                       <p className="text-xs font-bold text-slate-400">{format(new Date(selectedFeedback.created_at), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Submitted By</p>
                       <p className="text-[10px] font-bold text-text-header uppercase tracking-widest truncate">{selectedFeedback.user_name}</p>
                       <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest font-black truncate">{selectedFeedback.browser_info?.split(') ')[0]})</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 overflow-hidden">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">System Context (URL)</p>
                       <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest truncate">
                          {selectedFeedback.page_url?.split(window.location.host)[1] || '/'}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Observation Dispatch</h5>
                      <div className="p-6 rounded-2xl bg-white/2 border border-white/5 text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                        {selectedFeedback.message}
                      </div>
                    </div>

                    {selectedFeedback.screenshot_url && (
                      <div>
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Visual Evidence</h5>
                        <div className="rounded-2xl overflow-hidden border border-white/10 group relative cursor-zoom-in max-h-96">
                          <img 
                            src={selectedFeedback.screenshot_url} 
                            alt="Screenshot" 
                            className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                            onClick={() => window.open(selectedFeedback.screenshot_url, '_blank')}
                          />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[8px] text-white font-black uppercase tracking-widest">
                                Click to View Master
                             </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-8 border-t border-white/5 space-y-6">
                       <div>
                         <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Internal Record Ledger</h5>
                         <textarea
                           rows={3}
                           className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 focus:border-uni-500/50 outline-none transition-all resize-none"
                           placeholder="Document your findings, resolution steps, or reason for dismissal..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                         />
                       </div>

                       <div className="flex flex-wrap gap-3">
                         <button
                           onClick={() => handleStatusUpdate(selectedFeedback.id, 'under_review')}
                           className="flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
                         >
                           Set Under Review
                         </button>
                         <button
                           onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                           disabled={updateMutation.isPending}
                           className="flex-grow sm:flex-grow-0 px-8 py-3 rounded-xl bg-uni-500 hover:bg-uni-400 text-white text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                         >
                           {updateMutation.isPending ? 'Updating...' : 'Mark as Resolved'}
                         </button>
                         <button
                           onClick={() => handleStatusUpdate(selectedFeedback.id, 'dismissed')}
                           className="flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
                         >
                           Dismiss Dispatch
                         </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-3xl border border-white/5">🗂️</div>
                  <h3 className="text-xl font-bold text-slate-500">Awaiting Record Selection</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-2">Pick a feedback entry from the ledger to manage</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackHub;
