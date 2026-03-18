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
                               <div className="flex justify-between items-start">
                                  <h4 className="text-2xl font-black text-white uppercase italic">{selectedClaim.found_item_name || 'Electronics'}</h4>
                                  {selectedClaim.found_item_photo_url && (
                                     <div className="w-10 h-10 rounded-lg bg-uni-500/10 border border-uni-500/20 flex items-center justify-center text-uni-400">
                                        <i className="fa-solid fa-image text-xs"></i>
                                     </div>
                                  )}
                               </div>
                               <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span><i className="fa-solid fa-location-dot text-uni-500 mr-2"></i> {selectedClaim.found_item_location || 'Zone Not Specified'}</span>
                                  <span><i className="fa-solid fa-calendar text-uni-400 mr-2"></i> {selectedClaim.found_item_time ? new Date(selectedClaim.found_item_time).toLocaleDateString() : 'Date Unknown'}</span>
                               </div>
                               <p className="text-sm text-slate-500 font-bold leading-relaxed">{selectedClaim.found_item_description || 'No detailed description provided.'}</p>
                          </div>
                      </div>
                      <div className="space-y-6">
                           <span className="text-[10px] font-black text-uni-400 uppercase tracking-widest block">Claim Detail</span>
                          <div className="p-6 bg-uni-500/5 rounded-3xl border border-uni-500/20 space-y-4 text-left">
                               <p className="text-lg text-white font-black italic leading-tight">"{selectedClaim.proof_description}"</p>
                               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Matching score</p>
                                  <p className="text-[11px] font-black text-uni-400">
                                    {selectedClaim.similarity_score ? `AI Conflict Match: ${(selectedClaim.similarity_score * 100).toFixed(0)}%` : 'High Confidence'}
                                  </p>
                               </div>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => setClaimReviewStep(2)}
                      className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl group flex items-center justify-center gap-4"
                  >
                       Compare Evidence Photos
                       <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </button>
              </motion.div>
            )}

            {claimReviewStep === 2 && (
              <motion.div 
                key="rev2" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      {/* Photo Comparison Side-by-Side */}
                      <div className="space-y-4">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Found Item (Registry)</p>
                          <div className="aspect-video bg-slate-950 rounded-[2rem] border border-white/10 overflow-hidden relative group shadow-2xl">
                              {selectedClaim.found_item_photo_url ? (
                                  <img src={selectedClaim.found_item_photo_url} className="w-full h-full object-cover" alt="Original item" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-20 bg-red-500/5">
                                      <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
                                      <p className="text-[10px] font-black uppercase tracking-widest">Photo missing from report</p>
                                  </div>
                              )}
                              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
                                 Verification Reference
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[9px] font-black text-uni-400 uppercase tracking-[0.3em]">Claimant Proof Photo</p>
                          <div className="aspect-video bg-slate-950 rounded-[2rem] border border-uni-500/10 overflow-hidden relative group shadow-2xl">
                              {selectedClaim.proof_photo_url ? (
                                  <img src={selectedClaim.proof_photo_url} className="w-full h-full object-cover" alt="Claim proof" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                      <i className="fa-solid fa-image text-4xl"></i>
                                      <p className="text-[10px] font-black uppercase tracking-widest">No photo provided by claimant</p>
                                  </div>
                              )}
                              <div className="absolute top-4 left-4 px-3 py-1 bg-uni-600/60 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
                                 Submitted Evidence
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                      <div className="md:col-span-1 p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                           <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Verification Logic</p>
                          <p className="text-[11px] text-white font-bold leading-relaxed">
                            Compare the Found Item photo against the Claimant's proof. 
                            {selectedClaim.id_photo_url && (
                              <span className="block mt-2 text-uni-400">✓ This claim also includes a copy of their ID/Physical Proof.</span>
                            )}
                          </p>
                      </div>
                      <div className="md:col-span-2 p-6 bg-slate-950 rounded-[2rem] border border-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Claimant Account</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-white font-black uppercase tracking-tight">{selectedClaim.owner_name}</p>
                                    <p className="text-[9px] text-uni-400 font-black uppercase tracking-widest">{selectedClaim.course_department || 'General Member'}</p>
                                </div>
                             </div>
                             <div className="md:border-l border-white/5 md:pl-8">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Contact Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <i className={`${selectedClaim.contact_method === 'Facebook' ? 'fa-brands fa-facebook' : 'fa-solid ' + (selectedClaim.contact_method === 'Phone' ? 'fa-mobile-screen' : 'fa-paper-plane')} text-uni-400 text-xs`}></i>
                                        <p className="text-[11px] text-white font-black uppercase tracking-widest">{selectedClaim.contact_info || 'N/A'}</p>
                                    </div>
                                    {selectedClaim.guest_email && (
                                        <p className="text-[9px] text-slate-500 font-bold italic lowercase">{selectedClaim.guest_email}</p>
                                    )}
                                </div>
                             </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setClaimReviewStep(1)} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back to Details</button>
                      <button 
                          onClick={() => setClaimReviewStep(3)}
                          className="flex-grow bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95"
                      >
                           Submit Decision →
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
                      {selectedClaim.status === 'approved' ? (
                          <button 
                            onClick={async () => {
                                try {
                                    await apiClient.patch(`/admin/claims/${selectedClaim.id}/mark-ready`);
                                    setSelectedClaim(null);
                                    window.location.reload(); // Refresh to sync stats
                                } catch (err) { console.error(err); }
                            }}
                            disabled={actionLoading || selectedClaim.is_pickup_ready}
                            className={`col-span-2 group p-8 rounded-[2.5rem] border shadow-2xl transition-all text-center space-y-4 ${
                                selectedClaim.is_pickup_ready 
                                ? 'bg-slate-900 border-white/5 cursor-not-allowed' 
                                : 'bg-green-600 border-green-600 shadow-green-600/20 hover:bg-green-500'
                            }`}
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform">
                                <i className={`fa-solid ${selectedClaim.is_pickup_ready ? 'fa-box-open' : 'fa-truck-ramp-box'}`}></i>
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest">
                                    {selectedClaim.is_pickup_ready ? 'Officially Ready for Pickup' : 'Mark as Ready for Pickup'}
                                </p>
                                <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
                                    {selectedClaim.is_pickup_ready ? 'Student will be notified to collect the item' : 'Verify the physical item is ready for handover'}
                                </p>
                            </div>
                        </button>
                      ) : (
                        <>
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
                        </>
                      )}
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
