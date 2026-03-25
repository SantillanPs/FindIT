import { motion } from 'framer-motion';
import { useMasterData } from '../context/MasterDataContext';

const ItemCard = ({ item, onClick, onShare }) => {
  const { categories: CATEGORIES } = useMasterData();
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
    <div 
      onClick={onClick}
      className="group relative bg-bg-surface/30 backdrop-blur-md rounded-[2rem] border border-white/10 hover:border-uni-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* 1. Image Header Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated/20 transition-all duration-700">
        {item.safe_photo_url ? (
          <img 
            src={item.safe_photo_thumbnail_url || item.safe_photo_url} 
            alt={item.item_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-main">
             <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                {categoryData?.emoji || '📦'}
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
                    {item.location_zone}
                </h3>
            </div>

        {/* Description List (Replacing the location/time list) */}
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-uni-500/10 flex items-center justify-center shrink-0 border border-uni-500/20">
                    <i className="fa-solid fa-align-left text-[10px] text-uni-400"></i>
                </div>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3 italic">
                    {item.description}
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-uni-500/10 flex items-center justify-center shrink-0 border border-uni-500/20">
                    <i className="fa-solid fa-clock text-[10px] text-uni-400"></i>
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
                className="flex-grow bg-uni-600 hover:bg-uni-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-shield-halved"></i>
                <span>Process Item</span>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-uni-400 transition-all active:scale-90"
            >
                <i className="fa-solid fa-share-nodes"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
