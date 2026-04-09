import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  ShieldCheck, 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  FileText,
  CreditCard,
  MessageCircleQuestion,
  Trophy
} from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';
import { Badge } from "@/components/ui/badge";

/**
 * ReleaseItemModal - Premium Professional (Pro Max)
 * - Human-centric release workflow.
 * - No "Ownership Challenge" or "Admin Terminal" jargon.
 * - Sleek, professional university utility feel.
 */
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
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 relative z-10 shadow-3xl space-y-8 overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold text-white tracking-tight">Item Release</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Step {Math.floor(releaseStep)} of 4 • Item #{showReleaseModal.id}
            </p>
          </div>
          <div className="flex gap-1.5 pt-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${releaseStep >= s ? 'bg-uni-500 shadow-[0_0_8px_rgba(var(--uni-500-rgb),0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {releaseStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 py-4 text-center"
            >
              <div className="space-y-5">
                <div className="w-20 h-20 bg-uni-500/10 rounded-3xl flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400 shadow-2xl">
                  <UserCheck size={36} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-bold text-white tracking-tight">Verify Claimant</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Ensure the claimant's identity matches the official ownership records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-8 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-3 text-left relative overflow-hidden group shadow-inner">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Identified Owner</p>
                  <p className="text-lg font-bold text-white tracking-tight">{showReleaseModal.identified_name || 'Registered Member'}</p>
                  <div className="flex items-center gap-2 text-uni-400">
                    <CreditCard size={12} />
                    <p className="text-[11px] font-bold uppercase tracking-widest">{showReleaseModal.identified_student_id || 'Institutional ID'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-amber-200/60">
                  <ShieldCheck size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-tight">Valid Identification Required</p>
                </div>
              </div>
              
              <button 
                onClick={() => setReleaseStep(1.5)}
                className="w-full bg-white text-slate-950 py-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                Identification Verified
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {releaseStep === 1.5 && (
            <motion.div 
              key="step1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 py-4"
            >
              <div className="text-center space-y-5">
                <div className="w-20 h-20 bg-uni-500/10 rounded-3xl flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400 shadow-2xl">
                  <MessageCircleQuestion size={36} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-bold text-white tracking-tight">Final Verification</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Confirm the recipient knows the private details of the item.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-uni-500/5 rounded-[2.5rem] border border-uni-500/10 space-y-6">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <MessageCircleQuestion size={12} className="text-uni-400" />
                      <p className="text-[9px] font-bold text-uni-400 uppercase tracking-widest">Verification Question</p>
                    </div>
                    <p className="text-[15px] font-bold text-white leading-tight">
                        "{showReleaseModal.challenge_question || "Ask for unique markings or internal details."}"
                    </p>
                  </div>
                  <div className="pt-6 border-t border-uni-500/10 text-left space-y-2">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Internal Staff Note</p>
                    <p className="text-[12px] font-medium text-slate-300 italic pl-4 border-l border-uni-500/20">
                        {showReleaseModal.verification_note || "No specific verification note provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <button onClick={() => setReleaseStep(1)} className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                   <button 
                    onClick={() => setReleaseStep(2)} 
                    className="flex-grow bg-white text-slate-950 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white transition-all shadow-xl"
                   >
                    Verified Details
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {releaseStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 py-4"
            >
              <div className="text-center space-y-5">
                <div className="w-20 h-20 bg-uni-500/10 rounded-3xl flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400 shadow-2xl">
                  <FileText size={36} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-bold text-white tracking-tight">Log Release</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Confirm the recipient's details for official documentation.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest ml-1 uppercase">Recipient Full Name</label>
                  <input 
                    type="text"
                    className="w-full h-16 bg-slate-950 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:border-uni-500 outline-none transition-all placeholder:text-slate-700"
                    value={releaseForm.name}
                    onChange={(e) => setReleaseForm({...releaseForm, name: e.target.value})}
                    placeholder="Enter full legal name..."
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest ml-1 uppercase">ID / Reference Number</label>
                  <input 
                    type="text"
                    className="w-full h-16 bg-slate-950 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:border-uni-500 outline-none transition-all placeholder:text-slate-700"
                    value={releaseForm.id_number}
                    onChange={(e) => setReleaseForm({...releaseForm, id_number: e.target.value})}
                    placeholder="e.g. 2024-XXXXX"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => setReleaseStep(1.5)} className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                <button 
                  disabled={!releaseForm.name || !releaseForm.id_number}
                  onClick={() => setReleaseStep(3)} 
                  className="flex-grow bg-white text-slate-950 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white disabled:opacity-20 transition-all shadow-xl"
                >
                  Continue to Photo
                </button>
              </div>
            </motion.div>
          )}

          {releaseStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 py-4 text-center"
            >
              <div className="space-y-5">
                <div className="w-20 h-20 bg-uni-500/10 rounded-3xl flex items-center justify-center mx-auto border border-uni-500/20 text-uni-400 shadow-2xl">
                  <Camera size={36} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-bold text-white tracking-tight">Processing Photo</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    A photo of the recipient is required for the audit record.
                  </p>
                </div>
              </div>

              <div className="max-w-xs mx-auto">
                <ImageUpload 
                  value={releaseForm.photo_url}
                  onUploadSuccess={(url) => setReleaseForm({...releaseForm, photo_url: url})}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => setReleaseStep(2)} className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back</button>
                <button 
                  disabled={!releaseForm.photo_url}
                  onClick={() => setReleaseStep(4)} 
                  className="flex-grow bg-white text-slate-950 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-uni-600 hover:text-white disabled:opacity-20 transition-all shadow-xl"
                >
                  Review Summary
                </button>
              </div>
            </motion.div>
          )}

          {releaseStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10 py-6 text-center"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-400 shadow-2xl">
                  <Trophy size={48} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-bold text-white tracking-tight">Final Confirmation</h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Review the handover details before finalizing.</p>
                </div>
              </div>

              <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                  <div className="flex items-center gap-5 text-left">
                    {releaseForm.photo_url && (
                      <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <img src={releaseForm.photo_url} className="w-full h-full object-cover" alt="Recipient" />
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Recipient Name</p>
                      <p className="text-lg font-bold text-white tracking-tight">{releaseForm.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">ID Reference</p>
                    <Badge variant="outline" className="bg-uni-500/10 text-uni-400 border-uni-500/20 text-[10px] font-bold px-3 py-1">
                      {releaseForm.id_number}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} /> Ready for Release
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 text-right">Office Activity</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Manual Staff Handover</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleDirectRelease}
                disabled={actionLoading}
                className="w-full bg-emerald-600 text-white py-8 rounded-[2rem] font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-emerald-600/20"
              >
                {actionLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    Confirm Item Release
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
