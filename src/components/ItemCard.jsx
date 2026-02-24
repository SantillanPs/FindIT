import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ item, onClick, onShare }) => {
  const formattedDate = new Date(item.found_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="relative bg-slate-900/40 rounded-[1.5rem] border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col shadow-lg"
    >
      {/* Visual Evidence Area - Completely Clean */}
      <div className="h-60 relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
        {item.safe_photo_url ? (
          <img 
            src={item.safe_photo_url} 
            alt="" 
            className="w-full h-full object-cover opacity-90 transition-opacity duration-300" 
          />
        ) : (
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">No Image</span>
        )}
      </div>

      {/* Data Section - Purely functional */}
      <div className="p-6 text-left space-y-6 flex-grow flex flex-col justify-between">
        <div className="space-y-6">
          {/* 1. Item Name & ID */}
          <div className="flex justify-between items-baseline gap-4">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
              {item.item_name}
            </h3>
            <span className="text-[10px] font-medium text-slate-500 shrink-0">
              #{item.id.toString().padStart(4, '0')}
            </span>
          </div>

          {/* 2. Description */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description</span>
            <p className="text-slate-300 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* 3 & 4. Location & Date */}
          <div className="grid grid-cols-2 gap-4 pt-2">
             <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Location</span>
                <p className="text-xs font-bold text-white uppercase truncate">{item.location_zone}</p>
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Date Found</span>
                <p className="text-xs font-bold text-white uppercase truncate">{formattedDate}</p>
             </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-grow bg-white text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            Review Report
          </button>
          
          {onShare && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onShare(item);
              }}
              className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
