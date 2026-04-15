import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ReportSuccess = ({ 
  type = 'lost', 
  reportData, 
  userFormData 
}) => {
  const [ghostPassword, setGhostPassword] = useState('');
  const [fullName, setFullName] = useState(userFormData?.contact_full_name || '');
  const [studentId, setStudentId] = useState('');
  const [ghostEmail, setGhostEmail] = useState('');
  const [ghosting, setGhosting] = useState(false);
  const [ghostDone, setGhostDone] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showIncentiveModal, setShowIncentiveModal] = useState(type === 'lost'); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGhostUpgrade = async (e) => {
    e.preventDefault();
    setGhosting(true);
    setError('');

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ghostEmail,
        password: ghostPassword,
      });

      if (authError) throw authError;

      // 2. Initial Profile creation in public.users
      const names = fullName.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const { error: dbError } = await supabase
        .from('user_profiles_v1')
        .insert([
          {
            email: ghostEmail,
            role: 'student',
            first_name: firstName,
            last_name: lastName,
            student_id_number: studentId,
            integrity_points: 0,
            fraud_strikes: 0,
            is_blacklisted: false,
            is_verified: false,
            show_full_name: false
          }
        ]);

      if (dbError) throw dbError;

      setGhostDone(true);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err) {
      console.error("Upgrade failed:", err);
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setGhosting(false);
    }
  };

  const PremiumInvitationModal = () => (
    <AnimatePresence>
      {showIncentiveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-main/90 backdrop-blur-xl"
            onClick={() => setShowIncentiveModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative w-full max-w-2xl bg-slate-900 rounded-[3.5rem] border-2 border-uni-500/30 overflow-hidden"
          >
            {/* Ambient decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-uni-500/20 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-gold/10 blur-[80px] rounded-full"></div>

            <div className="p-10 md:p-16 space-y-12 text-center relative z-10">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-uni-500 rounded-3xl flex items-center justify-center mx-auto text-5xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  ✨
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none pt-4">
                  Wait! Before you go...
                </h2>
                <p className="text-sm font-black text-uni-400 uppercase tracking-[0.3em]">Unlock Institutional Benefits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                    <div className="text-3xl">🛡️</div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Safety Net</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Instant alerts via Student ID matches</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                    <div className="text-3xl">🏛️</div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">College Honor</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Earn points for your department rankings</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                    <div className="text-3xl">🏆</div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Official Merit</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Get an Official Univ. Certificate</p>
                 </div>
              </div>


              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowIncentiveModal(false);
                    setShowAccountForm(true);
                  }}
                  className="w-full bg-white text-black py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.6em] border border-black/5 hover:bg-uni-500 hover:text-white transition-all active:scale-95"
                >
                  Awesome! Create My Account
                </button>
                <button 
                  onClick={() => setShowIncentiveModal(false)}
                  className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-white transition-colors"
                >
                  Skip these benefits for now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
      <PremiumInvitationModal />
      <div className="text-center space-y-6">
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-4xl"
         >
           {type === 'lost' ? '📡' : '🤝'}
         </motion.div>
         <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
            {type === 'lost' ? 'Report Submitted' : 'Thank you for helping!'}
         </h1>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
           {type === 'lost' 
             ? "We've listed your lost item in the public registry. We'll notify you if we find a match."
             : "Your report is now live in the University Registry."}
         </p>
      </div>

      {type === 'found' && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 space-y-8 backdrop-blur-xl relative overflow-hidden text-left"
        >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <i className="fa-solid fa-file-invoice text-6xl"></i>
            </div>

            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-uni-500/20 rounded-3xl flex items-center justify-center text-3xl text-uni-400 border border-uni-500/30">
                  <i className="fa-solid fa-person-walking-arrow-right"></i>
               </div>
               <div className="text-left space-y-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Final Step:</p>
                  <p className="text-xl font-black text-uni-400 uppercase italic tracking-tight leading-none">Deliver to USG Office</p>
               </div>
            </div>

            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
               Please bring the item to the <span className="text-white">USG Office</span> for verification. Your report will be posted to the public feed once the item is in our custody.
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Found Location</p>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">{reportData?.location}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Receipt ID</p>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">#{reportData?.id}</p>
                </div>
            </div>
        </motion.div>
      )}

      {!ghostDone ? (
        <div className="space-y-6 text-left">
          {type === 'found' && !showAccountForm && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAccountForm(true)}
              className="w-full p-8 bg-white/5 border border-uni-500/20 rounded-[2.5rem] flex items-center justify-between group transition-all hover:bg-uni-500/10"
            >
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-uni-500/20 rounded-2xl flex items-center justify-center text-2xl text-uni-400">
                     <i className="fa-solid fa-shield-heart group-hover:scale-110 transition-transform"></i>
                  </div>
                  <div className="text-left">
                     <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">Claim Integrity Points</p>
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Save your history & build your reputation</p>
                  </div>
               </div>
               <i className="fa-solid fa-chevron-right text-slate-600 group-hover:translate-x-1 transition-transform mr-4"></i>
            </motion.button>
          )}

          <AnimatePresence>
            {showAccountForm && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 glass-panel rounded-[3.5rem] border-2 border-uni-500/20 space-y-10 relative overflow-hidden bg-slate-900/50"
              >
                  {type === 'found' && (
                    <button 
                      onClick={() => setShowAccountForm(false)}
                      className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}

                  <div className="absolute top-0 right-0 p-8 hidden md:block">
                      <span className="bg-uni-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] border border-uni-400/20">Account Benefit</span>
                  </div>

                  <div className="text-left space-y-3">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                         {type === 'lost' ? 'Create a Secure Account' : 'Register My Contribution'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed max-w-sm">
                        Receive instant alerts via Student ID and earn Integrity Points for your college.
                      </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleGhostUpgrade} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="upgrade-full-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                            <input 
                                id="upgrade-full-name"
                                name="full-name"
                                type="text"
                                placeholder="Full Name"
                                className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="upgrade-student-id" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Student ID</label>
                            <input 
                                id="upgrade-student-id"
                                name="student-id"
                                type="text"
                                placeholder="Student ID"
                                className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                            />
                          </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="upgrade-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                        <input 
                            id="upgrade-email"
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                            value={ghostEmail}
                            onChange={(e) => setGhostEmail(e.target.value)}
                            required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="upgrade-password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Set Password</label>
                        <input 
                            id="upgrade-password"
                            name="password"
                            type="password"
                            placeholder="Set Password"
                            className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                            value={ghostPassword}
                            onChange={(e) => setGhostPassword(e.target.value)}
                            required
                        />
                      </div>
                      <button 
                          type="submit"
                          disabled={ghosting}
                          className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-400 hover:text-white active:scale-95 transition-all border border-black/5"
                      >
                          {ghosting ? 'Creating Account...' : 'Create Account & Save'}
                      </button>
                  </form>
                  {type === 'lost' && (
                    <Link to="/" className="block text-center text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] hover:text-white transition-colors">
                      Skip for now
                    </Link>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-16 glass-panel rounded-[4rem] border-2 border-green-500/20 text-center space-y-6"
        >
           <i className="fa-solid fa-user-check text-5xl text-green-400 mb-4"></i>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Account Created</h2>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Redirecting to your dashboard...</p>
        </motion.div>
      )}

      {(!ghostDone && type === 'found') && (
        <div className="pt-6 flex flex-col items-center gap-6">
            <Link to="/" className="inline-flex items-center gap-4 bg-white/5 border border-white/10 text-white/40 px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-black hover:border-white transition-all active:scale-95">
                Return Home
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
            <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em]">You can walk away now—your report is already safe.</p>
        </div>
      )}

      {type === 'lost' && !ghostDone && (
        <div className="pt-10 flex justify-center">
          <Link to="/" className="px-12 py-4 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">
             ← Back to Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReportSuccess;
