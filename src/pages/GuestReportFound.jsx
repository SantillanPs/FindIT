import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import ImageUpload from '../components/ImageUpload';
import { CATEGORIES } from '../constants/categories';

const GuestReportFound = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    found_time: new Date().toISOString().slice(0, 16),
    safe_photo_url: '',
    contact_full_name: '',
    identified_student_id: '',
    identified_name: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 7;
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
  const [hasIdentification, setHasIdentification] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [reportData, setReportData] = useState(null);

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

  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

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

      const resp = await apiClient.post('/found/report/guest', finalData);
      setReportData(resp.data);
      setSuccess(true);
      window.scrollTo(0, 0); // Jump back up to see the success message
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
        full_name: formData.contact_full_name,
        student_id_number: studentId
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-12">
        <div className="text-center space-y-8">
           <motion.div 
             initial={{ scale: 0, rotate: -20 }}
             animate={{ scale: 1, rotate: 0 }}
             className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-4xl shadow-2xl shadow-uni-500/10"
           >
             🤝
           </motion.div>
           
           <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Thank you for helping!</h1>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                Your report is now live in the <span className="text-white">University Registry</span>.
              </p>
           </div>
        </div>

        {/* Digital Receipt Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 space-y-8 backdrop-blur-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <i className="fa-solid fa-file-invoice text-6xl"></i>
            </div>

            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-uni-500/20 rounded-3xl flex items-center justify-center text-3xl text-uni-400 border border-uni-500/30 shadow-2xl shadow-uni-500/10">
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
                   <p className="text-xs font-bold text-white uppercase tracking-tight">{reportData?.location_zone}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Receipt ID</p>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">#{reportData?.id}</p>
                </div>
            </div>
        </motion.div>

        <div className="space-y-6">
          {!ghostDone && !showAccountForm && (
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
            {showAccountForm && !ghostDone && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-10 bg-slate-900/60 rounded-[3.5rem] border-2 border-uni-500/20 space-y-10 relative overflow-hidden shadow-[0_30px_60px_rgba(var(--uni-rgb),0.1)]"
              >
                 <button 
                  onClick={() => setShowAccountForm(false)}
                  className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                 >
                    <i className="fa-solid fa-xmark"></i>
                 </button>

                 <div className="text-left space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Register My Contribution</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed max-w-sm">Receive a notification when the owner claims this and earn Integrity Points.</p>
                 </div>

                 <form onSubmit={handleGhostUpgrade} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Name</label>
                           <input 
                               type="text"
                               className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-5 text-xs font-bold text-slate-500 tracking-widest outline-none cursor-not-allowed"
                               value={formData.contact_full_name}
                               disabled
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Student ID</label>
                           <input 
                               type="text"
                               placeholder="e.g. 2021-10042"
                               className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white tracking-widest focus:border-uni-500 outline-none transition-all"
                               value={studentId}
                               onChange={(e) => setStudentId(e.target.value)}
                               required
                           />
                        </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Institutional Email</label>
                       <input 
                           type="email"
                           placeholder="yourname@nemsu.edu.ph"
                           className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white tracking-widest focus:border-uni-500 outline-none transition-all"
                           value={ghostEmail}
                           onChange={(e) => setGhostEmail(e.target.value)}
                           pattern="[a-zA-Z0-9._%+-]+@nemsu\.edu\.ph"
                           title="Please use your institutional email (@nemsu.edu.ph)"
                           required
                       />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={ghosting}
                        className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group"
                    >
                        {ghosting ? (
                          <div className="w-5 h-5 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i className="fa-solid fa-medal group-hover:scale-125 transition-transform"></i>
                        )}
                        Confirm and Save contribution
                    </button>
                 </form>
              </motion.div>
            )}
          </AnimatePresence>

          {ghostDone && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-16 glass-panel rounded-[4rem] border-2 border-green-500/20 text-center space-y-6 shadow-[0_40px_80px_rgba(34,197,94,0.1)]"
            >
               <i className="fa-solid fa-circle-check text-5xl text-green-400 mb-4 animate-pulse"></i>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Contribution Saved</h3>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          {!ghostDone && (
            <div className="pt-6 flex flex-col items-center gap-6">
                <Link to="/" className="inline-flex items-center gap-4 bg-white/5 border border-white/10 text-white/40 px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-black hover:border-white transition-all shadow-2xl active:scale-95">
                    Return Home
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
                <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em]">You can walk away now—your report is already safe.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      {/* Heavy Header */}
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2 text-left">
                 <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em] italic flex items-center gap-2">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                    Found Item Report
                 </p>
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Report Found Item</h1>
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
                <div className="text-center space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 1: Upload Photo</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"First, upload a photo<br/>of the item."</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">A photo helps the owner identify their item faster.</p>
                </div>
                <div className="p-4 glass-panel rounded-[3.5rem] border border-white/10 max-w-xl mx-auto w-full shadow-2xl">
                  <ImageUpload 
                    value={formData.safe_photo_url}
                    onUploadSuccess={(url) => {
                      setFormData({...formData, safe_photo_url: url});
                      setTimeout(() => goToStep(2), 800);
                    }}
                  />
                </div>
                <AnimatePresence>
                    {formData.safe_photo_url && (
                       <motion.button 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => goToStep(2)} 
                        className="w-full max-w-md mx-auto bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-uni-400 hover:text-white transition-all active:scale-95"
                       >
                         Next Step →
                       </motion.button>
                    )}
                </AnimatePresence>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 2: Item Category</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"What kind of<br/>item is it?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select a category for the item.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto w-full">
                    {featuredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setFormData({ ...formData, category: cat.id, item_name: cat.id });
                          setTimeout(() => goToStep(3), 400);
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
                                setTimeout(() => goToStep(3), 400);
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
                        className={`flex items-center gap-6 w-full justify-center transition-all ${
                          formData.category === 'Other' ? 'text-white scale-105' : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                           <i className={otherCategory.icon}></i>
                        </div>
                        <div className="text-left">
                           <p className="text-[11px] font-black uppercase tracking-widest leading-none">Something else?</p>
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
                              onClick={() => goToStep(3)}
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

            {step === 3 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 3: Location</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Where was the item<br/>found?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Be as specific as possible (Building, room, or landmark).</p>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-10 group">
                    <div className="relative">
                       <i className="fa-solid fa-location-dot absolute left-8 top-1/2 -translate-y-1/2 text-uni-400 text-2xl group-focus-within:scale-110 transition-transform"></i>
                       <input 
                        type="text"
                        placeholder="e.g. Science Library, 2nd Floor, Near Stairs"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] p-10 pl-20 text-2xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl"
                        value={formData.location_zone}
                        onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                        autoFocus
                      />
                    </div>
                    
                    <button 
                      onClick={() => goToStep(4)} 
                      disabled={!formData.location_zone}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 4: Date & Time</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"When was it<br/>found?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the approximate date and time.</p>
                </div>

                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="p-10 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <input 
                        type="datetime-local"
                        className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white focus:border-uni-500 transition-all outline-none"
                        value={formData.found_time}
                        onChange={(e) => setFormData({...formData, found_time: e.target.value})}
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => goToStep(5)} 
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 5: Item Details</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Additional details<br/>about the item?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Describe what the item is (e.g., brand, color, type).</p>
                </div>
                <div className="space-y-8 max-w-2xl mx-auto w-full text-left">
                    <textarea 
                      rows="4"
                      placeholder={`e.g. Red backpack, iPhone 13 with a clear case...`}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      autoFocus
                    />
                    {!hasIdentification ? (
                      <button 
                        type="button"
                        onClick={() => setHasIdentification(true)}
                        className="w-full p-6 bg-white/5 border border-dashed border-white/20 rounded-3xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-4"
                      >
                        <i className="fa-solid fa-id-card text-lg text-uni-400"></i>
                        Found a name or Student ID on the item?
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-[3rem] border border-uni-500/30 shadow-2xl shadow-uni-500/5 relative"
                      >
                        <button 
                          onClick={() => {
                            setHasIdentification(false);
                            setFormData({...formData, identified_student_id: '', identified_name: ''});
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white z-10 shadow-xl"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>

                        <div className="space-y-2 p-4">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2">Student ID Found?</label>
                          <input 
                            type="text"
                            placeholder="e.g. 2021-10042"
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all"
                            value={formData.identified_student_id}
                            onChange={(e) => setFormData({...formData, identified_student_id: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 p-4">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2">Name on Item?</label>
                          <input 
                            type="text"
                            placeholder="e.g. Juan Cruz"
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all"
                            value={formData.identified_name}
                            onChange={(e) => setFormData({...formData, identified_name: e.target.value})}
                          />
                        </div>
                      </motion.div>
                    )}
                    <button 
                      onClick={() => goToStep(6)} 
                      disabled={!formData.description}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 6: Your Information</span>
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
                      onClick={() => goToStep(7)} 
                      disabled={!formData.contact_full_name}
                      className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      Review Summary →
                    </button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-4xl mb-6 shadow-2xl">🌍</div>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public feed.</p>
                </div>
                
                <div className="max-w-4xl mx-auto w-full space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative group">
                         <img src={formData.safe_photo_url} alt="Found item" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6 right-6 text-left">
                            <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic mb-1 text-shadow">Item Details</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight italic text-shadow">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 text-left space-y-6 shadow-2xl">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Found at</p>
                               <p className="text-lg font-black text-white uppercase tracking-tight leading-none">{formData.location_zone}</p>
                            </div>
                            <div className="space-y-1 border-t border-white/5 pt-6">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Reported by</p>
                               <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{formData.contact_full_name}</p>
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

export default GuestReportFound;
