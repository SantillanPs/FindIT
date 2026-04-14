import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  CheckCircle,
  CheckCircle2,
  ArrowRight, 
  User, 
  MapPin, 
  Calendar,
  Sparkles,
  ClipboardList,
  SearchCheck
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

/**
 * MatchComparisonModal - Premium Professional (Pro Max)
 * - Focused side-by-side comparison.
 * - Human-centric labeling (No "Registry Record").
 * - Clean, professional typography.
 */
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl"
      >
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                   <h2 className="text-3xl font-bold text-white tracking-tight">Review Match Details</h2>
                   <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <SearchCheck size={14} className="text-uni-400" /> Compare submitted reports for potential confirmation
                   </p>
                </div>
               <button 
                 onClick={() => setSelectedMatchPair(null)} 
                 className="w-12 h-12 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Left: Found Item */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                        <ClipboardList size={16} />
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Found Item Record</span>
                  </div>
                  
                  <div className="space-y-8 bg-white/[0.03] rounded-3xl p-8 border border-white/5 text-left shadow-inner">
                     <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Item Name</p>
                        <h3 className="text-xl font-bold text-white tracking-tight">{selectedMatchPair.found.title}</h3>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</p>
                           <Badge variant="outline" className="bg-uni-500/5 text-uni-400 border-uni-500/10 text-[10px] font-bold px-3 py-1 uppercase">{selectedMatchPair.found.category}</Badge>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Found At</p>
                           <p className="text-[12px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                             <MapPin size={12} className="text-slate-600" /> {selectedMatchPair.found.location}
                           </p>
                        </div>
                     </div>

                     <div className="pt-4">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Internal Staff Description</p>
                        <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-uni-500/20 pl-4 py-2 bg-white/[0.01] rounded-r-xl">
                           "{selectedMatchPair.found.description || 'No detailed notes provided.'}"
                        </p>
                     </div>
                  </div>
               </div>

               {/* Right: Lost Report */}
               <div className="space-y-6">
                  <div className="flex justify-between items-center text-left">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                           <User size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lost Report Data</span>
                     </div>
                     <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">
                        <Sparkles size={12} /> {(selectedMatchPair.score * 100).toFixed(0)}% MATCH
                     </div>
                  </div>
                  
                  <div className="space-y-8 bg-amber-500/5 rounded-3xl p-8 border border-amber-500/10 text-left shadow-inner">
                     <div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Reported Item</p>
                        <h3 className="text-xl font-bold text-white tracking-tight">{selectedMatchPair.lost.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><MapPin size={12} /> {selectedMatchPair.lost.location}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar size={12} /> {new Date(selectedMatchPair.lost.date_lost).toLocaleDateString()}</p>
                        </div>
                     </div>
                     
                      <div className="grid grid-cols-2 gap-8 pt-2">
                        <div>
                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Reported By</p>
                           <p className="text-[12px] font-bold text-white uppercase tracking-tight truncate">{selectedMatchPair.lost.owner_name}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Report ID</p>
                           <p className="text-[11px] font-bold text-uni-400 uppercase tracking-widest">#{selectedMatchPair.lost.id}</p>
                        </div>
                      </div>

                     <div className="pt-4">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">Owner's Description</p>
                        <p className="text-[13px] text-slate-300 font-medium leading-relaxed italic border-l-2 border-amber-500/20 pl-4 py-2 bg-amber-500/5 rounded-r-xl">
                           "{selectedMatchPair.lost.description || 'No description provided.'}"
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                 onClick={() => handleConnectMatch(selectedMatchPair.found.id, selectedMatchPair.lost.id).then(() => setSelectedMatchPair(null))}
                 className="flex-grow bg-white text-slate-950 hover:bg-uni-600 hover:text-white py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl"
               >
                  <CheckCircle2 size={18} />
                  Confirm & Link Reports
               </button>
               <button 
                 onClick={() => setSelectedMatchPair(null)}
                 className="px-10 border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
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
