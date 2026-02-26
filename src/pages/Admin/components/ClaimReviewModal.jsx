import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        onClick={() => setSelectedClaim(null)}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="glass-panel w-full max-w-4xl rounded-[3rem] overflow-hidden relative z-10 border border-white/10 shadow-2xl flex flex-col max-h-[90vh] bg-slate-900/50"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                  <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
              </div>
              <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Claim Verification Engine</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Case #{selectedClaim.id.toString().padStart(5, '0')} • Status: Manual Review required</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
             {[1,2,3].map(s => (
                 <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${claimReviewStep === s ? 'w-12 bg-uni-400' : 'w-4 bg-white/10'}`} />
             ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {claimReviewStep === 1 && (
              <motion.div 
                key="rev1" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Original Found Item</span>
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 text-left">
                               <h4 className="text-2xl font-black text-white uppercase italic">{selectedClaim.found_item_name || 'Electronics'}</h4>
                               <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span><i className="fa-solid fa-location-dot text-uni-500"></i> {selectedClaim.found_item_location || 'Unknown'}</span>
                                  <span><i className="fa-solid fa-calendar text-uni-400"></i> {new Date(selectedClaim.found_item_time).toLocaleDateString()}</span>
                               </div>
                               <p className="text-sm text-slate-500 font-bold leading-relaxed">{selectedClaim.found_item_description}</p>
                          </div>
                      </div>
                      <div className="space-y-6">
                           <span className="text-[10px] font-black text-uni-400 uppercase tracking-widest block">Claim Detail</span>
                          <div className="p-6 bg-uni-500/5 rounded-3xl border border-uni-500/20 space-y-4 text-left">
                               <p className="text-lg text-white font-black italic leading-tight">"{selectedClaim.proof_description}"</p>
                               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Matching score</p>
                                  <p className="text-[11px] font-black text-uni-400">High Confidence</p>
                               </div>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => setClaimReviewStep(2)}
                      className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl"
                  >
                       View Photos →
                  </button>
              </motion.div>
            )}

            {claimReviewStep === 2 && (
              <motion.div 
                key="rev2" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                      <div className="md:col-span-2 aspect-video bg-slate-900 rounded-[2rem] border border-white/10 overflow-hidden relative group">
                          {selectedClaim.proof_photo_url ? (
                              <img src={selectedClaim.proof_photo_url} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                  <i className="fa-solid fa-image text-6xl"></i>
                                  <p className="text-[10px] font-black uppercase tracking-widest">No photo evidence provided</p>
                              </div>
                          )}
                      </div>
                      <div className="space-y-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Proof Summary</p>
                              <p className="text-[12px] text-white font-bold leading-relaxed">The student provided {selectedClaim.proof_photo_url ? 'photo evidence' : 'descriptive text only'}. Compare this against any known private marks.</p>
                          </div>
                          <div className="p-6 bg-slate-900 rounded-2xl border border-white/5 space-y-4">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Claimant Identity</p>
                              <div className="space-y-1">
                                  <p className="text-[10px] text-white font-black uppercase tracking-widest">{selectedClaim.guest_full_name || 'Verified Student'}</p>
                                  <p className="text-[8px] text-uni-400 font-black uppercase tracking-widest">{selectedClaim.course_department || 'No department info'}</p>
                              </div>
                              <div className="pt-3 border-t border-white/5 space-y-1">
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Contact Preference</p>
                                  <div className="flex items-center gap-2">
                                      <i className={`fa-brands ${selectedClaim.contact_method === 'Facebook' ? 'fa-facebook' : 'fa-solid ' + (selectedClaim.contact_method === 'Phone' ? 'fa-phone' : 'fa-envelope')} text-slate-400 text-[10px]`}></i>
                                      <p className="text-[10px] text-white font-bold">{selectedClaim.contact_info || 'N/A'}</p>
                                  </div>
                                  {selectedClaim.guest_email && (
                                      <p className="text-[8px] text-slate-600 font-bold italic">{selectedClaim.guest_email}</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => setClaimReviewStep(1)} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Back</button>
                      <button 
                          onClick={() => setClaimReviewStep(3)}
                          className="flex-grow bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl"
                      >
                           Decide Claim →
                      </button>
                  </div>
              </motion.div>
            )}

            {claimReviewStep === 3 && (
              <motion.div 
                key="rev3" 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 py-10 text-center"
              >
                  <div className="max-w-md mx-auto space-y-6">
                      <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-3xl text-uni-400">⚖️</div>
                       <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Submit Decision</h4>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                          Once approved, the student will be notified to visit the office for collection. If rejected, they can clarify their claim.
                      </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <button 
                          onClick={() => {
                              handleClaimReview(selectedClaim.id, 'rejected');
                              setSelectedClaim(null);
                          }}
                          disabled={actionLoading}
                          className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-left space-y-4"
                      >
                          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-xmark text-xl"></i>
                          </div>
                          <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-widest">Reject Claim</p>
                              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">InSufficient proof provided</p>
                          </div>
                      </button>
                      
                      <button 
                          onClick={() => {
                              handleClaimReview(selectedClaim.id, 'approved');
                              setSelectedClaim(null);
                          }}
                          disabled={actionLoading}
                          className="group p-8 rounded-[2.5rem] bg-uni-600 border border-uni-600 shadow-2xl shadow-uni-600/20 hover:bg-uni-500 transition-all text-left space-y-4"
                      >
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-check text-xl"></i>
                          </div>
                          <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-widest">Approve Claim</p>
                              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Mark as ready for collection</p>
                          </div>
                      </button>
                  </div>

                  <button onClick={() => setClaimReviewStep(2)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">Review evidence again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ClaimReviewModal;
