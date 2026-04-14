import { motion, AnimatePresence } from 'framer-motion';
import { ITEM_ATTRIBUTES } from '../../../constants/attributes';
import { supabase } from '../../../lib/supabase';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  SearchCheck,
  ArrowRight, 
  Image as ImageIcon, 
  FileText,
  User,
  MessageSquare,
  Scale,
  PackageCheck,
  XCircle,
  ThumbsUp,
  History,
  X
} from 'lucide-react';

/**
 * ClaimReviewModal - Premium Professional (Pro Max)
 * - Refined verification workflow.
 * - Human-centric labels (No "Verification Engine").
 * - Clean, professional typography.
 */
const ClaimReviewModal = ({ 
  selectedClaim, 
  setSelectedClaim, 
  claimReviewStep, 
  setClaimReviewStep, 
  handleClaimReview, 
  actionLoading 
}) => {
  if (!selectedClaim) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={() => setSelectedClaim(null)}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden relative z-10 shadow-3xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                  <SearchCheck size={24} />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Review Claim Details</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Case #{selectedClaim.id.toString().padStart(5, '0')} • Pending Resolution
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                {[1,2,3].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${claimReviewStep === s ? 'w-12 bg-uni-400 shadow-[0_0_10px_rgba(var(--uni-500-rgb),0.5)]' : 'w-4 bg-white/10'}`} />
                ))}
             </div>
             <button 
               onClick={() => setSelectedClaim(null)}
               className="w-12 h-12 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-lg"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-8 md:p-12">
          <AnimatePresence mode="wait">
            {claimReviewStep === 1 && (
              <motion.div 
                key="rev1" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <PackageCheck size={12} /> Original Item Record
                          </span>
                          <div className="p-8 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-5 text-left shadow-inner">
                               <div className="flex justify-between items-start">
                                  <h4 className="text-2xl font-bold text-white tracking-tight">{selectedClaim.found_items?.item_name || selectedClaim.found_items?.title}</h4>
                                  <div className="bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full">
                                    FOUND ITEM
                                  </div>
                               </div>
                               <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-uni-400" /> {selectedClaim.found_items?.location_zone || selectedClaim.found_items?.location}</span>
                                  <span className="flex items-center gap-2"><FileText size={14} className="text-uni-400" /> {(selectedClaim.found_items?.found_time || selectedClaim.found_items?.date_found) ? new Date(selectedClaim.found_items.found_time || selectedClaim.found_items.date_found).toLocaleDateString() : 'Unknown'}</span>
                               </div>
                               <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{selectedClaim.found_item_description || 'No detailed description.'}</p>
                          </div>

                          <div className="p-8 bg-uni-500/5 rounded-[2rem] border border-uni-500/10 space-y-5 text-left">
                              <div className="flex items-center gap-2">
                                 <ShieldCheck size={14} className="text-uni-400" />
                                 <span className="text-[10px] font-bold text-uni-400 uppercase tracking-widest">Internal Staff Reference</span>
                              </div>
                              <div className="space-y-4">
                                 <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Staff Note</p>
                                    <p className="text-[13px] font-medium text-slate-200 pl-4 border-l border-uni-500/20 italic">
                                       {selectedClaim.found_item_verification_note || "No internal notes provided."}
                                    </p>
                                 </div>
                                 <div className="pt-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Planned Challenge Question</p>
                                    <p className="text-xs font-bold text-white bg-black/40 px-4 py-3 rounded-xl border border-white/5">
                                       {selectedClaim.found_item_challenge_question || "Ask for unique markings."}
                                     </p>
                                 </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-8">
                           <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                 <User size={12} /> Claimant Information
                               </span>
                               {selectedClaim.similarity_score !== undefined && (
                                   <div className="px-3 py-1 bg-uni-500/10 rounded-full border border-uni-500/20 text-[9px] font-bold text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                       Match Score: {(selectedClaim.similarity_score * 100).toFixed(0)}%
                                   </div>
                               )}
                           </div>
                           
                          <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 space-y-6 text-left relative overflow-hidden shadow-2xl">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500"><User size={18} /></div>
                                      <div>
                                        <p className="text-lg font-bold text-white tracking-tight">{selectedClaim.owner_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedClaim.course_department || 'Student'}</p>
                                      </div>
                                    </div>
                                    
                                    {selectedClaim.found_item_challenge_question && (
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Answer to Prompt</p>
                                            <p className="text-[13px] text-white font-medium italic">"{selectedClaim.proof_description}"</p>
                                        </div>
                                    )}

                                    {/* Data Comparison: Structural Attributes */}
                                    {(selectedClaim.found_item_attributes || selectedClaim.lost_item_attributes || selectedClaim.claim_attributes) && (
                                        <div className="pt-6 border-t border-white/5 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <SearchCheck size={14} className="text-uni-400" />
                                                    Attribute Check
                                                </p>
                                                {(() => {
                                                    const comparisonSource = selectedClaim.lost_item_attributes || selectedClaim.claim_attributes;
                                                    if (!comparisonSource) return null;
                                                    
                                                    const hasConflict = Object.keys(selectedClaim.found_item_attributes || {}).some(key => 
                                                        comparisonSource[key] && 
                                                        selectedClaim.found_item_attributes[key]?.toLowerCase() !== comparisonSource[key].toLowerCase()
                                                    );

                                                    return hasConflict ? (
                                                        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 uppercase tracking-widest">
                                                            Mismatch
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                                                            Consistent
                                                        </span>
                                                    );
                                                })()}
                                            </div>

                                            <div className="space-y-3">
                                                {Object.keys(selectedClaim.found_item_attributes || {}).map(key => {
                                                    const foundVal = selectedClaim.found_item_attributes[key];
                                                    const claimVal = selectedClaim.claim_attributes?.[key];
                                                    const lostVal = selectedClaim.lost_item_attributes?.[key];
                                                    const verifiedVal = claimVal || lostVal;
                                                    const isMismatch = verifiedVal && foundVal.toLowerCase() !== verifiedVal.toLowerCase();

                                                    return (
                                                        <div key={key} className={`flex items-center justify-between p-4 rounded-[1.25rem] border ${isMismatch ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                                                            <div className="space-y-1">
                                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{key}</p>
                                                                <div className="flex items-center gap-2">
                                                                  <p className={`text-[11px] font-bold uppercase tracking-widest ${isMismatch ? 'text-red-400 line-through opacity-50' : 'text-white'}`}>{foundVal}</p>
                                                                  {isMismatch && <ArrowRight size={10} className="text-slate-600" />}
                                                                  {isMismatch && <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">{verifiedVal}</p>}
                                                                </div>
                                                            </div>
                                                            {isMismatch ? <AlertCircle size={14} className="text-red-500" /> : verifiedVal ? <CheckCircle2 size={14} className="text-emerald-500" /> : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                          </div>
                      </div>
                  </div>

                  <button 
                      onClick={() => setClaimReviewStep(2)}
                      className="w-full bg-white text-slate-950 py-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4"
                  >
                       Compare Evidence Photos
                       <ArrowRight size={16} />
                  </button>
              </motion.div>
            )}


            {claimReviewStep === 2 && (
              <motion.div 
                key="rev2" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                      <div className="space-y-4">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                             <ShieldCheck size={14} /> Found Item (Staff Input)
                          </p>
                          <div className="aspect-video bg-slate-950 rounded-[2rem] border border-white/5 overflow-hidden relative shadow-2xl">
                              {selectedClaim.found_item_photo_url ? (
                                  <img src={selectedClaim.found_item_photo_url} className="w-full h-full object-cover" alt="Original item" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-white/[0.02]">
                                      <ImageIcon size={40} className="text-slate-800" />
                                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No primary photo</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[10px] font-bold text-uni-400 uppercase tracking-widest flex items-center gap-2 px-2">
                             <ImageIcon size={14} /> Claimant Submission
                          </p>
                          <div className="aspect-video bg-slate-950 rounded-[2rem] border border-uni-500/10 overflow-hidden relative shadow-2xl shadow-uni-600/5">
                              {selectedClaim.proof_photo_url ? (
                                  <img src={selectedClaim.proof_photo_url} className="w-full h-full object-cover" alt="Claim proof" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-white/[0.02]">
                                      <XCircle size={40} className="text-slate-800" />
                                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No proof photo provided</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-1 p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 flex flex-col justify-center space-y-4">
                           <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                               <Scale size={20} />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Review Logic</h4>
                             <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                               Analyze item context against the claimant's visual proof and account history.
                             </p>
                           </div>
                      </div>
                      <div className="lg:col-span-3 p-8 md:p-10 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ownership Profile</p>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-white tracking-tight leading-none">{selectedClaim.owner_name}</p>
                                    <p className="text-[10px] text-uni-400 font-bold uppercase tracking-widest mt-2">{selectedClaim.course_department || 'General Member'}</p>
                                </div>
                             </div>
                             <div className="md:border-l border-white/5 md:pl-10 space-y-4">
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Contact Info</p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-uni-400">
                                          <MessageSquare size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">{selectedClaim.contact_info || 'N/A'}</p>
                                    </div>
                                    {selectedClaim.guest_email && (
                                        <p className="text-[11px] text-slate-500 font-medium pl-12">{selectedClaim.guest_email}</p>
                                    )}
                                </div>
                             </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <button onClick={() => setClaimReviewStep(1)} className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back to Details</button>
                      <button 
                          onClick={() => setClaimReviewStep(3)}
                          className="flex-grow bg-white text-slate-950 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white transition-all shadow-xl"
                      >
                           Submit Decision
                      </button>
                  </div>
              </motion.div>
            )}


            {claimReviewStep === 3 && (
              <motion.div 
                key="rev3" 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 py-10"
              >
                  <div className="max-w-xl mx-auto text-center space-y-8">
                      <div className="w-20 h-20 bg-uni-500/10 rounded-3xl flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400 shadow-2xl">
                        <ThumbsUp size={32} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-3xl font-bold text-white tracking-tight">Final Decision</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                            Upon approval, the student will be notified and this item will be secured for physical collection.
                        </p>
                      </div>
                      
                      <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 flex items-center justify-center gap-10 mx-auto w-fit">
                          <div className="text-left border-r border-white/10 pr-10">
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Selected Item</p>
                               <p className="text-sm text-white font-bold tracking-tight">{selectedClaim.found_items?.item_name || selectedClaim.found_items?.title}</p>
                          </div>
                          <div className="text-left">
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Release To</p>
                               <p className="text-sm text-uni-400 font-bold tracking-tight">{selectedClaim.owner_name}</p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {selectedClaim.status === 'approved' ? (
                          <button 
                            onClick={async () => {
                                try {
                                    const { error } = await supabase.from('claims').update({ is_pickup_ready: true, status: 'approved' }).eq('id', selectedClaim.id);
                                    if (error) throw error;
                                    setSelectedClaim(null);
                                    window.location.reload(); 
                                } catch (err) { console.error('Failed to mark as ready', err); }
                            }}
                            disabled={actionLoading || selectedClaim.is_pickup_ready}
                            className={`col-span-2 group p-10 rounded-[2.5rem] border transition-all text-center space-y-5 shadow-2xl ${
                                selectedClaim.is_pickup_ready 
                                ? 'bg-slate-900 border-white/5 cursor-not-allowed opacity-50' 
                                : 'bg-emerald-600 border-emerald-500/50 hover:bg-emerald-500 hover:shadow-emerald-600/20'
                            }`}
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform">
                                <History size={24} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[12px] font-bold text-white uppercase tracking-widest">
                                    {selectedClaim.is_pickup_ready ? 'Picking Preparation Complete' : 'Prepare for Physical Pickup'}
                                </p>
                                <p className="text-[10px] text-white/60 font-medium">
                                    {selectedClaim.is_pickup_ready ? 'Student has been notified' : 'Notify the student that the item is ready for collection'}
                                </p>
                            </div>
                        </button>
                      ) : (
                        <>
                          <button 
                              onClick={() => { handleClaimReview(selectedClaim.id, 'rejected'); setSelectedClaim(null); }}
                              disabled={actionLoading}
                              className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all text-center space-y-5 shadow-inner"
                          >
                              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto group-hover:scale-110 transition-transform">
                                <XCircle size={24} />
                              </div>
                              <div className="space-y-1">
                                  <p className="text-[12px] font-bold text-white uppercase tracking-widest">Decline Claim</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Insufficient evidence</p>
                              </div>
                          </button>
                          
                          <button 
                              onClick={() => { handleClaimReview(selectedClaim.id, 'approved'); setSelectedClaim(null); }}
                              disabled={actionLoading}
                              className="group p-10 rounded-[2.5rem] bg-uni-600 border border-uni-500/20 hover:bg-uni-500 hover:shadow-2xl hover:shadow-uni-600/20 transition-all text-center space-y-5"
                          >
                              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform">
                                <ThumbsUp size={24} />
                              </div>
                              <div className="space-y-1">
                                  <p className="text-[12px] font-bold text-white uppercase tracking-widest">Approve Claim</p>
                                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Notify for collection</p>
                              </div>
                          </button>
                        </>
                      )}
                  </div>
                  
                  <div className="pt-6 text-center">
                    <button onClick={() => setClaimReviewStep(2)} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2 mx-auto">
                      <ArrowRight size={12} className="rotate-180" /> Review visual evidence
                    </button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ClaimReviewModal;
