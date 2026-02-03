import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import EmptyState from '../../components/EmptyState';

const GlobalMatchDiscovery = () => {
  const [matchGroups, setMatchGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);

  const fetchGlobalMatches = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/matches/all');
      setMatchGroups(resp.data);
    } catch (err) {
      console.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalMatches();
  }, []);

  const handleConnectMatch = async (foundItemId, lostItemId) => {
    if (!window.confirm("Connect these reports? Both users will be notified so they can coordinate the return.")) return;
    setConnectingId(`${foundItemId}-${lostItemId}`);
    try {
      await apiClient.post('/admin/matches/connect', { found_item_id: foundItemId, lost_item_id: lostItemId });
      fetchGlobalMatches();
    } catch (err) {
      console.error("Failed to connect match");
    } finally {
      setConnectingId(null);
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 space-y-6 text-center">
      <div className="w-12 h-12 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black tracking-widest text-[10px] uppercase animate-pulse">Running AI Match Search...</p>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12"
    >
      <motion.header className="flex flex-col md:flex-row justify-between items-start gap-8" variants={itemVariants}>
        <div className="space-y-4 text-left">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">AI-Suggested Matches</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
            Our AI compares found items with student lost reports. Review these suggestions and connect them if they look like a match.
          </p>
        </div>
        <button 
          onClick={fetchGlobalMatches} 
          className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3"
        >
          <i className="fa-solid fa-rotate"></i>
          Re-scan Reports
        </button>
      </motion.header>

      <AnimatePresence>
        {matchGroups.length === 0 ? (
          <motion.div variants={itemVariants}>
            <EmptyState 
                title="No matches found yet"
                message="We couldn't find any strong matches between lost reports and found items."
            />
          </motion.div>
        ) : (
          <div className="space-y-12">
            {matchGroups.map((group) => (
              <motion.div 
                key={group.found_item.id} 
                variants={itemVariants}
                className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-950/20"
              >
                {/* Header: Found Item */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                  <div className="flex items-center gap-4 md:gap-6 text-left w-full md:w-auto">
                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl md:text-2xl shadow-inner shrink-0">
                        📦
                     </div>
                     <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                            <span className="text-uni-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Found Item</span>
                            <span className="text-slate-600 text-[9px] md:text-[10px] font-black">#{group.found_item.id}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{group.found_item.category}</h3>
                     </div>
                  </div>
                  <div className="text-center md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Match Confidence</p>
                      <p className={`text-3xl md:text-4xl font-black tracking-tighter ${group.max_score >= 0.8 ? 'text-green-400' : 'text-uni-400'}`}>
                        {Math.round(group.max_score * 100)}%
                      </p>
                  </div>
                </div>
                
                <div className="p-8 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Description by finder</p>
                         <p className="text-white text-[13px] md:text-sm font-bold italic leading-relaxed border-l-2 border-white/10 pl-4 py-1">"{group.found_item.description}"</p>
                         <div className="flex flex-wrap gap-4 md:gap-6 pt-2">
                             <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-location-dot text-uni-500"></i> {group.found_item.location_zone}
                             </div>
                             <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-calendar text-uni-500"></i> {new Date(group.found_item.found_time).toLocaleDateString()}
                             </div>
                         </div>
                      </div>
                      <div className="p-5 md:p-6 bg-uni-500/5 rounded-2xl md:rounded-3xl border border-uni-500/10">
                         <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest mb-3">Internal Staff Notes</p>
                         <p className="text-slate-300 text-[11px] md:text-xs font-bold leading-relaxed italic">
                            {group.found_item.private_admin_notes || "No extra identifying details recorded."}
                         </p>
                      </div>
                   </div>

                   {/* Potential Matches */}
                   <div className="space-y-6 pt-10 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Potential matches from lost reports</h4>
                      
                       <div className="grid grid-cols-1 gap-4">
                          {group.top_matches.map((m) => (
                             <div key={m.item.id} className="glass-panel-simple p-5 sm:p-6 rounded-[1.5rem] md:rounded-3xl border border-white/5 group/row hover:bg-white/5 transition-all flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center">
                                <div className="flex flex-col items-start shrink-0">
                                   <span className={`px-4 py-2 rounded-xl text-[10px] md:text-[11px] font-black tabular-nums border ${
                                     m.similarity_score >= 0.8 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-uni-500/10 text-uni-400 border-uni-500/30'
                                   }`}>
                                     {Math.round(m.similarity_score * 100)}% Match
                                   </span>
                                </div>
 
                                <div className="flex-grow text-left">
                                   <p className="text-slate-300 text-[13px] md:text-sm font-bold italic mb-4 leading-relaxed group-hover/row:text-white transition-colors">"{m.item.description}"</p>
                                   <div className="flex flex-wrap gap-4">
                                      <div className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                         <i className="fa-solid fa-location-dot"></i> {m.item.location_zone}
                                      </div>
                                      <div className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                         <i className="fa-solid fa-calendar"></i> {new Date(m.item.last_seen_time).toLocaleDateString()}
                                      </div>
                                   </div>
                                </div>
 
                                <div className="w-full lg:w-64 shrink-0 text-left bg-black/40 p-4 rounded-2xl border border-white/5">
                                   <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1.5">User's Private Proof</p>
                                   <p className="text-slate-500 text-[9px] md:text-[10px] font-bold line-clamp-2 italic">"{m.item.private_proof_details || "None provided."}"</p>
                                </div>
 
                                <div className="shrink-0 w-full lg:w-auto">
                                   <button 
                                     disabled={connectingId === `${group.found_item.id}-${m.item.id}`}
                                     onClick={() => handleConnectMatch(group.found_item.id, m.item.id)}
                                     className="w-full lg:w-auto bg-uni-600 hover:bg-uni-500 text-white px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-uni-500/10 disabled:opacity-30"
                                   >
                                     {connectingId === `${group.found_item.id}-${m.item.id}` ? 'Connecting...' : 'Connect Them'}
                                   </button>
                                </div>
                             </div>
                          ))}
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

export default GlobalMatchDiscovery;
