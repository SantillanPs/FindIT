import React from 'react';
import { imageCache } from '../lib/imageCache';
import { useMasterData } from '../context/MasterDataContext';
import { AlignLeft, Clock, ShieldCheck, Share2, Package, Fingerprint } from 'lucide-react';

const ItemCard = ({ item, onClick, onShare }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgError, setImgError] = React.useState(imageCache.isFailed(item.photo_thumbnail_url || item.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  
  const formattedDate = item.date_found ? new Date(item.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase() : null;

  const formattedTime = item.date_found ? new Date(item.date_found).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase() : null;

  const dateFound = new Date(item.date_found || item.created_at);
  const diffDays = Math.ceil(Math.abs(new Date() - dateFound) / (1000 * 60 * 60 * 24));
  const isStale = diffDays >= 30 && !item.identified_name && item.status !== 'claimed';

  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 hover:border-sky-500/40 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* 1. Image Header Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated/20">
        {item.photo_url && !imgError ? (
          <img 
            src={item.photo_thumbnail_url || item.photo_url} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            loading="lazy"
            decoding="async"
            onError={() => { imageCache.markFailed(item.photo_thumbnail_url || item.photo_url); setImgError(true); }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
             <div className="text-6xl text-slate-500/20 group-hover:scale-110 transition-transform duration-700">
                <Package className="h-20 w-20" />
             </div>
          </div>
        )}

        {/* Category Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-sky-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/20 flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    {categoryData?.label || 'General'}
                </span>
            </div>
            {isStale && (
              <div className="bg-amber-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-2 animate-pulse">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                      Long Unclaimed
                  </span>
              </div>
            )}
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
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-400 line-clamp-1">
                    {item.title}
                </h3>
                {item.location && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Found At</p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{item.location}</p>
                  </div>
                )}
            </div>

        {/* Description List (Replacing the location/time list) */}
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/5">
                    <AlignLeft className="h-3 w-3 text-sky-400" />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {item.description}
                </p>
            </div>
            
            {formattedDate && (
              <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/5">
                      <Clock className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{formattedDate}</span>
                      <span className="text-xs text-white/20">•</span>
                      <span className="text-xs font-medium text-slate-400">{formattedTime}</span>
                  </div>
              </div>
            )}
        </div>

        {/* Action Row */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex-grow bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
            >
                <Fingerprint className="h-4 w-4" />
                <span>Claim Item</span>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white active:scale-90"
            >
                <Share2 className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
