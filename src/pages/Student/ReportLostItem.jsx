import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../constants/categories';
const ReportLostItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    last_seen_time: new Date().toISOString().slice(0, 16),
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [otherItemName, setOtherItemName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [trackingId, setTrackingId] = useState('');

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

      if (!user) {
        finalData.guest_full_name = guestName;
        finalData.guest_email = guestEmail;
      }

      const resp = await apiClient.post('/lost/report', finalData);
      
      if (!user && resp.data.tracking_id) {
        setTrackingId(resp.data.tracking_id);
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
  };

  if (trackingId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 px-4 text-center space-y-12"
      >
        <div className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-uni-500/20 shadow-2xl shadow-uni-500/10">
            <i className="fa-solid fa-satellite-dish text-4xl text-uni-400"></i>
        </div>
        
        <div className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic italic">"Registry Alert Active"</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed max-w-sm mx-auto">
                Your lost report is now live. We've sent a management link to <span className="text-white">{guestEmail}</span>.
            </p>
        </div>

        <div className="p-8 bg-slate-900/60 rounded-[2rem] border border-white/10 space-y-4 backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Your Tracking & Management Link</span>
            <p className="text-uni-400 font-black tracking-widest text-[11px] break-all select-all bg-black/40 p-4 rounded-xl border border-white/5">
                {window.location.origin}/lost-report-status/{trackingId}
            </p>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Save this link to view matches or cancel the report.</p>
        </div>

        <div className="pt-6">
            <Link to="/" className="inline-flex items-center gap-4 bg-white text-black px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-400 hover:text-white transition-all shadow-2xl active:scale-95">
                Return to Registry
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      {/* Header with high-impact status */}
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em]">Lost Item Report</p>
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">Find My Item</h1>
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
              <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                {!user && (
                    <div className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Your real name"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white tracking-widest focus:border-uni-500 transition-all outline-none"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">University Email</label>
                            <input 
                                type="email"
                                required
                                placeholder="yourname@nemsu.edu.ph"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white tracking-widest focus:border-uni-500 transition-all outline-none"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                pattern="[a-zA-Z0-9._%+-]+@nemsu\.edu\.ph"
                                title="Please use your institutional email (@nemsu.edu.ph)"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-4 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2">Item Category</span>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">"First, what did<br/>you lose?"</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">Select the category that best fits your lost item.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto w-full">
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
                        {formData.category === cat.id && (
                          <motion.div layoutId="select-ring" className="absolute inset-2 border-2 border-white/20 rounded-[2rem] pointer-events-none" />
                        )}
                      </button>
                    ))}
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600 tracking-widest"><span className="bg-[#0f172a] px-4">More Options</span></div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full py-4 text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-[0.3em] transition-all bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10"
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
                                  ? 'bg-uni-500 border-uni-500 text-white' 
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

                    {/* Conversational "Other" flow */}
                    <div className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-8 ${
                      formData.category === 'Other' 
                        ? 'bg-white/10 border-uni-500 shadow-2xl shadow-uni-500/10' 
                        : 'bg-white/5 border-dashed border-white/10'
                    }`}>
                      <button
                        onClick={() => setFormData({ ...formData, category: 'Other' })}
                        className={`flex items-center gap-6 w-full justify-center transition-all ${
                          formData.category === 'Other' ? 'text-white scale-105' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10">
                          <i className={otherCategory.icon}></i>
                        </div>
                        <div className="text-left">
                           <p className="text-[11px] font-black uppercase tracking-widest">Something else?</p>
                           <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em]">Manual entry</p>
                        </div>
                      </button>

                      <AnimatePresence>
                        {formData.category === 'Other' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-6 pt-4 border-t border-white/5"
                          >
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest text-center">"Type the item name"</p>
                               <input 
                                 type="text"
                                 placeholder="e.g. Scientific Calculator, Blue Water Bottle"
                                 className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white text-center tracking-tight focus:border-uni-500 transition-all outline-none placeholder:text-slate-700"
                                 value={otherItemName}
                                 onChange={(e) => setOtherItemName(e.target.value)}
                                 autoFocus
                               />
                            </div>
                            <button 
                              onClick={() => goToStep(2)}
                              disabled={!otherItemName}
                              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] disabled:opacity-20 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                              Confirm Item →
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                <div className="space-y-4 text-center">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2">Step 2: Last Seen At</span>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">"Where did you last<br/>see your item?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Help us narrow down the search area.</p>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-10 group">
                    <div className="relative">
                       <i className="fa-solid fa-location-crosshairs absolute left-6 top-1/2 -translate-y-1/2 text-uni-400 text-xl opacity-50"></i>
                       <input 
                        type="text"
                        placeholder="e.g. Science Library, Building A Room 402"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-8 pl-16 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-600"
                        value={formData.location_zone}
                        onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Main Library', 'Cafeteria', 'Field / Plaza', 'Building 101', 'IT Center'].map(loc => (
                          <button 
                            key={loc}
                            onClick={() => setFormData({...formData, location_zone: loc})}
                            className={`p-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                              formData.location_zone === loc 
                                ? 'bg-uni-500 border-uni-500 text-white shadow-lg' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                    </div>

                    <button 
                      onClick={() => goToStep(3)} 
                      disabled={!formData.location_zone}
                      className="w-full bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                <div className="space-y-4 text-center">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2">Step 3: Approximate Time</span>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">"When did you<br/>lose it?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the date and time you last saw your item.</p>
                </div>

                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="p-8 glass-panel rounded-[3rem] border border-white/10 space-y-6">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center mb-2">Date & Time</label>
                       <input 
                        type="datetime-local"
                        className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-lg font-black text-white focus:border-uni-500 transition-all outline-none"
                        value={formData.last_seen_time}
                        onChange={(e) => setFormData({...formData, last_seen_time: e.target.value})}
                        autoFocus
                      />
                    </div>
                    
                    <button 
                      onClick={() => goToStep(4)} 
                      className="w-full bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
                    >
                      Next Step →
                    </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                <div className="space-y-4 text-center">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2">Step 4: Item Description</span>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">"Additional details<br/>about the item?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-sm mx-auto">Mention any unique marks, scratches, or specifics.</p>
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-10 text-left">
                    <div className="relative">
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#0f172a] px-3">
                         <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">{formData.description.length} chars</p>
                      </div>
                      <textarea 
                        rows="5"
                        placeholder={`Start writing here...\ne.g. "It's a blue hydroflask with a panda sticker on the side and a dent on the bottom cap"`}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 resize-none leading-relaxed"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        autoFocus
                      />
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <i className="fa-solid fa-lightbulb text-uni-400"></i>
                         Pro Tip
                       </p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                         The more specific you are, the easier it is to find a match in the registry.
                       </p>
                    </div>

                    <button 
                      onClick={() => goToStep(5)} 
                      disabled={!formData.description || formData.description.length < 10}
                      className="w-full bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95 flex items-center justify-center gap-4"
                    >
                      Review Summary →
                    </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 flex-grow flex flex-col justify-center py-10">
                <div className="space-y-4 text-center">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-4xl mb-6 shadow-2xl shadow-green-500/10">🛰️</div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8">Confirm the details before posting to the registry.</p>
                </div>
                
                <div className="max-w-2xl mx-auto w-full space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 text-left space-y-6">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Category</p>
                            <p className="text-lg font-black text-white uppercase italic tracking-tighter">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                         </div>
                         <div className="space-y-1 border-t border-white/5 pt-4">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Last Seen At</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight">{formData.location_zone}</p>
                         </div>
                      </div>

                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-left flex flex-col justify-between">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Status</p>
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-uni-400 animate-pulse"></div>
                               <p className="text-xs font-black text-uni-400 uppercase tracking-widest">Ready to post</p>
                            </div>
                         </div>
                         <div className="space-y-1 mt-6">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reported by</p>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">{user?.full_name || guestName || 'Guest Student'}</p>
                         </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="w-full bg-white text-black py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] shadow-2xl hover:bg-uni-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-6 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane text-xl group-hover:rotate-12 transition-transform"></i>
                        Submit Report
                      </>
                    )}
                  </button>
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
          className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8"
        >
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-8 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all flex items-center gap-4 group"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Previous Step
            </button>
          ) : (
             <Link to="/" className="px-8 py-3 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
               Cancel
             </Link>
          )}
          
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] flex items-center gap-3 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            University Lost & Found Registry
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportLostItem;
