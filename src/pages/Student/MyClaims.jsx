import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import ResolutionTimeline from './components/ResolutionTimeline';

const MyClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingClaim, setSchedulingClaim] = useState(null);
  const [pickupTime, setPickupTime] = useState("");

  useEffect(() => {
    if (user?.id) {
        fetchMyClaims();
    }
  }, [user]);

  const fetchMyClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*, found_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Flatten for UI if necessary
      // Flatten for UI if necessary
      const formatted = (data || []).map(c => ({
          ...c,
          found_item_category: c.found_items?.category,
          found_item_title: c.found_items?.title
      }));
      
      setClaims(formatted);
    } catch (error) {
      console.error('Failed to fetch my claims from Supabase', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePickup = async (e) => {
    e.preventDefault();
    if (!schedulingClaim || !pickupTime) return;

    try {
      const { error } = await supabase
        .from('claims')
        .update({
          scheduled_pickup_time: new Date(pickupTime).toISOString()
        })
        .eq('id', schedulingClaim.id);
        
      if (error) throw error;
      
      setSchedulingClaim(null);
      setPickupTime("");
      fetchMyClaims();
    } catch (error) {
      console.error("Failed to schedule pickup in Supabase", error);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <div className="flex justify-between items-start">
            <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">My Resolution Center</h1>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                Track the institutional verification process of your claims. Items go through AI-assisted review and manual custodial verification.
                </p>
            </div>
            <div className="hidden md:flex h-12 w-12 rounded-2xl bg-uni-500/10 border border-uni-500/20 items-center justify-center text-xl text-uni-400">
                <i className="fa-solid fa-shield-halved"></i>
            </div>
        </div>
      </motion.header>

      {loading ? (
        <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
            ))}
        </div>
      ) : (
        <AnimatePresence>
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
            <div className="space-y-8">
              {claims.map((claim) => (
                <motion.div 
                  key={claim.id} 
                  variants={itemVariants}
                  layout
                  className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    claim.status === 'approved' ? 'bg-green-500' : 
                    claim.status === 'rejected' ? 'bg-red-500' : 
                    'bg-uni-500'
                  }`}></div>
                  
                  <div className="flex flex-col gap-8">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4">
                           <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">{claim.found_item_title || claim.found_item_category || 'Claimed Item'}</h2>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 border border-white/5 px-3 py-1 rounded-lg">
                             FILE #{claim.id.toString().padStart(4, '0')}
                           </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Submitted on {new Date(claim.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                         {claim.status === 'approved' && !claim.scheduled_pickup_time && (
                            <button 
                                onClick={() => setSchedulingClaim(claim)}
                                className="px-5 py-2 rounded-xl bg-green-500 text-[10px] font-black text-white hover:bg-green-600 transition-all uppercase tracking-widest"
                            >
                                Schedule Pickup
                            </button>
                         )}
                         {claim.scheduled_pickup_time && (
                            <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <i className="fa-solid fa-clock text-uni-400"></i>
                                {new Date(claim.scheduled_pickup_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                         )}
                         <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            claim.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            claim.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-uni-500/10 text-uni-400 border-uni-500/20'
                        }`}>
                            {claim.status}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Integration */}
                    <ResolutionTimeline 
                      status={claim.status} 
                      isPickupReady={claim.is_pickup_ready}
                      similarityScore={claim.similarity_score}
                    />

                    {/* Notes & Proof */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-circle-info text-slate-800"></i>
                                Proof provided
                            </p>
                            <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 relative group/proof">
                                <p className="text-white font-bold italic text-xs md:text-sm leading-relaxed">"{claim.proof_description}"</p>
                            </div>
                        </div>

                        {claim.admin_notes && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-comment-dots"></i>
                                    Official Resolution Notes
                                </p>
                                <div className="p-4 bg-uni-500/5 rounded-2xl border border-uni-500/10">
                                    <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed font-bold uppercase tracking-tight">{claim.admin_notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Pickup Scheduling Modal */}
      <AnimatePresence>
        {schedulingClaim && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSchedulingClaim(null)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-[3rem] p-8 md:p-10 overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>
               
               <div className="text-center space-y-4 mb-8">
                  <div className="h-16 w-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto text-green-400">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Schedule Pickup</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                    Let the Custodian know when you'll be arriving to collect your item. This helps us ensure the personnel is ready for verification.
                  </p>
               </div>

               <form onSubmit={handleSchedulePickup} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Arrival Time</label>
                    <input 
                       type="datetime-local"
                       required
                       value={pickupTime}
                       onChange={(e) => setPickupTime(e.target.value)}
                       className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-green-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                       type="button"
                       onClick={() => setSchedulingClaim(null)}
                       className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       className="flex-1 py-4 rounded-2xl bg-green-500 text-[10px] font-black text-white hover:bg-green-600 transition-all uppercase tracking-widest"
                     >
                       Confirm Schedule
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
