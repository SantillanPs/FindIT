import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMasterData } from '../context/MasterDataContext';

/**
 * ItemDetailsPeek - "Image-First" Immersive Edition
 * - Minimalistic, Functional, Compact.
 * - Optimized for thin mobile screens.
 */
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-3xl pointer-events-auto"
      >
        {/* Close Button - Floating Minimalist */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/40 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all group backdrop-blur-xl"
        >
          <i className="fa-solid fa-xmark text-sm group-hover:rotate-90 transition-transform"></i>
        </button>

        {/* 1. Main Focus: Hero Image */}
        <div className="relative aspect-[4/5] w-full bg-slate-950 overflow-hidden group">
          {item.photo_url ? (
            <>
              <img 
                src={item.photo_url} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                alt={item.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-40">
              <span className="text-8xl">{categoryData?.emoji || '📦'}</span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Visual Identification Required</p>
            </div>
          )}
          
          {/* Status Badge Overlaid on Image */}
          <div className="absolute top-6 left-6">
             <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">In Custody</span>
             </div>
          </div>

          {/* Floating Category/ID Overlaid on bottom of image */}
          <div className="absolute bottom-6 left-6 right-6">
             <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest leading-none drop-shadow-lg">{item.category}</p>
                   <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight italic drop-shadow-2xl line-clamp-2 leading-[0.9]">
                      {item.title}
                   </h1>
                </div>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 shrink-0">
                   #{item.id.toString().slice(-4).toUpperCase()}
                </span>
             </div>
          </div>
        </div>

        {/* 2. Functional Details Section */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            {item.location && (
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <i className="fa-solid fa-map-pin text-sky-500 text-[8px]"></i>
                  Found At
                </p>
                <p className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[140px]">{item.location}</p>
              </div>
            )}
            {formattedDate && (
              <div className="space-y-1 text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-1.5">
                   <i className="fa-solid fa-calendar text-sky-500 text-[8px]"></i>
                   Reported
                </p>
                <p className="text-xs font-black text-white uppercase tracking-tight">{formattedDate}</p>
              </div>
            )}
          </div>

          {/* 3. Main Action */}
          <div className="flex gap-3">
            <button 
              onClick={() => {
                onClose();
                navigate(`/submit-claim/${item.id}`);
              }}
              className="flex-grow py-5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-sky-500/20 group"
            >
              Claim Item
              <i className="fa-solid fa-shield-halved text-[10px] group-hover:rotate-12 transition-transform"></i>
            </button>
            <button 
              onClick={() => onShare(item)}
              className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center justify-center shrink-0 active:scale-90"
            >
              <i className="fa-solid fa-share-nodes text-base"></i>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ItemDetailsPeek;
