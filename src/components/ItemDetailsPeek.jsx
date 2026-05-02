import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMasterData } from '../context/MasterDataContext';

const ItemDetailsPeek = ({ item, isOpen, onClose, onShare }) => {
  const navigate = useNavigate();
  const { categories: CATEGORIES } = useMasterData();
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  if (!item) return null;

  const formattedDate = item.date_found ? new Date(item.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  return (
    <div className="fixed top-[var(--navbar-height)] inset-x-0 bottom-0 z-[9999] flex items-center justify-center p-3 pb-6 md:p-12 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 md:bg-white/5 backdrop-blur-sm pointer-events-auto"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 1, y: '100%' }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl h-auto max-h-[85vh] md:max-h-[90vh] bg-slate-900/95 md:bg-slate-800/85 backdrop-blur-xl rounded-3xl md:rounded-[4rem] border border-white/20 overflow-hidden flex flex-col md:flex-row shadow-2xl pointer-events-auto"
      >

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all group backdrop-blur-md"
        >
          <i className="fa-solid fa-xmark text-sm md:text-lg group-hover:rotate-90 transition-transform"></i>
        </button>

        {/* Media Side */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-square md:h-auto relative bg-slate-950 overflow-hidden shrink-0">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              className="w-full h-full object-cover" 
              alt={item.title}
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
              <span className="text-9xl">{categoryData?.emoji || '📦'}</span>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] opacity-40">No Visual Record</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-2">
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/10 shadow-xl">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400"></div>
                <span className="text-[9px] md:text-xs font-black text-white uppercase tracking-widest">In Custody</span>
             </div>
             {item.is_recent && (
               <div className="flex items-center gap-2 bg-sky-500 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl shadow-xl shadow-sky-500/20">
                  <span className="text-[9px] md:text-xs font-black text-white uppercase tracking-widest">New</span>
               </div>
             )}
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-4 pt-5 md:p-16 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-slate-900/40">
          <div className="space-y-6 md:space-y-10">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-[10px] md:text-xs font-black text-sky-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">{item.category}</span>
                <div className="h-px flex-grow bg-white/10"></div>
                <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest leading-none bg-white/5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/5">#{item.id.toString().padStart(4, '0')}</span>
              </div>
              <h1 className="text-xl md:text-6xl font-black text-white uppercase tracking-tight md:tracking-tighter italic leading-tight md:leading-[0.9]">{item.title}</h1>
            </div>

            <div className="bg-white/5 p-4 md:p-8 rounded-2xl border border-white/5 space-y-4 md:space-y-6">
              {item.description && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Description</p>
                  <p className="text-slate-200 text-xs md:text-base font-bold leading-relaxed">{item.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 md:gap-8 pt-4 md:pt-6 border-t border-white/5">
                {item.location && (
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Recovery Spot</p>
                    <div className="flex items-center gap-1.5 md:gap-2 text-white">
                      <i className="fa-solid fa-map-pin text-sky-400 text-[9px] md:text-[10px]"></i>
                      <span className="text-[10px] md:text-sm font-black uppercase tracking-tight">{item.location}</span>
                    </div>
                  </div>
                )}
                {formattedDate && (
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Entry Date</p>
                    <div className="flex items-center gap-1.5 md:gap-2 text-white">
                      <i className="fa-solid fa-calendar text-sky-400 text-[9px] md:text-[10px]"></i>
                      <span className="text-[10px] md:text-sm font-black uppercase tracking-tight">{formattedDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-12 flex gap-2.5 md:gap-4 sticky bottom-0 bg-slate-900/90 md:bg-transparent pt-4 pb-4 md:py-0 border-t md:border-t-0 border-white/5">
            <button 
              onClick={() => {
                onClose();
                navigate(`/submit-claim/${item.id}`);
              }}
              className="flex-grow py-3 md:py-8 bg-sky-500 hover:bg-sky-400 text-white rounded-xl md:rounded-3xl font-black text-[11px] md:text-sm uppercase tracking-widest md:tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-4 shadow-xl shadow-sky-500/20 group"
            >
              Claim Item
              <i className="fa-solid fa-shield-halved text-[10px]"></i>
            </button>
            <button 
              onClick={() => onShare(item)}
              className="w-12 h-12 md:w-24 md:h-auto bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-3xl border border-white/10 transition-all flex items-center justify-center shrink-0 active:scale-90"
            >
              <i className="fa-solid fa-share-nodes text-sm md:text-lg"></i>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ItemDetailsPeek;
