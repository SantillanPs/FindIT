import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import { CATEGORIES } from '../constants/categories';

const GuestReportItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    last_seen_time: new Date().toISOString().slice(0, 16),
    contact_full_name: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const navigate = useNavigate();

  const [categoryStats, setCategoryStats] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [otherItemName, setOtherItemName] = useState('');

  // Ghost Account Stats
  const [ghostPassword, setGhostPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [ghostEmail, setGhostEmail] = useState('');
  const [ghosting, setGhosting] = useState(false);
  const [ghostDone, setGhostDone] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await apiClient.get('/categories/stats');
        setCategoryStats(resp.data);
      } catch (err) {
        console.error("Failed to fetch cluster stats", err);
      }
    };
    fetchStats();
  }, []);

  const sortedCategories = useMemo(() => {
    const statsMap = categoryStats.reduce((acc, curr) => ({
      ...acc, [curr.category_id]: curr.hit_count
    }), {});
    
    return [...CATEGORIES].sort((a, b) => {
      if (a.id === 'Other') return 1;
      if (b.id === 'Other') return -1;
      return (statsMap[b.id] || 0) - (statsMap[a.id] || 0);
    });
  }, [categoryStats]);

  const featuredCategories = sortedCategories.slice(0, 6);
  const remainingCategories = sortedCategories.slice(6).filter(c => c.id !== 'Other');
  const otherCategory = CATEGORIES.find(c => c.id === 'Other');

  const prevStep = () => setStep(s => s - 1);
  const goToStep = (target) => setStep(target);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalData = { ...formData };
      if (formData.category === 'Other') {
        finalData.item_name = otherItemName;
      } else {
        finalData.item_name = formData.category;
      }

      await apiClient.post('/lost/report/guest', finalData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGhostUpgrade = async (e) => {
    e.preventDefault();
    setGhosting(true);
    try {
      const response = await apiClient.post('/auth/upgrade-guest', {
        email: ghostEmail,
        full_name: fullName,
        student_id_number: studentId,
        password: ghostPassword
      });
      
      const { access_token, user: loggedInUser } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      setGhostDone(true);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Account creation failed.');
    } finally {
      setGhosting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, y: -30, transition: { duration: 0.3 } }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
        <div className="text-center space-y-6">
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-4xl shadow-2xl"
           >
             📡
           </motion.div>
           <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">Report Submitted</h1>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
             We've listed your lost item in the public registry. We'll notify you if we find a match.
           </p>
        </div>

        {!ghostDone ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 glass-panel rounded-[3.5rem] border-2 border-uni-500/20 space-y-10 relative overflow-hidden shadow-2xl"
          >
             <div className="absolute top-0 right-0 p-8">
                <span className="bg-uni-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] shadow-xl animate-pulse">Account Benefit</span>
             </div>

             <div className="text-left space-y-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Create a Secure Account</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">Creating an account allows you to track matches and manage your reports.</p>
             </div>

             <form onSubmit={handleGhostUpgrade} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                    <input 
                        type="text"
                        placeholder="Student ID (Optional)"
                        className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                    />
                </div>
                <input 
                    type="email"
                    placeholder="Email Address (@nemsu.edu.ph)"
                    className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                    value={ghostEmail}
                    onChange={(e) => setGhostEmail(e.target.value)}
                    pattern="[a-zA-Z0-9._%+-]+@nemsu\.edu\.ph"
                    title="Please use your institutional email (@nemsu.edu.ph)"
                    required
                />
                <input 
                    type="password"
                    placeholder="Password"
                    className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-sm font-black text-white focus:border-uni-500 outline-none"
                    value={ghostPassword}
                    onChange={(e) => setGhostPassword(e.target.value)}
                    required
                />
                <button 
                    type="submit"
                    disabled={ghosting}
                    className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-400 active:scale-95 transition-all shadow-2xl"
                >
                    {ghosting ? 'Creating...' : 'Create Account'}
                </button>
             </form>
             <Link to="/" className="block text-center text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] hover:text-white transition-colors">
               Skip for now
             </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-16 glass-panel rounded-[4rem] border-2 border-green-500/20 text-center space-y-6 shadow-2xl"
          >
             <i className="fa-solid fa-user-check text-5xl text-green-400 mb-4 animate-bounce"></i>
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Account Created</h2>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Redirecting to your dashboard...</p>
          </motion.div>
        )}

        <div className="pt-10 flex justify-center">
          <Link to="/" className="px-12 py-4 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">
             ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      {/* Dynamic Header */}
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2 text-left">
                 <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em] italic">Lost Item Report</p>
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Report Lost Item</h1>
              </div>
              <div className="flex items-center gap-6 bg-white/5 p-4 rounded-[2rem] border border-white/5 shadow-2xl">
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

      <div className="flex-grow flex flex-col relative">
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
              <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 1: Item Category</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"First, what did<br/>you lose?"</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the category that best fits your lost item.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto w-full">
                    {featuredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setFormData({ ...formData, category: cat.id, item_name: cat.id });
                          setTimeout(() => goToStep(2), 400);
                        }}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${
                          formData.category === cat.id 
                            ? 'bg-uni-500 border-uni-500 text-white shadow-2xl shadow-uni-500/40' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:scale-[1.02] active:scale-95'
                        }`}
                      >
                        <div className={`text-4xl transition-transform group-hover:scale-110 ${formData.category === cat.id ? 'scale-110' : ''}`}>
                          <i className={cat.icon}></i>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-center">{cat.label}</span>
                      </button>
                    ))}
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-6">
                    <button 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full py-4 text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-all bg-white/5 rounded-2xl border border-white/10"
                    >
                      {showAllCategories ? '− Show Simple View' : '+ Show All Categories'}
                    </button>

                    <AnimatePresence>
                      {showAllCategories && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10"
                        >
                          {remainingCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setFormData({ ...formData, category: cat.id, item_name: cat.id });
                                setTimeout(() => goToStep(2), 400);
                              }}
                              className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${
                                formData.category === cat.id 
                                  ? 'bg-uni-500 border-uni-500 text-white shadow-xl' 
                                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <i className={`${cat.icon} text-2xl group-hover:scale-110 transition-transform`}></i>
                              <span className="text-[9px] font-black uppercase tracking-widest">{cat.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-8 ${
                      formData.category === 'Other' 
                        ? 'bg-white/10 border-uni-500 shadow-2xl' 
                        : 'bg-white/5 border-dashed border-white/10'
                    }`}>
                      <button
                        onClick={() => setFormData({ ...formData, category: 'Other' })}
                        className={`flex items-center gap-6 w-full justify-center ${
                          formData.category === 'Other' ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                         <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                           <i className={otherCategory.icon}></i>
                         </div>
                         <div className="text-left">
                           <p className="text-[11px] font-black uppercase tracking-widest">Something Else?</p>
                           <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1">Manual Entry</p>
                        </div>
                      </button>

                      <AnimatePresence>
                        {formData.category === 'Other' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-6 pt-6 border-t border-white/5"
                          >
                            <input 
                              type="text"
                              placeholder="Type the item name clearly..."
                              className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white text-center focus:border-uni-500 transition-all outline-none"
                              value={otherItemName}
                              onChange={(e) => setOtherItemName(e.target.value)}
                              autoFocus
                            />
                            <button 
                              onClick={() => goToStep(2)}
                              disabled={!otherItemName}
                              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-uni-400 hover:text-white transition-all shadow-xl"
                            >
                              Confirm Item →
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 2: Last Seen At</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"And last seen<br/>where?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the location where you last saw the item.</p>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-10 group">
                    <div className="relative">
                       <i className="fa-solid fa-location-crosshairs absolute left-8 top-1/2 -translate-y-1/2 text-uni-400 text-2xl opacity-60"></i>
                       <input 
                        type="text"
                        placeholder="e.g. Science Library, Student Plaza"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[3.5rem] p-10 pl-20 text-2xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl"
                        value={formData.location_zone}
                        onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                        autoFocus
                      />
                    </div>
                    
                    <button 
                      onClick={() => goToStep(3)} 
                      disabled={!formData.location_zone}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 3: Approximate Time</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"When did it go<br/>missing?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the date and time you last saw your item.</p>
                </div>

                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="p-10 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col gap-6">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">Date & Time</label>
                       <input 
                        type="datetime-local"
                        className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white focus:border-uni-500 outline-none"
                        value={formData.last_seen_time}
                        onChange={(e) => setFormData({...formData, last_seen_time: e.target.value})}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => goToStep(4)} 
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 4: Item Details</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Additional details<br/>about the item?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Describe unique marks, colors, or brands to help us identify it.</p>
                </div>
                <div className="space-y-8 max-w-2xl mx-auto w-full text-left">
                    <textarea 
                      rows="5"
                      placeholder={`e.g. Scratched blue case, name sticker 'ALICE' on back, cracked screen corner...`}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl resize-none leading-relaxed"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      autoFocus
                    />
                    <button 
                      onClick={() => goToStep(5)} 
                      disabled={!formData.description || formData.description.length < 5}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 5: Your Information</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"And finally,<br/>what is your name?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Please provide your name for the report registry.</p>
                </div>
                <div className="max-w-md mx-auto w-full space-y-10 group">
                    <div className="relative">
                       <i className="fa-solid fa-user-check absolute left-8 top-1/2 -translate-y-1/2 text-uni-400 text-2xl group-focus-within:scale-110 transition-transform"></i>
                       <input 
                        type="text"
                        placeholder="Your Full Name"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] p-10 pl-20 text-2xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl"
                        value={formData.contact_full_name}
                        onChange={(e) => setFormData({...formData, contact_full_name: e.target.value})}
                        required
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => goToStep(6)} 
                      disabled={!formData.contact_full_name}
                      className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      Review Summary →
                    </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <div className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-4xl mb-6 shadow-2xl">📡</div>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public registry.</p>
                </div>
                
                <div className="max-w-4xl mx-auto w-full space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 glass-panel rounded-[3rem] border border-white/5 text-left space-y-8 shadow-2xl flex flex-col justify-center">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Item Details</p>
                            <p className="text-xl font-black text-white uppercase tracking-tight italic">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                         </div>
                         <div className="space-y-1 border-t border-white/5 pt-8">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Last Seen At</p>
                            <p className="text-xl font-black text-white uppercase tracking-tight">{formData.location_zone}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 text-left space-y-4 shadow-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Registry Status</p>
                            <div className="flex items-center gap-4">
                               <div className="w-3 h-3 rounded-full bg-uni-400 animate-pulse"></div>
                               <p className="text-sm font-black text-uni-400 uppercase tracking-widest">Ready to post</p>
                            </div>
                            <div className="pt-6 border-t border-white/5">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic block mb-1">Reported by</p>
                               <p className="text-sm font-black text-white uppercase tracking-widest">{formData.contact_full_name}</p>
                            </div>
                         </div>

                         <button 
                          onClick={handleSubmit} 
                          disabled={loading}
                          className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:bg-uni-400 hover:text-white transition-all group flex items-center justify-center gap-6"
                        >
                          {loading ? (
                            <>
                              <div className="w-6 h-6 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                               <i className="fa-solid fa-paper-plane text-2xl group-hover:rotate-12 transition-transform"></i>
                               Submit Report
                            </>
                          )}
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10"
        >
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-8 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all flex items-center gap-4 group"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Previous Step
            </button>
          ) : (
             <Link to="/" className="px-8 py-3 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
                Cancel
             </Link>
          )}
          
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-3 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            University Lost & Found Registry
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GuestReportItem;
