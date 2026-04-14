import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  User, 
  ChevronRight
} from 'lucide-react';
import FeedbackDetailDialog from './components/FeedbackDetailDialog';

const FeedbackHub = () => {
  const queryClient = useQueryClient();
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      case 'bug': return 'text-red-400 border-red-500/20';
      case 'feature': return 'text-yellow-400 border-yellow-500/20';
      case 'ux': return 'text-blue-400 border-blue-500/20';
      default: return 'text-emerald-400 border-emerald-500/20';
    }
  };

  const statusColors = {
    pending: 'bg-orange-500',
    under_review: 'bg-blue-500',
    resolved: 'bg-emerald-500',
    dismissed: 'bg-red-500'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* High-Density Header */}
      <div className="flex flex-col gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <MessageSquare size={18} className="text-uni-400" />
             <h1 className="text-2xl font-bold text-white tracking-tight">Feedback</h1>
          </div>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Command Center Ledger</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {['all', 'pending', 'under_review', 'resolved', 'dismissed'].map((f) => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                 filter === f ? 'bg-uni-500 text-white' : 'text-slate-500 hover:text-white'
               }`}
            >
              {f === 'under_review' ? 'Review' : f === 'dismissed' ? 'Trash' : f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-uni-500/10 border-t-uni-500 rounded-full animate-spin"></div>
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Syncing...</p>
        </div>
      ) : (
        <div className="space-y-3 px-2">
          {filteredFeedbacks.length === 0 ? (
             <div className="app-card py-12 text-center bg-white/[0.01]">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">No matching records</p>
             </div>
          ) : filteredFeedbacks.map((f) => (
            <motion.div
              key={f.id}
              onClick={() => { 
                setSelectedFeedbackId(f.id); 
                setNotes(f.admin_notes || '');
                setIsDialogOpen(true);
              }}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] active:scale-[0.98] ${
                selectedFeedbackId === f.id ? 'border-uni-500/30 bg-uni-500/5' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${getTypeStyle(f.type)}`}>
                        {f.type}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors[f.status] || 'bg-slate-500'}`} />
                </div>
                <p className="text-[8px] font-bold text-slate-600 uppercase">
                    {format(new Date(f.created_at), 'MMM d, h:mm a')}
                </p>
              </div>

              <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{f.subject}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium mb-3">{f.message}</p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 opacity-60">
                <div className="flex items-center gap-2">
                  <User size={10} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]">{f.user_name}</span>
                </div>
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">#{f.id.toString().slice(-4)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lean Mobile Detail Dialog */}
      <FeedbackDetailDialog
        feedback={selectedFeedback}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        notes={notes}
        setNotes={setNotes}
        onStatusUpdate={handleStatusUpdate}
        isPending={updateMutation.isPending}
      />
    </div>
  );
};

export default FeedbackHub;
