import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  Loader2,
  AlertCircle,
  FileSearch,
  Check,
  XCircle,
  MessageSquare,
  History
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '../../../lib/supabase';

const QUICK_REASONS = [
  "Blurry or unreadable document",
  "Institutional ID mismatch",
  "Wrong document type submitted",
  "Document is expired"
];

const AccountReviewModal = ({ isOpen, onClose, student, onComplete }) => {
  const [step, setStep] = useState(1);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Reset state when opening or switching students
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setShowRejectionForm(false);
      setRejectionReason('');
      setError(null);
    }
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.rpc('rpc_verify_student_account', {
        p_user_id: student.id,
        p_is_approved: true
      });

      if (updateError) throw updateError;
      
      if (onComplete) onComplete();
      onClose();
    } catch (err) {
      console.error('Verification failed', err);
      setError('System failure while finalizing verification. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for denial.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.rpc('rpc_verify_student_account', {
        p_user_id: student.id,
        p_is_approved: false,
        p_feedback: rejectionReason.trim()
      });

      if (updateError) throw updateError;
      
      onComplete();
      onClose();
    } catch (err) {
      console.error('Rejection failed', err);
      setError('Failed to log rejection. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { title: 'Account Details', icon: User },
    { title: 'Membership Proof', icon: Eye },
    { title: 'Final Approval', icon: ShieldCheck }
  ];

  const currentStep = steps[step - 1];

  // Using Portals to escape the parent's CSS positioning context (Trapped by backdrop-blur)
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl pointer-events-auto"
      />

      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 15 }}
        className="relative w-full max-w-xl bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
      >
        {/* Progress System */}
        <div className="flex w-full h-1.5 p-0.5 gap-1 bg-white/5">
           {[1, 2, 3].map(s => (
             <div 
                key={s} 
                className={`flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-uni-500' : 'bg-white/5'}`} 
             />
           ))}
        </div>

        <header className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6 flex justify-between items-start">
            <div className="flex items-center gap-4 md:gap-5">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-uni-400">
                  <currentStep.icon size={20} className="md:w-[22px] md:h-[22px]" />
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none">Approval Stage {step}</p>
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{showRejectionForm ? 'Denial Feedback' : currentStep.title}</h2>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-10">
           <AnimatePresence mode="wait">
             {showRejectionForm ? (
                <motion.div 
                  key="rejection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Administrative Notes</label>
                         <span className="text-[9px] font-medium text-slate-600">Visible to student</span>
                      </div>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide detailed feedback on why verification was denied..."
                        className="w-full h-32 bg-slate-950/50 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-rose-500/30 transition-all resize-none"
                      />
                   </div>

                   <div className="flex flex-col gap-3">
                      <Button 
                        onClick={handleReject}
                        disabled={loading || !rejectionReason.trim()}
                        className="h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 disabled:opacity-20"
                      >
                         {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                               Confirm Denial
                               <XCircle size={14} />
                            </>
                         )}
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => setShowRejectionForm(false)}
                        className="h-12 text-slate-500 hover:text-white"
                      >
                         Back to Review
                      </Button>
                   </div>
                </motion.div>
             ) : (
             <>
             {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                   <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-5 md:p-7 space-y-6 md:space-y-7">
                      <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Profile Information</span>
                            <div className="space-y-1">
                               <p className="text-[17px] md:text-lg font-bold text-white tracking-tight">{student.full_name || `${student.first_name} ${student.last_name}`}</p>
                               <p className="text-[12px] md:text-sm font-medium text-slate-400">{student.email}</p>
                            </div>
                         </div>
                         <div className="h-px bg-white/5" />
                         <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Institutional ID</span>
                            <p className="text-[17px] md:text-lg font-bold text-uni-500 tracking-wider">
                                {student.student_id_number || 'No ID Provided'}
                            </p>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-500/80 font-medium leading-relaxed">
                        Verify that these details are official before approving membership.
                      </p>
                   </div>
                </motion.div>
             )}

             {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                   <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 group">
                      {student.verification_proof_url ? (
                          <>
                            <img 
                               src={student.verification_proof_url} 
                               alt="Enrollment Proof" 
                               className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <a 
                                 href={student.verification_proof_url} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="h-12 px-6 bg-white text-slate-950 rounded-xl flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all shadow-2xl"
                               >
                                  <FileSearch size={16} />
                                  Full resolution
                               </a>
                            </div>
                          </>
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                             <Eye size={48} className="mb-4 opacity-10" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">No Document Found</p>
                          </div>
                      )}
                   </div>
                   <div className="space-y-2">
                       <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed px-2">
                          "Institutional student cards, enrollment forms, or registration slips are valid proof. Check for date and seal."
                       </p>
                   </div>
                </motion.div>
             )}

             {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-8"
                >
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-uni-500/10 border border-uni-500/20 rounded-full flex items-center justify-center">
                      <ShieldCheck size={40} className="text-uni-400 md:w-12 md:h-12" />
                   </div>
                   <div className="space-y-2 max-w-sm px-4">
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight italic uppercase">Account Approved</h3>
                      <p className="text-[13px] md:text-sm text-slate-500 font-medium">By confirming, you authorize this account as a registered member of the platform.</p>
                   </div>
                   
                   {error && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500">
                         <AlertCircle size={18} />
                         <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                      </div>
                   )}

                   <div className="w-full flex flex-col gap-4 px-2">
                      <Button 
                        onClick={handleVerify}
                        disabled={loading}
                        className="h-16 w-full bg-white text-slate-950 hover:bg-uni-500 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl transition-all group"
                      >
                         {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                               Finalize Approval
                               <Check size={18} className="ml-3 group-hover:scale-125 transition-transform" />
                            </>
                         )}
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <Button 
                           variant="ghost"
                           onClick={() => setShowRejectionForm(true)}
                           disabled={loading}
                           className="h-12 text-rose-500 hover:bg-rose-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                         >
                            Deny Access
                         </Button>
                         <Button 
                           variant="ghost"
                           onClick={() => setStep(2)}
                           disabled={loading}
                           className="h-12 text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-widest bg-white/5 sm:bg-transparent rounded-xl"
                         >
                            Re-Review Proof
                         </Button>
                      </div>
                   </div>
                </motion.div>
             )}
             </>
             )}
           </AnimatePresence>
        </div>

        {step < 3 && !showRejectionForm && (
           <footer className="px-6 md:px-8 py-6 md:py-8 bg-slate-950/40 border-t border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <Button 
                 variant="ghost"
                 onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                 className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white order-2 sm:order-1"
              >
                 {step === 1 ? 'Cancel Approval' : 'Previous'}
              </Button>

              <Button 
                 onClick={() => setStep(step + 1)}
                 disabled={step === 2 && !student.verification_proof_url}
                 className="h-14 md:h-14 px-10 bg-uni-600 text-white hover:bg-uni-700 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl group disabled:opacity-30 disabled:grayscale transition-all order-1 sm:order-2"
              >
                 {step === 1 ? 'Review Proof' : 'Approval Stage'}
                 <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
           </footer>
        )}
      </motion.div>
    </div>,
    document.body
  );
};

export default AccountReviewModal;
