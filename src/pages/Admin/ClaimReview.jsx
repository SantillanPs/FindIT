import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import EmptyState from '../../components/EmptyState';

const ClaimReview = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      const response = await apiClient.get('/admin/claims/pending');
      setClaims(response.data);
    } catch (error) {
      console.error('Failed to fetch claims', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId, status) => {
    const notes = window.prompt(`Review Claim: Provide a reason for this ${status} decision (shown to user):`, '');
    if (notes === null) return;

    try {
      await apiClient.post(`/admin/claims/${claimId}/review`, {
        status: status,
        admin_notes: notes
      });
      fetchPendingClaims();
    } catch (err) {
      console.error('Review submission failed.');
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
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Review Pending Claims</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Carefully check the student's proof against the actual item details. Only approve if you are confident they are the owner.
        </p>
      </motion.header>

      <AnimatePresence>
        {claims.length === 0 ? (
          <motion.div variants={itemVariants}>
            <EmptyState 
                title="All caught up!"
                message="There are no pending claims to review at the moment."
            />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <motion.div 
                key={claim.id} 
                variants={itemVariants}
                layout
                className="glass-panel p-5 sm:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col lg:flex-row gap-6 md:gap-10"
              >
                {/* Left: Item Context */}
                <div className="lg:w-1/3 space-y-6 text-left">
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 bg-uni-500/10 text-uni-400 border border-uni-500/20 text-[9px] font-black rounded-lg uppercase tracking-widest">Claim #{claim.id}</span>
                     {claim.similarity_score !== null && (
                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${claim.similarity_score > 0.7 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                            {Math.round(claim.similarity_score * 100)}% Match
                        </span>
                     )}
                  </div>

                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Found Item Reported</p>
                     <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">{claim.found_item_category}</h3>
                     <p className="text-slate-400 text-[11px] md:text-xs italic leading-relaxed">"{claim.found_item_description}"</p>
                  </div>

                  <div className="p-4 bg-uni-500/5 rounded-2xl border border-uni-500/10">
                    <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest mb-2">Staff Private Notes</p>
                    <p className="text-slate-300 text-[11px] font-bold leading-relaxed italic">
                        {claim.found_item_private_notes || "No identifying notes added by staff."}
                    </p>
                  </div>
                </div>

                {/* Right: Student's Proof & Action */}
                <div className="lg:w-2/3 flex flex-col gap-8 justify-between">
                    <div className="bg-white/5 p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5 text-left">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Student's Narrative & Proof</p>
                       <p className="text-white text-base md:text-lg font-bold italic mb-6 leading-relaxed">"{claim.proof_description}"</p>
                       
                       {claim.proof_photo_url && (
                         <a 
                             href={claim.proof_photo_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 text-[10px] font-black text-uni-400 hover:text-white uppercase tracking-widest transition-colors"
                         >
                             <i className="fa-solid fa-paperclip"></i> View Proof Document ↗
                         </a>
                       )}
                    </div>

                   <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                       <div className="text-left w-full sm:w-auto">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Submitted By</p>
                          <p className="text-white font-black text-[11px] uppercase tracking-widest truncate max-w-[200px]">User ID: {claim.user_id}</p>
                       </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                         <button 
                            onClick={() => handleReview(claim.id, 'rejected')}
                            className="flex-1 sm:flex-none px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20 transition-all"
                         >
                            Reject
                         </button>
                         <button 
                            onClick={() => handleReview(claim.id, 'approved')}
                            className="flex-1 sm:flex-none px-10 py-3 bg-uni-600 hover:bg-uni-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-uni-500/20 transition-all"
                         >
                            Approve
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClaimReview;
