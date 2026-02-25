import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants/categories';

const ItemCard = ({ item, onClick, onShare }) => {
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  
  const formattedDate = new Date(item.found_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(item.found_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative glass-panel rounded-[2.5rem] border border-white/5 hover:border-uni-500/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col shadow-2xl shadow-black/40 bg-slate-900/40"
    >
      {/* Visual Anchor Area */}
      <div className="h-48 relative overflow-hidden bg-slate-950 border-b border-white/5 group-hover:bg-slate-900 transition-colors">
        {item.safe_photo_url ? (
          <img 
            src={item.safe_photo_url} 
            alt={item.item_name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="text-7xl group-hover:scale-110 transition-transform duration-500">{categoryData?.emoji || '📦'}</div>
             <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] opacity-40">Visual Confirmation Required</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-6 left-6">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">In Registry</span>
            </div>
        </div>

        {/* Floating ID */}
        <div className="absolute top-6 right-6">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                #{item.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-8 text-left flex-grow flex flex-col">
          <div className="flex-grow space-y-6">
              {/* Primary Identifier */}
              <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none group-hover:text-uni-400 transition-colors">
                    {item.item_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10"></div>
                      <span className="text-[10px] font-black text-uni-500/60 uppercase tracking-widest">Open for Claim</span>
                  </div>
              </div>

              {/* Description Snippet */}
              <p className="text-slate-400 text-sm italic font-bold leading-relaxed line-clamp-2 uppercase tracking-wide border-l-3 border-uni-500/20 pl-4 py-1">
                 "{item.description}"
              </p>

              {/* Scannable Meta Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 pt-2">
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Location</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-[11px] text-uni-400"></i>
                          <p className="text-[11px] font-black text-white uppercase truncate">{item.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Discovery Time</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-clock text-[11px] text-uni-400"></i>
                          <p className="text-[11px] font-black text-white uppercase">{formattedTime}</p>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Discovery Date</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar-day text-[11px] text-uni-400"></i>
                          <p className="text-[11px] font-black text-white uppercase">{formattedDate}</p>
                      </div>
                  </div>
                  <div className="flex items-end justify-end">
                      <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[7px] font-black text-slate-500 italic">
                                  i{i}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Area */}
          <div className="mt-10 pt-8 border-t border-white/5">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="w-full bg-white text-black py-5 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-uni-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 group/btn"
              >
                <span>Initiate Claim</span>
                <i className="fa-solid fa-chevron-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
