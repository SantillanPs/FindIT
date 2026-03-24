import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../../components/ImageUpload';

const ReleaseItemModal = ({ 
  showReleaseModal, 
  setShowReleaseModal, 
  releaseStep, 
  setReleaseStep, 
  releaseForm, 
  setReleaseForm, 
  handleDirectRelease, 
  actionLoading 
}) => {
  if (!showReleaseModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowReleaseModal(null)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 border border-white/10 space-y-8 overflow-hidden bg-slate-900/50"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Item Release</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Step {releaseStep} of 5 • Item #{showReleaseModal.id}</p>
          </div>
          <div className="flex gap-1">
            {[1,1.5,2,3,4].map(s => (
              <div key={s} className={`w-6 h-1 rounded-full ${releaseStep >= s ? 'bg-uni-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {releaseStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 py-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400">
                  <i className="fa-solid fa-id-card-clip text-3xl"></i>
                </div>
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">"Identify<br/>Recipient"</h4>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest max-w-xs mx-auto">Ensure the claimant is present and their identity matches our records.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2 text-left">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Expected Recipient</p>
                  <p className="text-[11px] font-black text-white uppercase truncate">{showReleaseModal.identified_name || 'Verified Member'}</p>
                  <p className="text-[9px] font-serif text-uni-400 italic">"{showReleaseModal.identified_student_id || 'Institutional ID'}"</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2 text-left flex flex-col justify-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Required Documents</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Student ID or Valid Gov ID</p>
                </div>
              </div>
              
              <button 
                onClick={() => setReleaseStep(1.5)}
                className="w-full bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all"
              >
                ID Verified, Next →
              </button>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Please follow standard security procedures</p>
            </motion.div>
          )}

          {releaseStep === 1.5 && (
            <motion.div 
              key="step1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 py-6"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400">
                  <i className="fa-solid fa-user-shield text-3xl"></i>
                </div>
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">"Ownership<br/>Challenge"</h4>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest max-w-xs mx-auto">Verify the recipient's knowledge of the item's secret details.</p>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-uni-500/10 rounded-[2.5rem] border border-uni-500/20 space-y-4">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest">Challenge Question</p>
                    <p className="text-[14px] font-black text-white uppercase italic leading-tight">
                        {showReleaseModal.challenge_question || "Ask for any unique markings or secrets on the item."}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-uni-500/10 text-left">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Answer / Secret Note</p>
                    <p className="text-[11px] font-bold text-slate-300">
                        {showReleaseModal.verification_note || "No specific secret note provided during intake."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setReleaseStep(1)} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                   <button 
                    onClick={() => setReleaseStep(2)} 
                    className="flex-grow bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all"
                   >
                    Passed Challenge →
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {releaseStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 py-6"
            >
              <div className="text-center space-y-4 mb-4">
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">"Confirm<br/>Release"</h4>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Double-check the logging details for the central audit.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1">Confirm Recipient Name</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all tracking-widest"
                    value={releaseForm.name}
                    onChange={(e) => setReleaseForm({...releaseForm, name: e.target.value})}
                    placeholder="FullName..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1">Institutional ID / Ref Number</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all tracking-widest"
                    value={releaseForm.id_number}
                    onChange={(e) => setReleaseForm({...releaseForm, id_number: e.target.value})}
                    placeholder="e.g. 2024-XXXXX"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setReleaseStep(1)} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                <button 
                  disabled={!releaseForm.name || !releaseForm.id_number}
                  onClick={() => setReleaseStep(3)} 
                  className="flex-grow bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white disabled:opacity-20 transition-all"
                >
                  Next: Visual Proof →
                </button>
              </div>
            </motion.div>
          )}

          {releaseStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 py-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400">
                  <i className="fa-solid fa-camera-retro text-3xl"></i>
                </div>
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">"Photo<br/>Verification"</h4>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest max-w-xs mx-auto">Take a photo of the recipient for our digital audit logs.</p>
              </div>

              <div className="max-w-xs mx-auto text-black">
                <ImageUpload 
                  value={releaseForm.photo_url}
                  onUploadSuccess={(url) => setReleaseForm({...releaseForm, photo_url: url})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setReleaseStep(2)} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                <button 
                  disabled={!releaseForm.photo_url}
                  onClick={() => setReleaseStep(4)} 
                  className="flex-grow bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-black disabled:opacity-20 transition-all border border-black/5"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {releaseStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12 py-10 text-center"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <i className="fa-solid fa-handshake text-4xl text-green-500"></i>
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">"Complete Release"</h4>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Handover details and visual proof are recorded.</p>
                </div>
              </div>

              <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4 text-left">
                    {releaseForm.photo_url && (
                      <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0">
                        <img src={releaseForm.photo_url} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Logged Recipient</p>
                      <p className="text-[13px] font-black text-white uppercase italic leading-tight">{releaseForm.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reference</p>
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest">{releaseForm.id_number}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Authorized By</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-uni-400"></i> Admin System Terminal
                  </p>
                </div>
              </div>

              <button 
                onClick={handleDirectRelease}
                disabled={actionLoading}
                className="w-full bg-green-600 text-white py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] hover:bg-green-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <i className="fa-solid fa-key text-xl"></i>
                    Seal & Log Release
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReleaseItemModal;
