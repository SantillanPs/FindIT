import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import ResolutionTimeline from './components/ResolutionTimeline';

const MyClaims = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [schedulingClaim, setSchedulingClaim] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [expandedProof, setExpandedProof] = useState(null);

  // 1. Data Fetching (TanStack Query + View) — compliant with Section 1 / 2.1
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['my-claims', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vmy_claims') // Using the View we created
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 2. Schedule Pickup Mutation — compliant with Section 2.2
  const scheduleMutation = useMutation({
    mutationFn: async ({ claimId, time }) => {
      const { error } = await supabase
        .from('claims')
        .update({
          scheduled_pickup_time: new Date(time).toISOString()
        })
        .eq('id', claimId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      setSchedulingClaim(null);
      setPickupTime("");
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (error) => {
      console.error("Failed to schedule pickup", error);
    }
  });

  const handleSchedulePickup = (e) => {
    e.preventDefault();
    if (!schedulingClaim || !pickupTime) return;
    scheduleMutation.mutate({ claimId: schedulingClaim.id, time: pickupTime });
  };

  // Minimum datetime for scheduling (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 100 } }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { color: 'green', icon: 'fa-check', label: 'Approved' };
      case 'rejected': return { color: 'red', icon: 'fa-xmark', label: 'Rejected' };
      default: return { color: 'uni', icon: 'fa-hourglass', label: 'Pending Review' };
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.header className="space-y-3 text-left" variants={itemVariants}>
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">My Resolution Center</h1>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                Track the verification process of your claims. Items go through AI-assisted review and manual custodial verification.
                </p>
            </div>
            <div className="hidden md:flex h-12 w-12 rounded-2xl bg-uni-500/10 border border-uni-500/20 items-center justify-center text-xl text-uni-400">
                <i className="fa-solid fa-shield-halved"></i>
            </div>
        </div>
      </motion.header>

      {isLoading ? (
        <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse"></div>
            ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {claims.length === 0 ? (
            <motion.div variants={itemVariants} key="empty">
                <EmptyState 
                title="No active claims"
                message="You haven't claimed any found items yet."
                actionLabel="Browse Found Items"
                actionLink="/public-feed"
                />
            </motion.div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => {
                const statusConfig = getStatusConfig(claim.status);
                const isProofExpanded = expandedProof === claim.id;

                return (
                <motion.div 
                  key={claim.id} 
                  variants={itemVariants}
                  layout
                  className="bg-white/[0.02] p-5 md:p-7 rounded-2xl md:rounded-[2rem] border border-white/5 group relative overflow-hidden"
                >
                  {/* Status Accent Line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${
                    claim.status === 'approved' ? 'bg-green-500' : 
                    claim.status === 'rejected' ? 'bg-red-500' : 
                    'bg-uni-500'
                  }`}></div>
                  
                  <div className="flex flex-col gap-6 pl-3">
                    {/* ── Header: Status Badge + Title ── */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-2 ${
                            claim.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            claim.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-uni-500/10 text-uni-400 border-uni-500/20'
                        }`}>
                            <i className={`fa-solid ${statusConfig.icon} text-[8px]`}></i>
                            {statusConfig.label}
                        </div>

                        {/* Pickup Actions */}
                        {claim.status === 'approved' && !claim.scheduled_pickup_time && (
                           <button 
                               onClick={() => setSchedulingClaim(claim)}
                               className="px-4 py-2 rounded-xl bg-green-500 text-[10px] font-black text-white hover:bg-green-600 transition-all uppercase tracking-widest min-h-[36px]"
                           >
                               <i className="fa-solid fa-calendar-check mr-2 text-[9px]"></i>
                               Schedule Pickup
                           </button>
                        )}
                        {claim.scheduled_pickup_time && (
                           <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                               <i className="fa-solid fa-clock text-uni-400 text-[9px]"></i>
                               {new Date(claim.scheduled_pickup_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                           </div>
                        )}
                      </div>

                      {/* Title + Meta */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                           <h2 className="text-base md:text-lg font-black text-white uppercase tracking-tight">{claim.found_item_title || 'Claimed Item'}</h2>
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                             #{claim.id.toString().substring(0, 8).toUpperCase()}
                           </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Submitted {new Date(claim.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <ResolutionTimeline 
                      status={claim.status} 
                      isPickupReady={claim.is_pickup_ready}
                    />

                    {/* ── Notes & Proof ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-slate-700 text-[9px]"></i>
                                Proof Provided
                            </p>
                            <div 
                              className="p-4 bg-slate-950/30 rounded-xl border border-white/5 relative cursor-pointer group/proof"
                              onClick={() => setExpandedProof(isProofExpanded ? null : claim.id)}
                            >
                                <p className={`text-white font-bold italic text-xs leading-relaxed ${!isProofExpanded ? 'line-clamp-2' : ''}`}>
                                  "{claim.proof_description}"
                                </p>
                                {claim.proof_description?.length > 100 && (
                                  <span className="text-[8px] font-black text-uni-400 uppercase tracking-widest mt-2 inline-block opacity-60 group-hover/proof:opacity-100 transition-opacity">
                                    {isProofExpanded ? '▲ Show less' : '▼ Show more'}
                                  </span>
                                )}
                            </div>
                        </div>

                        {claim.admin_notes && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-comment-dots text-[9px]"></i>
                                    Resolution Notes
                                </p>
                                <div className="p-4 bg-uni-500/5 rounded-xl border border-uni-500/10">
                                    <p className="text-slate-300 text-[11px] leading-relaxed font-bold uppercase tracking-tight">{claim.admin_notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* ── Pickup Scheduling Modal ── */}
      <AnimatePresence>
        {schedulingClaim && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !scheduleMutation.isPending && setSchedulingClaim(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               transition={{ type: 'spring', damping: 28, stiffness: 200 }}
               className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] p-8 md:p-10 overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>
               
               <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden"></div>

               <div className="text-center space-y-3 mb-8">
                  <div className="h-14 w-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-green-400">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Schedule Pickup</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed max-w-[300px] mx-auto">
                    Let the Custodian know when you'll arrive to collect your item.
                  </p>
               </div>

               <form onSubmit={handleSchedulePickup} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Arrival Time</label>
                    <input 
                       type="datetime-local"
                       required
                       min={getMinDateTime()}
                       value={pickupTime}
                       onChange={(e) => setPickupTime(e.target.value)}
                       className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-green-500/50 transition-colors min-h-[48px]"
                    />
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">Must be at least 1 hour from now</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button 
                       type="button"
                       disabled={scheduleMutation.isPending}
                       onClick={() => setSchedulingClaim(null)}
                       className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors rounded-xl bg-white/[0.03] min-h-[48px]"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       disabled={scheduleMutation.isPending}
                       className="flex-1 py-4 rounded-xl bg-green-500 text-[10px] font-black text-white hover:bg-green-600 transition-all uppercase tracking-widest min-h-[48px] flex items-center justify-center gap-2"
                     >
                       {scheduleMutation.isPending ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Confirm Schedule'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyClaims;
