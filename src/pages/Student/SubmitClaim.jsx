import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';

const SubmitClaim = () => {
  const { colleges: COLLEGES, loading: metadataLoading } = useMasterData();
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proof, setProof] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Guest State
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [contactInfo, setContactInfo] = useState('');
  const [courseDepartment, setCourseDepartment] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [attributes, setAttributes] = useState({});
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
      const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setItem(data);
      } else {
        setError('Registry entry not found or no longer available.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
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
      const genTrackingId = user ? null : `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const payload = {
        found_item_id: parseInt(itemId),
        proof_description: proof,
        proof_photo_url: proofPhotoUrl,
        guest_first_name: guestFirstName || (user?.first_name),
        guest_last_name: guestLastName || (user?.last_name),
        guest_email: guestEmail || (user?.email),
        contact_method: contactMethod,
        contact_info: contactInfo,
        course_department: courseDepartment,
        attributes_json: JSON.stringify(attributes),
        student_id: user?.id || null,
        status: 'pending',
        tracking_id: genTrackingId,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('claims')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      
      if (!user && genTrackingId) {
        setTrackingId(genTrackingId);
      } else {
        navigate('/my-claims');
      }
    } catch (err) {
      setError(err.message || 'Submission failure. Please try again.');
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
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-20 px-4 text-center space-y-12">
        {/* Minimal Success Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
            <div className="w-16 h-16 bg-uni-500/20 rounded-full flex items-center justify-center mx-auto border border-uni-500/30 shadow-lg shadow-uni-500/10">
                <i className="fa-solid fa-check text-2xl text-uni-400"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Your claim is in!</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto">
                Review cycle initiated • <span className="text-white">Email alerts active</span>
            </p>
        </motion.div>

        {/* Unified Action Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-4xl grid md:grid-cols-2 gap-px bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black"
        >
            
            {/* Left: Tracking Module */}
            <div className="p-10 md:p-14 bg-black/40 space-y-8 flex flex-col justify-between text-left">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-link text-uni-400 text-[10px]"></i>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Access Identifier</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic">Tracking Link</h3>
                    <p className="text-slate-400 text-[10px] font-bold leading-relaxed max-w-[240px]">
                        Save this unique URL to check status manually without logging in.
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/claim-status/${trackingId}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-uni-500/50 transition-all overflow-hidden relative"
                    >
                        <p className="flex-grow text-uni-400 font-black tracking-widest text-[9px] truncate">
                            {window.location.origin.replace('http://', '').replace('https://', '')}/.../{trackingId.split('-')[0]}
                        </p>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            copied ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-uni-500 group-hover:text-white'
                        }`}>
                            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-[10px]`}></i>
                        </div>
                    </button>
                    {copied && <p className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em] ml-1 animate-pulse">Copied to clipboard</p>}
                </div>
            </div>

            {/* Right: Registration Module */}
            {!user ? (
                <div className="p-10 md:p-14 bg-uni-500/5 space-y-8 flex flex-col justify-between text-left relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <i className="fa-solid fa-shield-halved text-[14rem] text-uni-400 -rotate-12"></i>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-uni-400 flex items-center justify-center text-black">
                                <i className="fa-solid fa-bolt text-[8px]"></i>
                            </div>
                            <span className="text-[9px] font-black text-uni-400 uppercase tracking-widest">Mastery Upgrade</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic">Sync to Dashboard</h3>
                        <p className="text-slate-400 text-[10px] font-bold leading-relaxed max-w-[240px]">
                            Avoid tracking links. Sync this claim to your official ID for real-time alerts.
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <Link 
                            to={`/register?email=${encodeURIComponent(guestEmail || '')}&first_name=${encodeURIComponent(guestFirstName || '')}&last_name=${encodeURIComponent(guestLastName || '')}&college=${encodeURIComponent(courseDepartment || '')}`}
                            className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-uni-500 hover:text-white transition-all text-center block shadow-xl shadow-black/40"
                        >
                            Secure Access →
                        </Link>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">
                            Authorized Registry Protocol
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-10 md:p-14 bg-uni-500/5 flex flex-col items-center justify-center text-center space-y-4 border-l border-white/5">
                    <div className="w-12 h-12 bg-uni-500/10 rounded-full flex items-center justify-center mb-2">
                        <i className="fa-solid fa-circle-check text-uni-400"></i>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase italic">Auto-Synced</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">
                        This claim is secured to your student dashboard.
                    </p>
                    <Link to="/dashboard" className="text-uni-400 text-[9px] font-black uppercase tracking-widest hover:underline pt-4">
                        View Dashboard →
                    </Link>
                </div>
            )}
        </motion.div>

        {/* Action Footer */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
        >
            <Link to="/" className="inline-flex items-center gap-3 text-slate-500 hover:text-white px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-[0.4em] transition-all bg-white/5 border border-white/5 hover:border-white/10 group">
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                Return to Registry
            </Link>
        </motion.div>
      </div>
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
              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Progress</p>
                    <p className="text-sm font-black text-white uppercase italic leading-none">Step {step} of {totalSteps}</p>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / totalSteps) * 100}%` }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                      className="h-full bg-uni-500 shadow-[0_0_10px_rgba(var(--uni-500-rgb),0.5)]"
                    />
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
                    <div className="p-8 glass-panel rounded-[3.5rem] border border-white/5">
                        <ImageUpload
                            value={proofPhotoUrl}
                            onUploadSuccess={(url) => setProofPhotoUrl(url)}
                        />
                    </div>

                    <button
                      onClick={() => goToStep(2)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all active:scale-95 flex items-center justify-center gap-4"
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
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-6">First Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Juan"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px]"
                                value={guestFirstName || (user?.first_name)}
                                onChange={(e) => setGuestFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-6">Last Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Dela Cruz"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px]"
                                value={guestLastName || (user?.last_name)}
                                onChange={(e) => setGuestLastName(e.target.value)}
                            />
                        </div>
                    </div>
                        <div className="space-y-4 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-6">Course / Dept</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {COLLEGES.map((college) => (
                                    <button
                                        key={college.id}
                                        type="button"
                                        onClick={() => setCourseDepartment(college.label)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                                            courseDepartment === college.label
                                                ? 'bg-uni-500 border-uni-500 text-white'
                                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                                        }`}
                                    >
                                        <i className={`fa-solid ${college.icon} text-2xl transition-transform group-hover:scale-110 ${courseDepartment === college.label ? 'scale-110' : ''}`}></i>
                                        <span className="text-[9px] font-black tracking-widest text-center leading-tight">{college.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                          disabled={(!guestFirstName && !user?.first_name) || (!guestLastName && !user?.last_name) || !courseDepartment}
                          onClick={() => goToStep(3)}
                          className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-20"
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
                          { id: 'Email', icon: 'fa-paper-plane', label: 'Email' },
                          { id: 'Facebook', icon: 'fa-facebook', label: 'Facebook' },
                          { id: 'Phone', icon: 'fa-mobile-screen', label: 'Phone' }
                        ].map(method => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setContactMethod(method.id)}
                            className={`p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all ${
                              contactMethod === method.id 
                                ? 'bg-uni-500 border-uni-500 text-white scale-105' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                          >
                            <i className={`${method.id === 'Facebook' ? 'fa-brands' : 'fa-solid'} ${method.icon} text-2xl`}></i>
                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">{method.label}</span>
                          </button>

                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-6">{contactMethod} Details</label>
                            <input 
                                type={contactMethod === 'Email' ? 'email' : 'text'}
                                required
                                placeholder={contactMethod === 'Facebook' ? 'FB Link or Handle' : contactMethod === 'Phone' ? '09XX XXX XXXX' : 'your@email.com'}
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px]"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-6">Backup Email (Opt)</label>
                            <input 
                                type="email"
                                placeholder="Backup notification email"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] opacity-40 focus:opacity-100"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                      disabled={!contactInfo}
                      onClick={() => goToStep(4)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-20"
                    >
                      Save Contact →
                    </button>
                 </div>
               </div>
             )}

             {step === 4 && (
               <div className="space-y-12 flex-grow flex flex-col justify-center py-10 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 4: Ownership Challenge</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">
                      {item?.challenge_question ? "Please answer the Challenge" : "Why is this yours?"}
                    </h2>
                    {item?.challenge_question ? (
                       <div className="max-w-xl mx-auto p-6 bg-uni-500/5 border border-uni-400/20 rounded-3xl mt-4">
                          <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.2em] mb-2">Question from Administrator</p>
                          <p className="text-lg font-black text-white uppercase italic tracking-tight italic">"{item.challenge_question}"</p>
                       </div>
                    ) : (
                       <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Mention unique marks, lock screens, or internal contents.</p>
                    )}
                 </div>

                  <div className="max-w-2xl mx-auto w-full space-y-8">
                     {/* Structured Verification Audit */}
                     {item && ITEM_ATTRIBUTES[item.category] && (
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6 text-left">
                           <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                              <i className="fa-solid fa-list-check"></i>
                              Physical Characteristics Audit
                           </p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {(ITEM_ATTRIBUTES[item.category] || []).map(field => (
                                <div key={field} className="space-y-2">
                                  <label className="block text-[9px] font-black text-slate-500 tracking-widest uppercase ml-4">{field}</label>
                                  
                                  {field === 'Color' || field === 'Primary Color' || field === 'Frame Color' ? (
                                    <select
                                      className="w-full bg-slate-950 border border-white/10 rounded-full px-6 py-4 text-[11px] font-bold text-white focus:border-uni-500 outline-none transition-all"
                                      value={attributes[field] || ''}
                                      onChange={(e) => setAttributes({ ...attributes, [field]: e.target.value })}
                                    >
                                      <option value="">Select Color</option>
                                      {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                  ) : field === 'Condition' ? (
                                    <select
                                      className="w-full bg-slate-950 border border-white/10 rounded-full px-6 py-4 text-[11px] font-bold text-white focus:border-uni-500 outline-none transition-all"
                                      value={attributes[field] || ''}
                                      onChange={(e) => setAttributes({ ...attributes, [field]: e.target.value })}
                                    >
                                      <option value="">Select Condition</option>
                                      {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                  ) : (
                                    <input 
                                      type="text"
                                      className="w-full bg-slate-950 border border-white/10 rounded-full px-6 py-4 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all tracking-widest uppercase"
                                      value={attributes[field] || ''}
                                      onChange={(e) => setAttributes({ ...attributes, [field]: e.target.value })}
                                      placeholder={`Enter ${field}`}
                                    />
                                  )}
                                </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-slate-500 tracking-widest ml-10 flex items-center gap-2">
                           <i className="fa-solid fa-pen-nib text-[8px] text-uni-400"></i>
                           {item?.challenge_question ? "Additional Verification Context" : "Unique Narrative Proof"}
                        </label>
                        <textarea 
                            rows="6"
                            required
                            placeholder={item?.challenge_question ? "Provide the correct answer to the question above..." : "Describe details only the owner would know (e.g. Scratches, stickers, wallpaper, contents)..."}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] min-h-[150px] resize-none"
                            value={proof}
                            onChange={(e) => setProof(e.target.value)}
                        />
                     </div>
                    <button
                      disabled={proof.length < 5}
                      onClick={() => goToStep(5)}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-20"
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
                              <p className="text-xl font-black text-white uppercase italic">{user ? `${user.first_name} ${user.last_name}` : `${guestFirstName} ${guestLastName}`}</p>
                              <p className="text-[10px] text-uni-400 font-bold uppercase">{user ? user.role : courseDepartment}</p>
                           </div>
                           <div className="pt-4 border-t border-white/5 space-y-1">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Contact Method</p>
                               <p className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                                 <i className={`${contactMethod === 'Facebook' ? 'fa-brands fa-facebook' : 'fa-solid ' + (contactMethod === 'Phone' ? 'fa-mobile-screen' : 'fa-paper-plane')} text-uni-400`}></i>
                                {contactInfo}
                              </p>
                           </div>
                        </div>

                        {/* Evidence Context */}
                        <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 space-y-6">
                           <div className="space-y-6">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Evidence Details</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-3">"{proof}"</p>
                              </div>

                              {Object.keys(attributes).length > 0 && (
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Physical Details</p>
                                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      {Object.entries(attributes).map(([k, v]) => (
                                        <div key={k} className="flex flex-col">
                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{k}</span>
                                          <span className="text-[10px] font-black text-uni-400 uppercase italic tracking-tight">{v || 'N/A'}</span>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              )}
                              
                              {proofPhotoUrl && (
                                <div className="w-full h-32 rounded-xl border border-white/10 overflow-hidden relative group">
                                   <img src={proofPhotoUrl} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Ownership Photo</span>
                                   </div>
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
                          className="flex-[2] bg-white text-black py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] hover:bg-uni-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-6 group"
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
