import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proof, setProof] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [contactInfo, setContactInfo] = useState('');
  const [courseDepartment, setCourseDepartment] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const goToStep = (target) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(target);
  };

  const fetchItem = async () => {
    try {
      const response = await apiClient.get('/found/public');
      const foundItem = response.data.find(i => i.id === parseInt(itemId));
      if (foundItem) {
        setItem(foundItem);
      } else {
        setError('Registry entry not found or no longer available.');
      }
    } catch (err) {
      setError('System error retrieving item context.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        found_item_id: parseInt(itemId),
        proof_description: proof,
        proof_photo_url: proofPhotoUrl,
        guest_full_name: guestName || (user?.full_name),
        guest_email: guestEmail || (user?.email),
        contact_method: contactMethod,
        contact_info: contactInfo,
        course_department: courseDepartment
      };

      const response = await apiClient.post('/claims/submit', payload);
      
      if (!user && response.data.tracking_id) {
        setTrackingId(response.data.tracking_id);
      } else {
        navigate('/my-claims');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failure. Please try again.');
      setStep(4); // Go back to proof if error
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  if (trackingId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto glass-panel p-12 md:p-20 text-center space-y-10 rounded-[2.5rem] border-uni-500/20 shadow-2xl shadow-uni-500/10"
      >
        <div className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-uni-500/20">
            <i className="fa-solid fa-check text-4xl text-uni-400"></i>
        </div>
        <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Claim Submitted Successfully</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-sm mx-auto">
                {guestEmail 
                  ? <>We've sent a tracking link to <span className="text-white">{guestEmail}</span>.</>
                  : <>We will notify you via <span className="text-white">{contactMethod}</span> once your claim is reviewed.</>
                } Please save the link below to check your status manually.
            </p>
        </div>

        <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 space-y-4 group relative overflow-hidden">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Your Magic Tracking Link</span>
            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group-hover:border-uni-500/30 transition-all">
                <p className="flex-grow text-uni-400 font-black tracking-widest text-[11px] break-all select-all text-left">
                    {window.location.origin}/claim-status/{trackingId}
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/claim-status/${trackingId}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-sm`}></i>
                </button>
            </div>
            {copied && (
              <motion.span 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute right-8 bottom-2 text-[8px] font-black text-green-500 uppercase tracking-widest"
              >
                Copied to clipboard
              </motion.span>
            )}
        </div>

        <div className="pt-6">
            <Link to="/" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all">
                Return to Registry
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col">
       {/* Seamless Header */}
       <div className="space-y-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2 flex items-center gap-6">
                  {item && (
                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                      {item.safe_photo_url ? <img src={item.safe_photo_url} className="w-full h-full object-cover opacity-50" /> : '📦'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em]">Claim Submission</p>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">Claim this Item</h1>
                  </div>
              </div>
              <div className="flex items-center gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                    <p className="text-sm font-black text-white uppercase italic">Step {step} of {totalSteps}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-uni-500/20 border-t-uni-500 flex items-center justify-center text-[10px] font-black text-white italic">
                    {Math.round((step / totalSteps) * 100)}%
                  </div>
              </div>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center rounded-3xl flex items-center justify-center gap-4"
              >
                 <i className="fa-solid fa-circle-exclamation text-xl"></i>
                 {error}
              </motion.div>
            )}
          </AnimatePresence>
       </div>

       <div className="flex-grow flex flex-col relative px-4">
         <AnimatePresence mode="wait">
           <motion.div
             key={step}
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             exit="exit"
             className="flex-grow flex flex-col"
           >
             {step === 1 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 1: Visual Proof (Optional)</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Do you have any photo<br/>of the item?"</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">This could be a photo of you with the item, its receipt, or a screenshot of a unique mark.</p>
                 </div>

                 <div className="max-w-xl mx-auto w-full space-y-10">
                    <div className="p-8 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl">
                        <ImageUpload
                            value={proofPhotoUrl}
                            onUploadSuccess={(url) => setProofPhotoUrl(url)}
                        />
                    </div>

                    <button
                      onClick={() => goToStep(2)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
                    >
                      {proofPhotoUrl ? 'Next Step →' : 'Skip & Continue →'}
                    </button>
                 </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 2: Identification</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Please tell us<br/>who is claiming"</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Provide your identification details.</p>
                 </div>

                 <div className="max-w-2xl mx-auto w-full space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Full Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Juan Dela Cruz"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all uppercase tracking-widest text-[11px]"
                                value={guestName || (user?.full_name)}
                                onChange={(e) => setGuestName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Course / Dept</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. BSIT - 3B"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all uppercase tracking-widest text-[11px]"
                                value={courseDepartment}
                                onChange={(e) => setCourseDepartment(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                      disabled={(!guestName && !user?.full_name) || !courseDepartment}
                      onClick={() => goToStep(3)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                      Continue →
                    </button>
                 </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 3: Contact Priority</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"How should we<br/>get in touch?"</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Choose where you'd like to receive the result of your claim.</p>
                 </div>

                 <div className="max-w-2xl mx-auto w-full space-y-10">
                    <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'Email', icon: 'fa-envelope', label: 'Email' },
                          { id: 'Facebook', icon: 'fa-facebook', label: 'Facebook' },
                          { id: 'Phone', icon: 'fa-phone', label: 'Phone' }
                        ].map(method => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setContactMethod(method.id)}
                            className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all ${
                              contactMethod === method.id 
                                ? 'bg-uni-500 border-uni-500 text-white shadow-2xl scale-105' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                          >
                            <i className={`fa-brands ${method.id === 'Facebook' ? 'fa-facebook' : 'fa-solid ' + method.icon} text-2xl`}></i>
                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">{method.label}</span>
                          </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">{contactMethod} Details</label>
                            <input 
                                type={contactMethod === 'Email' ? 'email' : 'text'}
                                required
                                placeholder={contactMethod === 'Facebook' ? 'FB Link or Handle' : contactMethod === 'Phone' ? '09XX XXX XXXX' : 'your@email.com'}
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all uppercase tracking-widest text-[11px]"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Backup Email (Opt)</label>
                            <input 
                                type="email"
                                placeholder="Backup notification email"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all uppercase tracking-widest text-[11px] opacity-40 focus:opacity-100"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                      disabled={!contactInfo}
                      onClick={() => goToStep(4)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                      Save Contact →
                    </button>
                 </div>
               </div>
             )}

             {step === 4 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 4: Written Proof</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Why is this<br/>yours?"</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Mention unique marks, lock screens, or internal contents.</p>
                 </div>

                 <div className="max-w-2xl mx-auto w-full space-y-10">
                    <textarea 
                        rows="6"
                        required
                        placeholder="Describe details only the owner would know (e.g. Scratches, stickers, wallpaper, contents)..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-white font-bold outline-none focus:border-uni-500 transition-all uppercase tracking-widest text-[11px] min-h-[250px] resize-none"
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                    />
                    <button
                      disabled={proof.length < 10}
                      onClick={() => goToStep(5)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                      Next Step →
                    </button>
                 </div>
               </div>
             )}

             {step === 5 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                 <div className="space-y-4 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 5: Final Review</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Please check everything<br/>one last time."</h2>
                 </div>

                 <div className="max-w-3xl mx-auto w-full space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Claimant Context */}
                        <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 space-y-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Claimant</p>
                              <p className="text-xl font-black text-white uppercase italic">{user ? user.full_name : guestName}</p>
                              <p className="text-[10px] text-uni-400 font-bold uppercase">{user ? user.role : courseDepartment}</p>
                           </div>
                           <div className="pt-4 border-t border-white/5 space-y-1">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Contact Method</p>
                              <p className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <i className={`fa-brands ${contactMethod === 'Facebook' ? 'fa-facebook' : 'fa-solid ' + (contactMethod === 'Phone' ? 'fa-phone' : 'fa-envelope')} text-uni-400`}></i>
                                {contactInfo}
                              </p>
                           </div>
                        </div>

                        {/* Evidence Context */}
                        <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Evidence Details</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-3">"{proof}"</p>
                              </div>
                              {proofPhotoUrl && (
                                <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden shrink-0">
                                   <img src={proofPhotoUrl} className="w-full h-full object-cover" />
                                </div>
                              )}
                           </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <button 
                            onClick={() => goToStep(4)} 
                            className="flex-1 py-6 rounded-2xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                        >
                            Wait, I need to edit
                        </button>
                        <button
                          disabled={submitting}
                          onClick={handleSubmit}
                          className="flex-[2] bg-white text-black py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] shadow-2xl hover:bg-uni-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-6 group"
                        >
                          {submitting ? (
                            <div className="w-5 h-5 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                                <i className="fa-solid fa-paper-plane text-xl group-hover:rotate-12 transition-transform"></i>
                                Submit Claim
                            </>
                          )}
                        </button>
                    </div>
                 </div>
               </div>
             )}
           </motion.div>
         </AnimatePresence>
       </div>
    </div>
  );
};

export default SubmitClaim;
