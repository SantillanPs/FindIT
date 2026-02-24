import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../constants/categories';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    found_time: new Date().toISOString().slice(0, 16),
    safe_photo_url: '',
    identified_student_id: '',
    identified_name: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [otherItemName, setOtherItemName] = useState('');
  const [hasIdentification, setHasIdentification] = useState(false);

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
    if (!user?.is_verified) {
      setError('Please verify your account to report an item.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const finalData = { ...formData };
      if (formData.category === 'Other') {
        finalData.item_name = otherItemName;
      } else {
        finalData.item_name = formData.category;
      }

      await apiClient.post('/found/report', finalData);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      {/* Dynamic Header */}
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2 text-left">
                 <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em] italic flex items-center gap-2">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                    Found Item Report
                 </p>
                 <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">Report Found Item</h1>
              </div>
              <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-2xl">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                    <p className="text-sm font-black text-white uppercase italic">Step {step} of {totalSteps}</p>
                 </div>
                 <div className="w-14 h-14 rounded-full border-4 border-uni-500/20 border-t-uni-500 flex items-center justify-center text-[10px] font-black text-white italic shadow-[0_0_20px_rgba(var(--uni-rgb),0.2)]">
                   {Math.round((step / totalSteps) * 100)}%
                 </div>
              </div>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center rounded-[2rem] flex items-center justify-center gap-4"
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
              <div className="space-y-12 py-10 flex-grow flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 1: Upload Photo</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"First, show us<br/>what you found."</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Upload a photo of the item to help the owner identify it.</p>
                </div>
                <div className="p-4 glass-panel rounded-[3rem] border border-white/10 max-w-xl mx-auto w-full shadow-2xl">
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
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the best category for this item.</p>
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
                      className="w-full py-4 text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-all bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"
                    >
                      {showAllCategories ? '− Show Simple View' : '+ Expand All Categories'}
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
                                  ? 'bg-uni-500 border-uni-500 text-white shadow-xl shadow-uni-500/20' 
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
                          formData.category === 'Other' ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                          <i className={otherCategory.icon}></i>
                        </div>
                        <div className="text-left">
                           <p className="text-[11px] font-black uppercase tracking-widest leading-none">Something else?</p>
                           <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1">Manual entry</p>
                        </div>
                      </button>

                      <AnimatePresence>
                        {formData.category === 'Other' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] disabled:opacity-20 hover:bg-uni-400 hover:text-white transition-all shadow-xl shadow-white/5"
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
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Where exactly<br/>was it found?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the location where you found the item.</p>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-10">
                    <div className="relative group">
                       <i className="fa-solid fa-location-dot absolute left-8 top-1/2 -translate-y-1/2 text-uni-400 text-2xl group-focus-within:scale-125 transition-transform"></i>
                       <input 
                        type="text"
                        placeholder="e.g. Science Library, Student Lounge"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] p-10 pl-20 text-2xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl"
                        value={formData.location_zone}
                        onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                        autoFocus
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Main Library', 'Cafeteria', 'Building A', 'Student Plaza', 'Gymnasium'].map(loc => (
                          <button 
                            key={loc}
                            onClick={() => setFormData({...formData, location_zone: loc})}
                            className={`p-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                              formData.location_zone === loc 
                                ? 'bg-uni-500 border-uni-500 text-white shadow-xl shadow-uni-500/20' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
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
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"When did you<br/>find it?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">This helps us narrow down when the item was lost.</p>
                </div>

                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="p-10 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col gap-6">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Select Date & Time</label>
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
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
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
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">Describe what the item is (e.g., brand, color, type).</p>
                </div>
                <div className="space-y-8 max-w-2xl mx-auto w-full text-left">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Description</label>
                      <textarea 
                        rows="4"
                        placeholder={`e.g. Red backpack, iPhone 13 with a clear case...`}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        autoFocus
                      />
                    </div>
                    {!hasIdentification ? (
                      <button 
                        type="button"
                        onClick={() => setHasIdentification(true)}
                        className="w-full p-6 bg-white/5 border border-dashed border-white/20 rounded-[2.5rem] text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-4"
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
                        
                        <div className="space-y-3 p-4">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block ml-2 italic">Student ID Found?</label>
                          <input 
                            type="text"
                            placeholder="e.g. 2023-1042"
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all outline-none placeholder:text-slate-800"
                            value={formData.identified_student_id}
                            onChange={(e) => setFormData({...formData, identified_student_id: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3 p-4">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block ml-2 italic">Name on Item?</label>
                          <input 
                            type="text"
                            placeholder="e.g. Maria Clara"
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all outline-none placeholder:text-slate-800"
                            value={formData.identified_name}
                            onChange={(e) => setFormData({...formData, identified_name: e.target.value})}
                          />
                        </div>
                      </motion.div>
                    )}
                    <button 
                      onClick={() => goToStep(6)} 
                      disabled={!formData.description || formData.description.length < 5}
                      className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 flex items-center justify-center gap-4 active:scale-95"
                    >
                      Review Summary →
                    </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-4xl mb-6 shadow-2xl shadow-green-500/20">🏆</div>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Report Logged.<br/>What's Next?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Please deliver the item to the <span className="text-white">USG Office</span> for verification and posting.</p>
                </div>
                
                <div className="max-w-3xl mx-auto w-full space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative group">
                         <img src={formData.safe_photo_url} alt="Found item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6 right-6 text-left">
                            <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic leading-none mb-1 text-shadow">Status: Pending Delivery</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight italic text-shadow">#{formData.id || '...'} {formData.category === 'Other' ? otherItemName : formData.category}</p>
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
                               <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{user?.full_name}</p>
                            </div>
                         </div>

                         <button 
                          onClick={handleSubmit} 
                          disabled={loading}
                          className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-uni-500 hover:text-white transition-all active:scale-95 group flex items-center justify-center gap-6"
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
              className="px-10 py-4 rounded-2xl bg-white/5 text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all flex items-center gap-4 group border border-white/5"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Previous Step
            </button>
          ) : (
             <Link to="/student" className="px-10 py-4 rounded-2xl bg-red-500/5 text-red-500/40 hover:text-red-500 text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-red-500/5">
                Cancel
             </Link>
          )}
          
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-4 italic select-none">
            <span className="w-2 h-2 rounded-full bg-slate-800 animate-pulse"></span>
            University Lost & Found Registry
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportFoundItem;
