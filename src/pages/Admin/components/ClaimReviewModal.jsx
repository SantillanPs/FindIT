import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { imageCache } from '../../../lib/imageCache';
import { 
  ShieldCheck, 
  AlertCircle,
  AlertTriangle,
  HelpCircle,
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
  X,
  Lock,
  CalendarClock,
  ArrowLeft
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

/**
 * ClaimReviewModal - Premium Professional (Pro Max)
 * Step 1: Review evidence + approve/decline
 * Step 2: Set pickup schedule (after approve)
 */
const ClaimReviewModal = ({ 
  selectedClaim, 
  setSelectedClaim, 
  claimReviewStep, 
  setClaimReviewStep, 
  handleClaimReview, 
  actionLoading 
}) => {
  const [itemImgError, setItemImgError] = useState(selectedClaim ? imageCache.isFailed(selectedClaim.item_photo_url) : false);
  const [proofImgError, setProofImgError] = useState(selectedClaim ? imageCache.isFailed(selectedClaim.proof_photo_url) : false);
  
  const isIdentifiedClaim = selectedClaim?.is_identified_claim || (selectedClaim?.found_item_identified_id && selectedClaim?.student_id);
  const isGuestRegistryClaim = selectedClaim?.metadata?.source === 'Institutional Registry';
  const isAutoVerified = selectedClaim?.is_auto_match || (selectedClaim?.metadata?.auto_verified);
  
  // Schedule state for step 2
  const [showScheduleStep, setShowScheduleStep] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [fullscreenImg, setFullscreenImg] = useState(null);

  if (!selectedClaim) return null;

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleApproveClick = () => {
    if (isIdentifiedClaim) {
      // Identified claims skip scheduling for maximum speed
      handleClaimReview(selectedClaim, 'approved', null);
      setSelectedClaim(null);
    } else {
      setShowScheduleStep(true);
    }
  };

  const handleConfirmSchedule = () => {
    let pickupTime = null;
    if (scheduledDate && scheduledTime) {
      pickupTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    }
    handleClaimReview(selectedClaim, 'approved', pickupTime);
    setSelectedClaim(null);
  };

  const handleDecline = () => {
    handleClaimReview(selectedClaim, 'rejected');
    setSelectedClaim(null);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
        onClick={() => setSelectedClaim(null)}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden relative z-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh]"
      >
        {/* Absolute Close Button */}
        <button 
            onClick={() => setSelectedClaim(null)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#1e293b] border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all z-50 group active:scale-90 shadow-xl"
        >
            <X size={16} className="transition-transform duration-300" />
        </button>

        {/* Header Section */}
        <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6 flex items-start gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-inner group overflow-hidden relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-uni-500/20 to-transparent opacity-50" />
                {showScheduleStep ? (
                  <CalendarClock size={20} className="relative z-10 sm:scale-110" />
                ) : (
                  <SearchCheck size={20} className="relative z-10 sm:scale-110" />
                )}
            </div>
            
            <div className="flex-1 space-y-1 sm:space-y-1.5 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate pr-10">
                  {showScheduleStep ? 'Schedule Pickup' : (isIdentifiedClaim ? 'Verify Identity Claim' : 'Review Claim')}
                </h3>
                
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest shrink-0">
                            ID #{selectedClaim.id.toString().padStart(5, '0')}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">
                            {showScheduleStep ? 'STEP 2 OF 2' : 'STEP 1 OF 2'}
                        </span>
                    </div>
                    
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${isIdentifiedClaim ? 'text-sky-400' : 'text-uni-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${showScheduleStep ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : (isIdentifiedClaim ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'bg-uni-400 shadow-[0_0_8px_rgba(14,165,233,0.6)]')} animate-pulse`} />
                        {showScheduleStep ? 'APPROVED — SET SCHEDULE' : (isIdentifiedClaim ? 'INSTITUTIONAL REGISTRY MATCH' : 'PENDING RESOLUTION')}
                    </span>
                </div>
            </div>
        </div>

        {/* Context Strip (Mini Core) */}
        <div className="px-3 py-2 mx-4 sm:px-4 sm:py-3 sm:mx-6 bg-slate-800/50 border border-white/5 rounded-xl flex items-center gap-3 sm:gap-4 group transition-all cursor-default shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#0F172A] border border-white/5 shadow-2xl relative shrink-0">
                {selectedClaim.item_photo_url && !itemImgError ? (
                    <img 
                        src={selectedClaim.item_photo_url} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        onError={() => { imageCache.markFailed(selectedClaim.item_photo_url); setItemImgError(true); }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-[#0F172A]">
                        <ImageIcon size={24} />
                    </div>
                )}
            </div>
            
            <div className="min-w-0 flex-1 py-1">
                <div className="flex items-center gap-2 mb-1.5">
                    <Badge className="bg-uni-500/10 text-uni-400 border-uni-400/20 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-md">
                        {selectedClaim.item_category}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {selectedClaim.item_location}
                    </span>
                </div>
                {selectedClaim.item_title.toLowerCase() !== selectedClaim.item_category.toLowerCase() && (
                  <h4 className="text-base font-bold text-white tracking-tight leading-none group-hover:text-uni-400 transition-colors">
                      {selectedClaim.item_title}
                  </h4>
                )}
            </div>
        </div>

        <AnimatePresence mode="wait">
          {!showScheduleStep ? (
            /* ── STEP 1: Evidence Review ── */
            <motion.div
              key="review-step"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-grow overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-6 pb-24 sm:pb-4">
                  
                  {/* Visual Evidence Stack */}
                  <div className="space-y-3">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Visual Evidence</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                           {/* Original Item */}
                           <div 
                             onClick={() => selectedClaim.item_photo_url && !itemImgError && setFullscreenImg({ url: selectedClaim.item_photo_url, label: 'System Record' })}
                             className={`group/img relative aspect-video sm:aspect-square rounded-xl border border-white/10 overflow-hidden shadow-xl bg-[#0F172A] ${selectedClaim.item_photo_url && !itemImgError ? 'cursor-zoom-in' : ''}`}
                           >
                                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[8px] font-black text-white uppercase tracking-widest shadow-md">
                                     System Record
                                </div>
                                {selectedClaim.item_photo_url && !itemImgError ? (
                                      <img src={selectedClaim.item_photo_url} alt="Original item" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" onError={() => { imageCache.markFailed(selectedClaim.item_photo_url); setItemImgError(true); }} />
                                ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-white/[0.02]">
                                          <ImageIcon size={24} className="text-slate-800" />
                                          <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No Record Photo</p>
                                      </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                     <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg scale-90 group-hover/img:scale-100 transition-transform">Click to Expand</span>
                                </div>
                           </div>
                           {/* Proof Item */}
                           <div 
                             onClick={() => selectedClaim.proof_photo_url && !proofImgError && setFullscreenImg({ url: selectedClaim.proof_photo_url, label: isIdentifiedClaim ? 'Institutional ID Card' : 'Claimant Proof' })}
                             className={`group/img relative aspect-video sm:aspect-square rounded-xl border border-white/10 overflow-hidden shadow-xl bg-slate-900 ${selectedClaim.proof_photo_url && !proofImgError ? 'cursor-zoom-in' : ''}`}
                           >
                                 <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 backdrop-blur-md rounded-md border text-[8px] font-black uppercase tracking-widest shadow-md ${isIdentifiedClaim ? 'bg-sky-500/20 border-sky-500/30 text-sky-400' : 'bg-uni-500/20 border-uni-500/30 text-uni-400'}`}>
                                      {isIdentifiedClaim ? 'Institutional ID Card' : 'Claimant Proof'}
                                 </div>
                                 {selectedClaim.proof_photo_url && !proofImgError ? (
                                       <img src={selectedClaim.proof_photo_url} alt="Claim proof" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" onError={() => { imageCache.markFailed(selectedClaim.proof_photo_url); setProofImgError(true); }} />
                                 ) : (
                                       <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-white/[0.02]">
                                           <XCircle size={24} className="text-slate-800" />
                                           <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No ID/Proof Uploaded</p>
                                       </div>
                                 )}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                     <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg scale-90 group-hover/img:scale-100 transition-transform">Click to Expand</span>
                                 </div>
                            </div>
                       </div>
                  </div>

                   {/* Authentication Check (Forensic Interview OR Identity Gate) */}
                   <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                {isIdentifiedClaim ? 'Identity Verification Gate' : 'Forensic Interview'}
                           </p>
                           <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest border ${isIdentifiedClaim ? 'bg-sky-500/5 text-sky-400 border-sky-500/20' : 'bg-uni-500/5 text-uni-400 border-uni-500/20'}`}>
                              {isIdentifiedClaim ? 'Registry Match' : 'Mandatory Gate'}
                           </Badge>
                        </div>
                        
                        <div className="space-y-3">
                             {isIdentifiedClaim ? (
                                <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.02] p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 shrink-0">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Official Owner Match</p>
                                            <p className="text-[12px] font-bold text-white leading-snug">
                                                The item was logged with the name: <span className="text-sky-400">{selectedClaim.item_identified_name || selectedClaim.owner_name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Verification Strategy</p>
                                            <Lock size={10} className="text-slate-600" />
                                        </div>
                                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                                            {isAutoVerified 
                                              ? "System auto-matched the Student ID. Claimant was logged in and identity is confirmed." 
                                              : "Institutional Registry Claim. Admin must manually verify that the uploaded ID card matches the identified owner's name above."}
                                        </p>
                                    </div>
                                </div>
                             ) : selectedClaim.found_item_challenge_questions?.length > 0 ? (
                                selectedClaim.found_item_challenge_questions.map((question, qIdx) => (
                                   <div key={qIdx} className="rounded-xl border border-white/10 bg-slate-800/40 divide-y divide-white/5 overflow-hidden">
                                       <div className="p-3 bg-[#0F172A] flex flex-col gap-1.5">
                                           <div className="flex items-center justify-between">
                                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Question #{qIdx + 1}</span>
                                               <HelpCircle size={12} className="text-slate-500" />
                                           </div>
                                           <p className="text-[12px] font-bold text-slate-300 italic leading-snug">
                                               "{question}"
                                           </p>
                                       </div>
                                       <div className="p-3 pl-4 border-l-4 border-l-uni-400 bg-uni-500/[0.02] flex flex-col gap-1.5">
                                           <div className="flex items-center justify-between">
                                               <span className="text-[8px] font-black text-uni-400 uppercase tracking-[0.2em]">Student Response</span>
                                               <MessageSquare size={12} className="text-uni-400" />
                                           </div>
                                           <p className="text-[13px] font-medium text-white leading-relaxed">
                                               {selectedClaim.challenge_answers_json?.[qIdx] || 'No response recorded.'}
                                           </p>
                                       </div>
                                   </div>
                                ))
                             ) : (
                                <div className="rounded-xl border border-white/10 bg-slate-800/40 divide-y divide-white/5 overflow-hidden">
                                    <div className="p-3 bg-[#0F172A] flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Legacy Challenge Question</span>
                                            <HelpCircle size={14} className="text-slate-500" />
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-300">
                                            {selectedClaim.found_item_challenge_question || "Ask for unique markings."}
                                        </p>
                                    </div>
                                    <div className="p-3 pl-4 border-l-4 border-l-uni-400 bg-uni-500/[0.02] flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-uni-400 uppercase tracking-[0.2em]">Claimant's Answer</span>
                                            <MessageSquare size={14} className="text-uni-400" />
                                        </div>
                                        <p className="text-[13px] font-medium text-white italic">
                                            "{selectedClaim.proof_description || 'No direct answer provided.'}"
                                        </p>
                                    </div>
                                </div>
                             )}
                        </div>
                   </div>
                  
                  {/* Claimant Identity & Staff Alerts */}
                  <div className="flex flex-col gap-3">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Identity & Meta</p>
                       
                       <div className="flex items-center gap-3 px-1">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                                <User size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-base font-bold text-white truncate">{selectedClaim.owner_name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedClaim.course_department || 'STUDENT'}</p>
                            </div>
                            {selectedClaim.similarity_score !== undefined && (
                                <div className="px-2 py-1 bg-uni-400/10 rounded-md border border-uni-400/20 text-[9px] font-black text-uni-400 uppercase tracking-[0.2em]">
                                    {(selectedClaim.similarity_score * 100).toFixed(0)}% MATCH
                                </div>
                            )}
                       </div>

                       {selectedClaim.found_item_verification_note && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 mt-2">
                                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Staff Alert</p>
                                    <p className="text-[12px] font-medium text-amber-500/90 leading-snug">
                                        {selectedClaim.found_item_verification_note}
                                    </p>
                                </div>
                            </div>
                        )}
                  </div>

              </div>
              
              {/* Decision Bar — Step 1 */}
              <div className="sticky bottom-0 p-4 bg-[#0F172A] border-t border-white/5 mt-auto z-20 shrink-0 pb-safe">
                  <div className="flex gap-3">
                      <button 
                          onClick={handleDecline}
                          disabled={actionLoading}
                          className="flex-[1] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3.5 sm:py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          <XCircle size={16} /> Decline
                      </button>
                      <button 
                          onClick={handleApproveClick}
                          disabled={actionLoading}
                          className="flex-[1.5] bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase tracking-[0.2em] py-3.5 sm:py-4 rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          <CheckCircle2 size={16} /> {isIdentifiedClaim ? 'Confirm & Release' : 'Approve & Schedule'}
                      </button>
                  </div>
              </div>
            </motion.div>
          ) : (
            /* ── STEP 2: Schedule Pickup ── */
            <motion.div
              key="schedule-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-grow overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-6 pb-24 sm:pb-4">
                
                {/* Approved confirmation */}
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Claim Approved</p>
                    <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">
                      Set a date & time for the student to pick up the item
                    </p>
                  </div>
                </div>

                {/* Claimant Info Reminder */}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-white truncate">{selectedClaim.owner_name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedClaim.course_department || 'STUDENT'}</p>
                  </div>
                </div>

                {/* Schedule Form */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <CalendarClock size={12} />
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-xl px-5 text-sm font-bold text-white focus:border-emerald-500/50 focus:bg-white/[0.06] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <CalendarClock size={12} />
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-xl px-5 text-sm font-bold text-white focus:border-emerald-500/50 focus:bg-white/[0.06] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                    <AlertCircle size={12} className="text-slate-500 shrink-0" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      The student will see this schedule in their "My Claims" page
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Bar — Step 2 */}
              <div className="sticky bottom-0 p-4 bg-[#0F172A] border-t border-white/5 mt-auto z-20 shrink-0 pb-safe">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowScheduleStep(false)}
                    disabled={actionLoading}
                    className="flex-[1] bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 py-3.5 sm:py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleConfirmSchedule}
                    disabled={actionLoading || !scheduledDate || !scheduledTime}
                    className="flex-[1.5] bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase tracking-[0.2em] py-3.5 sm:py-4 rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CalendarClock size={16} /> Confirm & Notify
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global loading overlay */}
        {actionLoading && (
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center z-[60]">
            <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.2em] animate-pulse relative z-10 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-uni-400 border-t-white rounded-full animate-spin" />
              Processing Decision...
            </p>
          </div>
        )}

        {/* Fullscreen Image Overlay */}
        <AnimatePresence>
          {fullscreenImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8"
              onClick={() => setFullscreenImg(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-4"
              >
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Visual Evidence Review</span>
                    <span className="text-sm font-bold text-white tracking-tight">{fullscreenImg.label}</span>
                  </div>
                  <button 
                    onClick={() => setFullscreenImg(null)}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group active:scale-90"
                  >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
                <div className="w-full h-full flex items-center justify-center mt-12">
                  <img 
                    src={fullscreenImg.url} 
                    alt={fullscreenImg.label} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 cursor-zoom-out" 
                  />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Click anywhere to close
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ClaimReviewModal;
