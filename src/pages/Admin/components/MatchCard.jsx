import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../../constants/categories';

const MatchCard = ({ match, foundItem, onDeepCompare, onAuthorizeMatch, actionLoading, setPreviewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[3rem] p-0 hover:border-uni-500/40 transition-all relative group overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {/* Match Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-12 py-8 border-b border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center gap-8">
          <div className={`px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-inner ${match.similarity_score > 0.8 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-uni-400/10 text-uni-400 border border-uni-400/20'}`}>
            <i className={`fa-solid ${match.similarity_score > 0.8 ? 'fa-shield-check animate-pulse' : 'fa-microchip'}`}></i>
            Match Confidence: {(match.similarity_score * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Case Reference <span className="text-slate-300 ml-2">#LR-{match.item.id}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-uni-400`}></i>
            {isExpanded ? 'Hide Details' : 'View Full Comparison'}
          </div>
        </div>
        
        <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onDeepCompare({ found: foundItem, lost: match.item, score: match.similarity_score })}
            className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all px-6 py-3 border border-white/5 hover:border-white/20 rounded-xl"
          >
            Side-By-Side Review
          </button>
          <button 
            onClick={() => onAuthorizeMatch(foundItem.id, match.item.id)}
            disabled={actionLoading === `match-${foundItem.id}-${match.item.id}`}
            className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl active:scale-95 ${
              match.similarity_score > 0.8 ? 'bg-uni-600 hover:bg-uni-500 text-white shadow-uni-600/40' : 'bg-white text-black hover:bg-uni-500 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-link-slash group-hover:fa-link transition-all"></i>
            Authorize Link
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Comparison Grid */}
            <div className="p-12 space-y-2">
              {/* Row Headers */}
              <div className="grid grid-cols-12 gap-8 mb-4 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                <div className="col-span-2">Attribute</div>
                <div className="col-span-5 flex items-center gap-3 text-uni-400"><i className="fa-solid fa-vault"></i> 1. The Vault</div>
                <div className="col-span-5 flex items-center gap-3 text-amber-500"><i className="fa-solid fa-user-graduate"></i> 2. The Report</div>
              </div>

              {/* Row: Object Type */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/[0.02] p-6 rounded-2xl transition-all items-center">
                <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <i className="fa-solid fa-tag w-6 text-slate-600"></i> Type
                </div>
                <div className="col-span-5 text-lg font-black text-white uppercase tracking-tight">{foundItem.item_name}</div>
                <div className="col-span-5 text-lg font-black text-white uppercase tracking-tight">{match.item.item_name}</div>
              </div>

              {/* Row: Location */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/[0.02] p-6 rounded-2xl transition-all items-center border-t border-white/[0.03]">
                <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <i className="fa-solid fa-location-dot w-6 text-slate-600"></i> Location
                </div>
                <div className="col-span-5 text-sm font-bold text-uni-400 uppercase">{foundItem.location_zone}</div>
                <div className="col-span-5 text-sm font-bold text-amber-500 uppercase">{match.item.location_zone}</div>
              </div>

              {/* Row: Date */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/[0.02] p-6 rounded-2xl transition-all items-center border-t border-white/[0.03]">
                <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <i className="fa-solid fa-calendar w-6 text-slate-600"></i> Date
                </div>
                <div className="col-span-5 text-sm font-black text-slate-300">{new Date(foundItem.found_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="col-span-5 text-sm font-black text-slate-300">{new Date(match.item.last_seen_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>

              {/* Row: Description */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/[0.02] p-6 rounded-2xl transition-all items-start border-t border-white/[0.03]">
                <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest pt-4">
                  <i className="fa-solid fa-align-left w-6 text-slate-600"></i> Details
                </div>
                <div className="col-span-5">
                  <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-uni-500/10 min-h-[100px]">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                      "{foundItem.description || 'No office notes provided.'}"
                    </p>
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-amber-500/10 min-h-[100px]">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                      "{match.item.description || 'No student description provided.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: User Identity / Channel */}
              <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 shadow-xl overflow-hidden">
                      {match.item.safe_photo_url ? (
                        <img src={match.item.safe_photo_url} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-user-shield text-2xl"></i>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Student / Owner</p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{match.item.guest_full_name || match.item.owner_name || 'Identity Not Recorded'}</p>
                        <span className={`w-2 h-2 rounded-full ${match.item.owner_name ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`}></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-px bg-white/10"></div>
                  
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Verification Status</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${match.item.owner_name ? 'text-uni-400' : 'text-amber-500'}`}>
                      {match.item.owner_name ? (
                        <><i className="fa-solid fa-check-circle mr-2"></i>Verified Institutional Member</>
                      ) : (
                        <><i className="fa-solid fa-user-secret mr-2"></i>Guest Submission (Pending)</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  {match.item.safe_photo_url && (
                    <button 
                      onClick={() => setPreviewImage(match.item.safe_photo_url)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-widest transition-all"
                    >
                      View Item Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchCard;
