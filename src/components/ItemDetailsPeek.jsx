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
    <div className="fixed top-[var(--navbar-height)] inset-x-0 bottom-0 z-[9999] flex items-center justify-center p-4 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/5 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl h-fit max-h-[90vh] bg-slate-800/85 backdrop-blur-md rounded-3xl md:rounded-[4rem] border border-white/20 overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all group"
        >
          <i className="fa-solid fa-xmark text-lg group-hover:rotate-90 transition-transform"></i>
        </button>

        {/* Media Side */}
        <div className="w-full md:w-1/2 aspect-square md:h-auto relative bg-bg-elevated/20 overflow-hidden">
          {item.photo_url ? (
            <img 
              src={item.photo_url} 
              className="w-full h-full object-cover" 
              alt={item.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
              <span className="text-9xl">{categoryData?.emoji || '📦'}</span>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] opacity-40">No Visual Record</p>
            </div>
          )}
          
          <div className="absolute top-8 left-8 flex flex-col gap-3">
             <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-black text-white uppercase tracking-widest">In Custody</span>
             </div>
             {item.is_recent && (
               <div className="flex items-center gap-3 bg-uni-500 px-5 py-2.5 rounded-2xl">
                  <span className="text-xs font-black text-white uppercase tracking-widest">New Discovery</span>
               </div>
             )}
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-5 md:p-16 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-uni-400 uppercase tracking-[0.4em]">{item.category}</span>
                <div className="h-px flex-grow bg-white/10"></div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Ref: #{item.id.toString().padStart(4, '0')}</span>
              </div>
              <h1 className="text-2xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">{item.title}</h1>
            </div>

            <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/5 space-y-4 md:space-y-6">
              {item.description && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Description</p>
                  <p className="text-slate-200 text-xs md:text-base font-bold leading-relaxed">{item.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 md:gap-8 pt-4 md:pt-6 border-t border-white/5">
                {item.location && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Recovery Spot</p>
                    <div className="flex items-center gap-2 text-white">
                      <i className="fa-solid fa-map-pin text-uni-400 text-[10px]"></i>
                      <span className="text-[11px] md:text-sm font-black uppercase tracking-tight">{item.location}</span>
                    </div>
                  </div>
                )}
                {formattedDate && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Entry Date</p>
                    <div className="flex items-center gap-2 text-white">
                      <i className="fa-solid fa-calendar text-uni-400 text-[10px]"></i>
                      <span className="text-[11px] md:text-sm font-black uppercase tracking-tight">{formattedDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-12 flex gap-3 md:gap-4">
            <button 
              onClick={() => {
                onClose();
                navigate(`/submit-claim/${item.id}`);
              }}
              className="flex-grow py-4 md:py-8 bg-uni-500 hover:bg-uni-400 text-white rounded-2xl md:rounded-3xl font-black text-[10px] md:text-sm uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 group"
            >
              Initiate Process 
              <i className="fa-solid fa-shield-halved text-[10px]"></i>
            </button>
            <button 
              onClick={() => onShare(item)}
              className="w-14 items-center justify-center md:w-24 bg-white/5 hover:bg-white/10 text-white rounded-2xl md:rounded-3xl border border-white/10 transition-all flex md:flex"
            >
              <i className="fa-solid fa-share-nodes text-base md:text-lg"></i>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ItemDetailsPeek;
