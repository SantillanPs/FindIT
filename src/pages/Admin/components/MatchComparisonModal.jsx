import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MatchComparisonModal = ({ selectedMatchPair, setSelectedMatchPair, handleConnectMatch }) => {
  if (!selectedMatchPair) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedMatchPair(null)}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden"
      >
        <div className="p-10 space-y-10">
           <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Review Details</h2>
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Compare submitted reports</p>
               </div>
              <button onClick={() => setSelectedMatchPair(null)} className="w-12 h-12 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-400">
                 <i className="fa-solid fa-xmark"></i>
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Found Item (The Anchor) */}
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 bg-uni-500/10 text-uni-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-uni-500/20">
                       Official Registry Record
                    </div>
                 </div>
                 
                 <div className="space-y-8 bg-white/5 rounded-3xl p-8 border border-white/5 text-left">
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Item Name</p>
                       <h3 className="text-xl font-black text-white uppercase">{selectedMatchPair.found.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Category</p>
                          <p className="text-[11px] font-black text-white uppercase tracking-wide">{selectedMatchPair.found.category}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stored Location</p>
                          <p className="text-[11px] font-black text-uni-400 uppercase tracking-wide">{selectedMatchPair.found.location}</p>
                       </div>
                    </div>

                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Internal Description / Notes</p>
                       <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-uni-500/20 pl-4 py-2">
                          "{selectedMatchPair.found.description || 'No detailed notes provided during logging.'}"
                       </p>
                    </div>
                 </div>
              </div>

              {/* Right: Lost Report (The Claim) */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-left">
                    <div className="px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                       Student Reporting Data
                    </div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">
                       AI CONFIDENCE: <span className="text-uni-400">{(selectedMatchPair.score * 100).toFixed(0)}%</span>
                    </div>
                 </div>
                 
                 <div className="space-y-8 bg-amber-500/5 rounded-3xl p-8 border-amber-500/10 text-left">
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Reported Item</p>
                       <h3 className="text-xl font-black text-white uppercase">{selectedMatchPair.lost.title}</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{selectedMatchPair.lost.location} • {new Date(selectedMatchPair.lost.date_lost).toLocaleDateString()}</p>
                    </div>
                    
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-wide truncate">{selectedMatchPair.lost.owner_name}</p>
                           <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Reported By (Claimant)</p>
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-amber-500 uppercase tracking-wide">#{selectedMatchPair.lost.id}</p>
                           <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-1">Report ID</p>
                        </div>
                     </div>

                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Student's Description of Loss</p>
                       <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-amber-500/20 pl-4 py-2">
                          "{selectedMatchPair.lost.description || 'No description provided.'}"
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex gap-4 pt-4">
              <button 
                onClick={() => handleConnectMatch(selectedMatchPair.found.id, selectedMatchPair.lost.id).then(() => setSelectedMatchPair(null))}
                className="flex-grow bg-uni-600 hover:bg-uni-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4"
              >
                 <i className="fa-solid fa-check-double text-lg"></i>
                 Confirm & Authorize Match
              </button>
              <button 
                onClick={() => setSelectedMatchPair(null)}
                className="px-10 border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                 Go Back
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchComparisonModal;
