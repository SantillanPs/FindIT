import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterData } from '../../context/MasterDataContext';

const CategorySelection = ({ 
  formData, 
  setFormData, 
  categoryStats, 
  otherItemName, 
  setOtherItemName, 
  onNext 
}) => {
  const { categories: CATEGORIES, loading } = useMasterData();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const sortedCategories = useMemo(() => {
    const statsMap = categoryStats.reduce((acc, curr) => ({
      ...acc, [curr.category_id]: curr.hit_count
    }), {});
    
    return [...CATEGORIES].sort((a, b) => {
      if (a.id === 'Other') return 1;
      if (b.id === 'Other') return -1;
      return (statsMap[b.id] || 0) - (statsMap[a.id] || 0);
    });
  }, [categoryStats, CATEGORIES]); // Add CATEGORIES dependency

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  const featuredCategories = sortedCategories.slice(0, 6);
  const remainingCategories = sortedCategories.slice(6).filter(c => c.id !== 'Other');
  const otherCategory = CATEGORIES.find(c => c.id === 'Other') || { icon: 'fa-question-circle', label: 'Other' };

  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">Step 2: Item Category</span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Next, what kind of<br/>item is it?"</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Select the category that best fits the item.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto w-full">
          {featuredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFormData({ ...formData, category: cat.id, title: cat.id });
                setTimeout(onNext, 400);
              }}
              className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${
                formData.category === cat.id 
                  ? 'bg-uni-500 border-uni-500 text-white' 
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
                      setFormData({ ...formData, category: cat.id, title: cat.id });
                      setTimeout(onNext, 400);
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

          <div className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-8 ${
            formData.category === 'Other' 
              ? 'bg-white/10 border-uni-500' 
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
                    onClick={onNext}
                    disabled={!otherItemName}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-uni-400 hover:text-white transition-all border border-black/5"
                  >
                    Confirm Item →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>
    </div>
  );
};

export default CategorySelection;
