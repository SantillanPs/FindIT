import React from 'react';
import { useMasterData } from '../context/MasterDataContext';
import { AlignLeft, Clock, ShieldCheck, Share2, Package, Fingerprint } from 'lucide-react';

const ItemCard = ({ item, onClick, onShare }) => {
  const { categories: CATEGORIES } = useMasterData();
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  
  const formattedDate = new Date(item.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(item.date_found).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 hover:border-sky-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* 1. Image Header Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated/20 transition-all duration-700">
        {item.photo_url ? (
          <img 
            src={item.photo_thumbnail_url || item.photo_url} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
             <div className="text-6xl text-slate-500/20 group-hover:scale-110 transition-transform duration-700">
                <Package className="h-20 w-20" />
             </div>
          </div>
        )}

        {/* Category Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {categoryData?.label || 'General'}
                </span>
            </div>
        </div>

        {/* Ref ID (Top Right) */}
        <div className="absolute top-4 right-4 z-20">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md border border-white/5">
                #{item.id.toString().padStart(4, '0')}
            </span>
        </div>

        {/* Gradient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 pt-7 relative flex flex-col flex-grow">
        
        {/* Category Icon Overlay (Middle Left) */}
        <div className="absolute -top-7 left-6 w-14 h-14 bg-[#3d2a1d] rounded-2xl border-4 border-[#0f172a] flex items-center justify-center z-30 group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">
                {categoryData?.emoji || '📦'}
            </span>
        </div>

        {/* Header Row: Location Only (User feedback: Item Name is redundant here) */}
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-uni-400 transition-colors line-clamp-1">
                    {item.location}
                </h3>
            </div>

        {/* Description List (Replacing the location/time list) */}
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-white/5">
                    <AlignLeft className="h-3 w-3 text-sky-400" />
                </div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3 italic">
                    {item.description}
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-white/5">
                    <Clock className="h-3 w-3 text-sky-400" />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-text-main">{formattedDate}</span>
                    <span className="text-xs text-text-muted opacity-60">•</span>
                    <span className="text-xs text-text-muted">{formattedTime}</span>
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex-grow bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
                <ShieldCheck className="h-4 w-4" />
                <span>Process Item</span>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
            >
                <Share2 className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
