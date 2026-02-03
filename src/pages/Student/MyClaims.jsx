import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import EmptyState from '../../components/EmptyState';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const response = await apiClient.get('/claims/my-claims');
      setClaims(response.data);
    } catch (error) {
      console.error('Failed to fetch my claims', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">My Claims</h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Track the progress of items you've claimed. Our team reviews these to make sure everything gets back to the right person.
        </p>
      </motion.header>

      {loading ? (
        <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl"></div>
            ))}
        </div>
      ) : (
        <AnimatePresence>
          {claims.length === 0 ? (
            <motion.div variants={itemVariants}>
                <EmptyState 
                title="No active claims"
                message="You haven't claimed any found items yet."
                actionLabel="Browse Found Items"
                actionLink="/public-feed"
                />
            </motion.div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <motion.div 
                  key={claim.id} 
                  variants={itemVariants}
                  layout
                  className="glass-panel p-5 md:p-6 rounded-[2rem] md:rounded-3xl border border-white/5 group relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 md:w-1.5 ${
                    claim.status === 'approved' ? 'bg-green-500' : 
                    claim.status === 'rejected' ? 'bg-red-500' : 
                    'bg-uni-500'
                  }`}></div>
                  
                  <div className="flex-grow text-left w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-900 border border-white/5 px-3 py-1 rounded-lg">
                        Claim #{claim.id.toString().padStart(4, '0')}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${
                        claim.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        claim.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-uni-500/10 text-uni-400 border-uni-500/20'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Description provided</p>
                            <p className="text-white font-bold italic text-[13px] md:text-sm leading-relaxed">"{claim.proof_description}"</p>
                        </div>
                        {claim.admin_notes && (
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest mb-2">Staff Note</p>
                                <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed">{claim.admin_notes}</p>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto md:border-l border-white/5 pt-4 md:pt-0 md:pl-8 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Submitted</p>
                    <p className="text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default MyClaims;
