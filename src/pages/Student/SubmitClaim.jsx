import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';

// Step definitions for the new importance-first flow
const STEPS = [
  { id: 'challenge', label: 'Ownership', icon: 'fa-shield-halved' },
  { id: 'photo', label: 'Evidence', icon: 'fa-camera' },
  { id: 'identity', label: 'Identity', icon: 'fa-user' },
  { id: 'review', label: 'Review', icon: 'fa-check-double' },
];

const SubmitClaim = () => {
  const { colleges: COLLEGES } = useMasterData();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Storage Key for draft persistence
  const DRAFT_KEY = `claim_draft_${itemId}`;

  // 1. Initial State (restored from session storage if exists)
  const initialDraft = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }, [DRAFT_KEY]);

  const [proof, setProof] = useState(initialDraft?.proof || '');
  const [proofPhotoUrl, setProofPhotoUrl] = useState(initialDraft?.proofPhotoUrl || '');
  const [attributes, setAttributes] = useState(initialDraft?.attributes || {});
  const [step, setStep] = useState(initialDraft?.step || 1);
  const [completedSteps, setCompletedSteps] = useState(new Set(initialDraft?.completedSteps || []));
  
  // Guest State (Identity)
  const [guestFirstName, setGuestFirstName] = useState(initialDraft?.guestFirstName || '');
  const [guestLastName, setGuestLastName] = useState(initialDraft?.guestLastName || '');
  const [guestEmail, setGuestEmail] = useState(initialDraft?.guestEmail || '');
  const [contactMethod, setContactMethod] = useState(initialDraft?.contactMethod || 'Email');
  const [contactInfo, setContactInfo] = useState(initialDraft?.contactInfo || '');
  const [courseDepartment, setCourseDepartment] = useState(initialDraft?.courseDepartment || '');
  const [challengeAnswers, setChallengeAnswers] = useState(initialDraft?.challengeAnswers || {});

  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // 2. Draft Persistence Effect
  useEffect(() => {
    const draft = {
      proof,
      proofPhotoUrl,
      attributes,
      step,
      completedSteps: Array.from(completedSteps),
      guestFirstName,
      guestLastName,
      guestEmail,
      contactMethod,
      contactInfo,
      courseDepartment,
      challengeAnswers
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [DRAFT_KEY, proof, proofPhotoUrl, attributes, step, completedSteps, guestFirstName, guestLastName, guestEmail, contactMethod, contactInfo, courseDepartment, challengeAnswers]);

  // 3. Data Fetching (TanStack Query) — compliant with Section 2.1
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ['found-item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .eq('id', itemId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });

  // 4. Submission Mutation — compliant with Section 2.2
  const claimMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('claims')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Clear persistence on success
      sessionStorage.removeItem(DRAFT_KEY);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
      
      if (!user && data.tracking_id) {
        setTrackingId(data.tracking_id);
      } else {
        sessionStorage.setItem('claim_just_submitted', 'true');
        navigate('/my-claims');
      }
    },
    onError: (err) => {
      setError(err.message || 'Submission failure. Please try again.');
      setStep(1);
    }
  });

  // Auto-fill contact info for logged-in users (syncing with user object)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && !initialDraft && !contactInfo) {
      setContactMethod('Email');
      setContactInfo(user.email || '');
      setCourseDepartment(user.college || '');
    }
  }, [user]); // Only trigger when user loads

  // 5. AUTO-MATCH LOGIC: If Student ID matches, skip to review
  const isAutoMatched = useMemo(() => {
    if (!user || !item || !user.student_id_number || !item.identified_id_number) return false;
    
    // Normalize IDs for comparison (remove spaces/dashes, lowercase)
    const normalize = (id) => String(id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return normalize(user.student_id_number) === normalize(item.identified_id_number);
  }, [user, item]);

  // 6. IDENTIFIED ITEM CHECK: Has the item been pre-identified?
  const isIdentifiedItem = useMemo(() => {
    return !!(item?.identified_name || item?.identified_id_number);
  }, [item]);

  // 7. DIRECT PICKUP CHECK: Is this a sensitive ID that should be claimed immediately?
  const isDirectPickup = useMemo(() => {
    return isIdentifiedItem && (item?.category === 'ID Card' || item?.category === 'Institutional ID');
  }, [isIdentifiedItem, item]);

  // 8. SECURITY GATE: Is the current user allowed to claim this identified item?
  const isWrongUser = useMemo(() => {
    if (!user || !isIdentifiedItem || !item.identified_id_number) return false;
    const normalize = (id) => String(id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // If identified to a specific ID, and user is logged in with a DIFFERENT ID
    if (user.student_id_number && normalize(user.student_id_number) !== normalize(item.identified_id_number)) {
        return true;
    }
    return false;
  }, [user, item, isIdentifiedItem]);

  useEffect(() => {
    if (isAutoMatched && !initialDraft && step === 1) {
      setProof("Identity automatically verified via Student ID match. This item was found and identified as belonging to this student.");
      setCompletedSteps(new Set([1, 2])); // Mark ownership and photo as done
      setStep(4); // Jump to review
    }
  }, [isAutoMatched, initialDraft, step]);

  const goToStep = useCallback((target) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (target > step) {
      setCompletedSteps(prev => new Set([...prev, step]));
    }
    setStep(target);
  }, [step]);

  const getActualStep = (displayStep) => {
    if (user) {
      if (displayStep >= 3) return 4; // jump to review
      return displayStep;
    }
    return displayStep;
  };

  const getDisplaySteps = () => {
    let baseSteps = [...STEPS];
    
    // If identified, change labels to "Identity" focus
    if (isIdentifiedItem) {
        baseSteps[0] = { id: 'challenge', label: 'Confirmation', icon: 'fa-id-card' };
        baseSteps[1] = { id: 'photo', label: 'ID Photo', icon: 'fa-camera' };
    }

    if (user) {
      return baseSteps.filter(s => s.id !== 'identity');
    }
    return baseSteps;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    const genTrackingId = user ? null : `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payload = {
      found_item_id: itemId,
      proof_description: isDirectPickup ? `Direct Pickup Announcement for ${item.category} (${item.identified_name})` : proof,
      proof_photo_url: proofPhotoUrl,
      guest_first_name: isDirectPickup ? (item.identified_name?.split(' ')[0] || 'Direct') : guestFirstName,
      guest_last_name: isDirectPickup ? (item.identified_name?.split(' ').slice(1).join(' ') || 'Pickup') : guestLastName,
      guest_email: user?.email || guestEmail || 'direct-pickup@system.local',
      contact_method: user ? 'Account' : (isDirectPickup ? 'Direct Pickup' : contactMethod),
      contact_info: isDirectPickup ? 'Announcement Path' : contactInfo,
      course_department: courseDepartment,
      attributes_json: isDirectPickup ? {} : attributes,
      challenge_answers_json: isDirectPickup ? {} : challengeAnswers,
      user_id: user?.id || null, 
      status: 'pending',
      tracking_id: genTrackingId,
      is_auto_match: isAutoMatched || isDirectPickup,
      is_identified_claim: isIdentifiedItem,
      metadata: {
        is_direct_pickup: isDirectPickup,
        auto_verified: isAutoMatched,
        source: 'Announcement Path'
      }
    };

    claimMutation.mutate(payload);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  const actualStep = getActualStep(step);

  if (itemLoading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  // ── Direct Pickup / Announcement Screen ──
  if (isDirectPickup && !trackingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-20 px-4 text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
            <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 animate-pulse">
                <i className="fa-solid fa-bullhorn text-4xl text-emerald-400"></i>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Official Announcement</p>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
                    {item.identified_name ? <><span className="text-emerald-400">{item.identified_name}</span>,<br/>claim your item!</> : "Item Identified!"}
                </h2>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] max-w-sm mx-auto">
                    Registry Match Confirmed • <span className="text-white">ID Securing Protocol Active</span>
                </p>
            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 shadow-2xl shadow-black relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px flex-grow bg-white/5"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pickup Location</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase italic">{item.location || 'USG Office'}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Ground Floor, Student Services Center</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                <div className="bg-black/40 p-6 space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Asset Category</p>
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">{item.category}</p>
                </div>
                <div className="bg-black/40 p-6 space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ID Number</p>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{item.identified_id_number || 'Institutional'}</p>
                </div>
            </div>

            <div className="pt-4 space-y-4">
                <button 
                    onClick={() => {
                        // For IDs, we just mark it as "intended to claim" or similar if we have an API, 
                        // but here we'll just show the success state or navigate
                        handleSubmit(); 
                    }}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10"
                >
                    I'm on my way →
                </button>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Please bring any secondary ID for physical verification</p>
            </div>
        </motion.div>

        <Link to="/" className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.4em] transition-colors">
            ← Return to Registry
        </Link>
      </div>
    );
  }

  // ── Success Screen (Guest Tracking / Direct Confirmation) ──
  if (trackingId) {
    if (isDirectPickup) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] py-20 px-4 text-center space-y-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 border-4 border-white/10">
                        <i className="fa-solid fa-handshake text-3xl text-white"></i>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Confirmation Logged!</h2>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Appointment Set • USG Registry</p>
                    </div>
                </motion.div>

                <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-black relative overflow-hidden">
                    <div className="space-y-4">
                        <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest italic">
                            "We've informed the USG staff that you're on your way. Just present a secondary ID or your student profile to claim."
                        </p>
                        <div className="h-px w-20 bg-emerald-500/30 mx-auto"></div>
                    </div>

                    <Link 
                        to="/"
                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all block"
                    >
                        Return to Registry
                    </Link>
                </div>
            </div>
        );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-20 px-4 text-center space-y-12">
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
                    <Link to="/student" className="text-uni-400 text-[9px] font-black uppercase tracking-widest hover:underline pt-4">
                        View Dashboard →
                    </Link>
                </div>
            )}
        </motion.div>

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

  // ── Main Claim Flow ──
  const displaySteps = getDisplaySteps();

  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col">
       {/* ── Header with Item Context ── */}
       <div className="space-y-6 mb-8">
          {/* Item Context Card — always visible */}
          {item && (
            <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                {item.photo_url ? <img src={item.photo_url} className="w-full h-full object-cover opacity-60" alt="" /> : '📦'}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[9px] font-black text-uni-400 uppercase tracking-[0.3em]">Claiming</p>
                <h1 className="text-lg font-black text-white uppercase tracking-tight leading-none truncate">{item.title || item.category}</h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.category} • {item.location || 'Unknown location'}</p>
              </div>
            </div>
          )}

          {/* ── Clickable Step Navigator ── */}
          <div className="flex items-center gap-2 px-1">
            {displaySteps.map((s, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isComplete = completedSteps.has(stepNum) || step > stepNum;
              const isClickable = isComplete || isActive;

              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => isClickable && goToStep(stepNum)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all min-h-[48px] ${
                      isActive  
                        ? 'bg-uni-500 text-white shadow-lg shadow-uni-500/20' 
                        : isComplete 
                          ? 'bg-uni-500/10 text-uni-400 hover:bg-uni-500/20 cursor-pointer' 
                          : 'bg-white/[0.03] text-slate-600 cursor-default'
                    }`}
                  >
                    <i className={`fa-solid ${isComplete && !isActive ? 'fa-check' : s.icon} text-[11px]`}></i>
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">{s.label}</span>
                  </button>
                  {idx < displaySteps.length - 1 && (
                    <div className={`flex-grow h-0.5 rounded-full transition-colors ${
                      step > stepNum ? 'bg-uni-500/40' : 'bg-white/5'
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center rounded-2xl flex items-center justify-center gap-4"
              >
                 <i className="fa-solid fa-circle-exclamation text-lg"></i>
                 {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* ── AUTO-MATCH BANNER ── */}
          {isAutoMatched && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-6 shadow-xl shadow-emerald-500/5"
            >
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/30">
                <i className="fa-solid fa-shield-check text-emerald-400"></i>
              </div>
              <div className="text-left flex-grow">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] italic mb-1">Ownership Secured</p>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Verified Identity Match!</h3>
                <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest mt-0.5">
                  Your Student ID <span className="text-white">({user.student_id_number})</span> matches the ID found on this item.
                </p>
              </div>
              <div className="hidden md:block px-4 py-2 bg-emerald-500 rounded-xl text-black text-[10px] font-black uppercase tracking-widest">
                Fast Tracked
              </div>
            </motion.div>
          )}
       </div>

       {/* ── Step Content ── */}
       <div className="flex-grow flex flex-col relative px-1">
         <AnimatePresence mode="wait">
          {isWrongUser ? (
            <motion.div
              key="wrong-user"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-grow flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10">
                <i className="fa-solid fa-user-slash text-3xl text-red-500"></i>
              </div>
              <div className="space-y-4 max-w-sm">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Access Restricted</h2>
                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest">
                  This item has been identified as belonging to <span className="text-white">ID: {item.identified_id_number}</span>.
                </p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Policy Directive</p>
                  <p className="text-[10px] text-red-400 font-black uppercase leading-tight">
                    Strict identity matching is active. You are currently logged in as <span className="text-white">{user.student_id_number}</span>.
                  </p>
                </div>
              </div>
              <Link to="/" className="text-uni-400 text-[10px] font-black uppercase tracking-[0.3em] hover:underline">
                ← Return to Registry
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={actualStep}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-grow flex flex-col"
            >
             {/* ═══════════════════════════════════════════════════
                 STEP 1: Ownership Challenge
                 ═══════════════════════════════════════════════════ */}
             {actualStep === 1 && (
               <div className="space-y-10 flex-grow flex flex-col justify-center py-8 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest italic">
                      {isIdentifiedItem ? 'Step 1: Identity Confirmation' : 'Step 1: Prove Ownership'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none italic">
                      {isIdentifiedItem ? <>Confirm your<br/>Identity</> : item?.challenge_questions?.length > 0 ? <>Answer the<br/>Challenge</> : <>Why is this<br/>yours?</>}
                    </h2>
                    {isIdentifiedItem ? (
                       <div className="max-w-xl mx-auto p-8 bg-uni-500/5 border border-uni-400/20 rounded-[2.5rem] space-y-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em]">Identified Owner</p>
                             <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{item.identified_name || 'Registered Member'}</h3>
                             <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest italic">Institutional ID: {item.identified_id_number}</p>
                          </div>
                          <div className="flex items-center gap-3 justify-center text-emerald-400 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                             <i className="fa-solid fa-shield-check text-xs"></i>
                             <span className="text-[10px] font-black uppercase tracking-widest">Matched Assets Detected</span>
                          </div>
                       </div>
                    ) : item?.challenge_questions?.length > 0 ? (
                       <div className="max-w-xl mx-auto space-y-4">
                          <div className="flex items-center gap-3 px-1 py-1">
                             <div className="w-1 h-3 rounded-full bg-uni-500"></div>
                             <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">Mandatory Forensic Challenge</p>
                          </div>
                          {item.challenge_questions.map((q, qIdx) => (
                             <div key={qIdx} className="p-5 bg-uni-500/5 border border-uni-400/20 rounded-2xl text-left space-y-4">
                                <div className="space-y-1">
                                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Question #{qIdx + 1}</p>
                                   <p className="text-sm font-black text-white italic tracking-tight leading-snug">"{q}"</p>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-uni-400/60 tracking-widest ml-2 uppercase">Your Response</label>
                                   <textarea 
                                       rows="3"
                                       required
                                       placeholder="Provide specific proof for this question..."
                                       className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-wide text-[11px] resize-none leading-relaxed"
                                       value={challengeAnswers[qIdx] || ''}
                                       onChange={(e) => setChallengeAnswers({...challengeAnswers, [qIdx]: e.target.value})}
                                   />
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : item?.challenge_question ? (
                       <div className="max-w-xl mx-auto p-5 bg-uni-500/5 border border-uni-400/20 rounded-2xl">
                          <p className="text-[9px] font-black text-uni-400 uppercase tracking-[0.2em] mb-2">Question from Administrator</p>
                          <p className="text-base font-black text-white italic tracking-tight">"{item.challenge_question}"</p>
                       </div>
                    ) : (
                       <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Mention unique marks, lock screens, stickers, or internal contents.</p>
                    )}
                 </div>

                  <div className="max-w-2xl mx-auto w-full space-y-8">
                     {/* Structured Physical Characteristics Audit */}
                     {item && ITEM_ATTRIBUTES[item.category] && (
                        <div className="bg-white/[0.03] p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6 text-left">
                           <p className="text-[9px] font-black text-uni-400 uppercase tracking-[0.3em] flex items-center gap-2">
                              <i className="fa-solid fa-list-check"></i>
                              Physical Characteristics
                           </p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {(ITEM_ATTRIBUTES[item.category] || []).map(field => (
                                <div key={field} className="space-y-2">
                                  <label className="block text-[9px] font-black text-slate-500 tracking-widest uppercase ml-4">{field}</label>
                                  
                                  {field === 'Color' || field === 'Primary Color' || field === 'Frame Color' ? (
                                    <select
                                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white focus:border-uni-500 outline-none transition-all min-h-[48px]"
                                      value={attributes[field] || ''}
                                      onChange={(e) => setAttributes({ ...attributes, [field]: e.target.value })}
                                    >
                                      <option value="">Select Color</option>
                                      {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                  ) : field === 'Condition' ? (
                                    <select
                                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold text-white focus:border-uni-500 outline-none transition-all min-h-[48px]"
                                      value={attributes[field] || ''}
                                      onChange={(e) => setAttributes({ ...attributes, [field]: e.target.value })}
                                    >
                                      <option value="">Select Condition</option>
                                      {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                  ) : (
                                    <input 
                                      type="text"
                                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all tracking-widest uppercase min-h-[48px]"
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

                     {(!item?.challenge_questions || item.challenge_questions.length === 0) && (
                       <div className="space-y-3 text-left">
                          <label className="text-[9px] font-black text-slate-500 tracking-widest ml-6 flex items-center gap-2 uppercase">
                             <i className="fa-solid fa-pen-nib text-[8px] text-uni-400"></i>
                             {item?.challenge_question ? "Your Answer" : "Describe proof only the owner would know"}
                          </label>
                          <textarea 
                              rows="5"
                              required
                              placeholder={item?.challenge_question ? "Type your answer to the question above..." : "e.g. There's a scratch on the top-left corner, my wallpaper is a sunset photo, the case has a sticker..."}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-wide text-[12px] min-h-[120px] resize-none leading-relaxed"
                              value={proof}
                              onChange={(e) => setProof(e.target.value)}
                          />
                       </div>
                     )}

                    <button
                      disabled={
                        (item?.challenge_questions?.length > 0 && item.challenge_questions.some((_, i) => !challengeAnswers[i] || challengeAnswers[i].length < 3)) ||
                        (proof.length < 5 && (!item?.challenge_questions || item.challenge_questions.length === 0))
                      }
                      onClick={() => goToStep(2)}
                      className="w-full bg-uni-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-[0.98] disabled:opacity-20 min-h-[56px] flex items-center justify-center gap-3"
                    >
                      Continue <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                 </div>
               </div>
             )}

             {/* ═══════════════════════════════════════════════════
                 STEP 2: Photo Evidence
                 ═══════════════════════════════════════════════════ */}
             {actualStep === 2 && (
               <div className="space-y-10 flex-grow flex flex-col justify-center py-8 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest italic">
                        {isIdentifiedItem ? 'Step 2: Security Verification' : 'Step 2: Photo Evidence (Optional)'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none italic">
                        {isIdentifiedItem ? <>Upload your<br/>Student ID</> : <>"Got a photo<br/>of the item?"</>}
                    </h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
                        {isIdentifiedItem ? 'Take a clear photo of your ID card to match the system record.' : 'A photo of you with the item, its receipt, or a screenshot of a unique mark.'}
                    </p>
                 </div>

                 <div className="max-w-xl mx-auto w-full space-y-8">
                    <div className="p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 flex items-center justify-center min-h-[220px]">
                        <ImageUpload
                            value={proofPhotoUrl}
                            onUploadSuccess={(url) => setProofPhotoUrl(url)}
                        />
                    </div>

                    <button
                      onClick={() => goToStep(3)}
                      disabled={isIdentifiedItem && !proofPhotoUrl}
                      className="w-full bg-uni-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-[0.98] disabled:opacity-20 min-h-[56px] flex items-center justify-center gap-3"
                    >
                      {proofPhotoUrl ? <>Continue <i className="fa-solid fa-arrow-right text-[10px]"></i></> : isIdentifiedItem ? <>Upload ID to Continue <i className="fa-solid fa-lock text-[10px]"></i></> : <>Skip & Continue <i className="fa-solid fa-arrow-right text-[10px]"></i></>}
                    </button>
                 </div>
               </div>
             )}

             {/* ═══════════════════════════════════════════════════
                 STEP 3: Identity + Contact (Guests only)
                 ═══════════════════════════════════════════════════ */}
             {actualStep === 3 && !user && (
               <div className="space-y-10 flex-grow flex flex-col justify-center py-8 text-center">
                 <div className="space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest italic">Step 3: Your Info</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none italic">"Who's claiming<br/>& how to reach you?"</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">We need your identity and preferred contact method.</p>
                 </div>

                 <div className="max-w-2xl mx-auto w-full space-y-8">
                    {/* ── "Have an Account?" Login Shortcut ── */}
                    <div className="p-5 bg-uni-500/5 border border-uni-500/15 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-right-to-bracket text-uni-400 text-sm"></i>
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-black text-white">Already have an account?</p>
                          <p className="text-[9px] text-slate-400 font-bold">Sign in to auto-fill your details</p>
                        </div>
                      </div>
                      <Link
                        to={`/login?returnTo=${encodeURIComponent(`/submit-claim/${itemId}`)}`}
                        className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all shrink-0 min-h-[44px] flex items-center"
                      >
                        Sign In →
                      </Link>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-grow h-px bg-white/10"></div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Or continue as guest</span>
                      <div className="flex-grow h-px bg-white/10"></div>
                    </div>

                    {/* Identity Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">First Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Juan"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] min-h-[48px]"
                                value={guestFirstName}
                                onChange={(e) => setGuestFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">Last Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Dela Cruz"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] min-h-[48px]"
                                value={guestLastName}
                                onChange={(e) => setGuestLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* College Selector */}
                    <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">College / Department</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {COLLEGES.map((college) => (
                                <button
                                    key={college.id}
                                    type="button"
                                    onClick={() => setCourseDepartment(college.label)}
                                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden min-h-[48px] ${
                                        courseDepartment === college.label
                                            ? 'bg-uni-500 border-uni-500 text-white'
                                            : 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/20'
                                    }`}
                                >
                                    <i className={`fa-solid ${college.icon} text-xl transition-transform group-hover:scale-110 ${courseDepartment === college.label ? 'scale-110' : ''}`}></i>
                                    <span className="text-[8px] font-black tracking-widest text-center leading-tight">{college.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Method */}
                    <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">Preferred Contact</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Email', 'Facebook', 'Phone'].map(method => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setContactMethod(method)}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all min-h-[48px] ${
                                  contactMethod === method 
                                    ? 'bg-uni-500 border-uni-500 text-white scale-[1.02]' 
                                    : 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                              >
                                <i className={`fa-solid ${method === 'Facebook' ? 'fa-brands fa-facebook' : method === 'Phone' ? 'fa-mobile-screen' : 'fa-paper-plane'} text-xl`}></i>
                                <span className="text-[9px] font-black uppercase tracking-widest">{method}</span>
                              </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">{contactMethod} Details</label>
                            <input 
                                type={contactMethod === 'Email' ? 'email' : 'text'}
                                required
                                placeholder={contactMethod === 'Facebook' ? 'FB Link or Handle' : contactMethod === 'Phone' ? '09XX XXX XXXX' : 'your@email.com'}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] min-h-[48px]"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-5">Backup Email (Opt)</label>
                            <input 
                                type="email"
                                placeholder="Backup notification email"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white font-bold outline-none focus:border-uni-500 transition-all tracking-widest text-[11px] opacity-50 focus:opacity-100 min-h-[48px]"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                      disabled={(!guestFirstName) || (!guestLastName) || !courseDepartment || !contactInfo}
                      onClick={() => goToStep(4)}
                      className="w-full bg-uni-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-[0.98] disabled:opacity-20 min-h-[56px] flex items-center justify-center gap-3"
                    >
                      Review Claim <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                 </div>
               </div>
             )}

             {/* ═══════════════════════════════════════════════════
                 STEP 4 (or 3 for logged-in): Final Review
                 ═══════════════════════════════════════════════════ */}
             {actualStep === 4 && (
               <div className="space-y-10 flex-grow flex flex-col justify-center py-8">
                 <div className="space-y-4 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest italic">
                      {user ? 'Step 3' : 'Step 4'}: Final Review
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none italic">"Check everything<br/>one last time."</h2>
                 </div>

                 <div className="max-w-2xl mx-auto w-full space-y-5">
                    {/* ── Claimant Card ── */}
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Claimant</p>
                          {!user && (
                            <button onClick={() => goToStep(3)} className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                              <i className="fa-solid fa-pen text-[7px]"></i> Edit
                            </button>
                          )}
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center">
                            <i className="fa-solid fa-user text-uni-400 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-base font-black text-white uppercase italic">
                              {user ? `${user.first_name} ${user.last_name}` : `${guestFirstName} ${guestLastName}`}
                            </p>
                            <p className="text-[10px] text-uni-400 font-bold uppercase">{user ? (user.college || user.role) : courseDepartment}</p>
                          </div>
                       </div>
                    </div>

                    {/* ── Contact Card ── */}
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Contact Method</p>
                          {!user && (
                            <button onClick={() => goToStep(3)} className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                              <i className="fa-solid fa-pen text-[7px]"></i> Edit
                            </button>
                          )}
                       </div>
                       <div className="flex items-center gap-3">
                          <i className={`${contactMethod === 'Facebook' ? 'fa-brands fa-facebook' : 'fa-solid ' + (contactMethod === 'Phone' ? 'fa-mobile-screen' : 'fa-paper-plane')} text-uni-400`}></i>
                          <p className="text-[12px] font-black text-white uppercase tracking-widest">{contactInfo}</p>
                       </div>
                    </div>

                    {/* ── Evidence Card ── */}
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Ownership Evidence</p>
                          <button onClick={() => goToStep(1)} className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                            <i className="fa-solid fa-pen text-[7px]"></i> Edit
                          </button>
                       </div>
                       {item?.challenge_questions?.length > 0 ? (
                          <div className="space-y-4">
                             {item.challenge_questions.map((q, idx) => (
                               <div key={idx} className="p-4 bg-uni-500/5 rounded-xl border border-uni-500/10 space-y-1">
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Q: {q}</p>
                                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">"{challengeAnswers[idx]}"</p>
                               </div>
                             ))}
                          </div>
                       ) : (
                          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">"{proof}"</p>
                       )}

                       {Object.keys(attributes).filter(k => attributes[k]).length > 0 && (
                         <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-x-4 gap-y-2">
                            {Object.entries(attributes).filter(([,v]) => v).map(([k, v]) => (
                              <div key={k} className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{k}</span>
                                <span className="text-[10px] font-black text-uni-400 uppercase italic tracking-tight">{v}</span>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>

                    {/* ── Photo Card ── */}
                    {proofPhotoUrl && (
                      <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Photo Evidence</p>
                            <button onClick={() => goToStep(2)} className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                              <i className="fa-solid fa-pen text-[7px]"></i> Change
                            </button>
                         </div>
                         <div className="w-full h-40 rounded-xl border border-white/10 overflow-hidden relative group">
                            <img src={proofPhotoUrl} className="w-full h-full object-cover" alt="Proof" />
                         </div>
                      </div>
                    )}

                    {/* ── Action Buttons (Thumb Zone) ── */}
                    <div className="pt-4 space-y-3">
                        <button
                          disabled={claimMutation.isPending}
                          onClick={handleSubmit}
                          className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-uni-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-4 group min-h-[60px] shadow-xl shadow-black/20"
                        >
                          {claimMutation.isPending ? (
                            <div className="w-5 h-5 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                                <i className="fa-solid fa-paper-plane text-lg group-hover:rotate-12 transition-transform"></i>
                                Submit Claim
                            </>
                          )}
                        </button>
                        <button 
                            onClick={() => goToStep(user ? 2 : 3)} 
                            className="w-full py-4 rounded-xl bg-white/[0.03] text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all min-h-[48px]"
                        >
                            ← Wait, I need to edit
                        </button>
                    </div>
                 </div>
               </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubmitClaim;
