import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Eye, 
  History, 
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';


const ReviewQueueCard = ({ item, onReviewItem, setPreviewImage, regenerateMutation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl hover:border-uni-500/30 transition-all duration-500"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={item.photo_url} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          <Badge className="bg-white/10 backdrop-blur-md text-white border-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1">
            {item.ai_draft?.category || item.category || 'General'}
          </Badge>
          <div className="flex gap-2">
            <button 
              onClick={() => setPreviewImage(item.photo_url)}
              className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-uni-600 transition-all"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-6">
          <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest italic mb-1">Awaiting Review</p>
          <h3 className="text-xl font-bold text-white tracking-tight truncate max-w-[200px] capitalize">
            {item.ai_draft?.suggested_title || item.title || 'Uncategorized Item'}
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-uni-500" />
            {new Date(item.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <History size={12} className="text-uni-500" />
            Expiring in 72h
          </div>
        </div>

        {/* Identity & Taxonomy (Always Visible) */}
        <div className="flex gap-6 border-y border-white/5 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Brand</span>
            <span className="text-[10px] font-bold text-uni-400 capitalize">{item.ai_draft?.brand || item.brand || "Scanning..."}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Category</span>
            <span className="text-[10px] font-bold text-slate-400 capitalize">{item.category || item.ai_draft?.category || "Categorizing..."}</span>
          </div>
        </div>

        {/* Forensic Accordion Trigger */}
        <div className="space-y-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/trigger"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400 group-hover/trigger:scale-110 transition-transform">
                <Sparkles size={14} className={regenerateMutation.isPending && regenerateMutation.variables?.id === item.id ? 'animate-pulse' : ''} />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Forensic Inspection</p>
                <p className="text-[9px] font-bold text-uni-300">AI Intelligence Evidence</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-slate-500"
            >
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">AI Draft Analysis</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); regenerateMutation.mutate(item); }}
                      disabled={regenerateMutation.isPending}
                      className="text-[7px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full"
                    >
                      {regenerateMutation.isPending && regenerateMutation.variables?.id === item.id ? 'Analyzing...' : 'Regenerate'}
                    </button>
                  </div>

                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic px-1">
                    {item.ai_draft?.skeptical_summary || item.ai_draft?.suggested_description || "Processing visual intelligence..."}
                  </p>

                  <div className="flex items-center gap-2 py-1.5 px-3 bg-uni-500/5 rounded border border-uni-500/10">
                    <Sparkles size={10} className="text-uni-400" />
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                       <span className="text-uni-400">Forensic Hypothesis:</span> AI analysis based on visual markers.
                    </p>
                  </div>

                  {item.ai_draft?.forensic_details?.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {item.ai_draft.forensic_details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-uni-500/5 border border-uni-500/10 px-3 py-1.5 rounded-lg">
                          <span className="text-uni-400 text-[10px]">•</span>
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-white/90 uppercase tracking-tight">
                                {typeof detail === 'object' ? `${detail.qualifier}: ${detail.observation}` : detail}
                             </span>
                             {detail.reasoning && (
                               <span className="text-[7px] font-medium text-slate-500 italic">
                                  {detail.reasoning}
                               </span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button 
          onClick={() => onReviewItem(item)}
          className="w-full h-12 rounded-xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-xl group/btn mt-2"
        >
          Open Editor Desk
          <ExternalLink size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};

const ReviewQueueTab = ({ onReviewItem, setPreviewImage }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['admin_review_queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_admin_review_queue')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 120000 // Throttled to 2m for network stability
  });
  
  const regenerateMutation = useMutation({
    mutationFn: async (item) => {
      console.log('📡 [FORENSIC-HANDSHAKE-DEBUG]');
      console.log(' - Target:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-vision-ai`);
      console.log(' - Session active:', !!(await supabase.auth.getSession()).data.session);

      const { data, error } = await supabase.functions.invoke('process-vision-ai', {
        body: { record: item }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('AI Forensic Scan Completed', {
        description: 'The item details have been updated with fresh intelligence.',
        icon: <Sparkles className="w-4 h-4 text-uni-400" />
      });
      queryClient.invalidateQueries({ queryKey: ['admin_review_queue'] });
    },
    onError: async (err) => {
      console.error('❌ [FORENSIC-SCAN-FAILURE]:', err.message);
      
      // Deep-Unwrap: Extract the actual server-side crash message
      if (err.context?.json) {
        const body = await err.context.json();
        console.error(' - Server Reason:', body.error || 'Unknown server crash');
        console.error(' - Trace:', body.stack);
      }
      
      toast.error('Forensic Scan Interrupted', {
        description: err.message
      });
    }
  });

  const filteredQueue = queue.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  if (isLoading && queue.length === 0) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-4">
            Editor Desk
            <Badge className="bg-uni-500 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {queue.length} Pending
            </Badge>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Privacy Shield Review Gate</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-uni-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search queue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-uni-500/50 outline-none transition-all"
          />
        </div>
      </div>

      {filteredQueue.length === 0 ? (
        <div className="py-32 text-center rounded-[2rem] border border-white/5 bg-slate-900/20 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-slate-700">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1">Queue Empty</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">All witness reports have been securely processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQueue.map((item) => (
            <ReviewQueueCard 
              key={item.id}
              item={item}
              onReviewItem={onReviewItem}
              setPreviewImage={setPreviewImage}
              regenerateMutation={regenerateMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueueTab;
