import React from 'react';
import { useMasterData } from '../context/MasterDataContext';
import { imageCache } from '../lib/imageCache';
import { Search } from 'lucide-react';

const LostReportThumb = ({ report, onClick }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgError, setImgError] = React.useState(imageCache.isFailed(report.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === report.category);

  return (
    <div 
      onClick={onClick}
      className="lt-thumb group relative aspect-square rounded-2xl border border-white/10 hover:border-rose-500/40 cursor-pointer overflow-hidden bg-slate-900/40 active:scale-[0.97] transition-transform"
    >
      {/* Image or "LOST" Placeholder */}
      {report.photo_url && !imgError ? (
        <img 
          src={report.photo_url} 
          alt={report.title} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={() => { imageCache.markFailed(report.photo_url); setImgError(true); }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-rose-950/30 gap-2">
          <span className="text-4xl">{categoryData?.emoji || '🔍'}</span>
          <span className="text-[9px] font-black text-rose-400/60 uppercase tracking-[0.3em]">Lost</span>
        </div>
      )}

      {/* Lost Badge (top-left) */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-rose-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-rose-500/30">
          <span className="text-[8px] font-bold text-rose-300 uppercase tracking-wider">
            {categoryData?.label || 'General'}
          </span>
        </div>
      </div>

      {/* Bottom Title Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-2.5 px-2.5">
        <p className="text-[11px] font-bold text-white leading-tight line-clamp-1">{report.title}</p>
        <p className="text-[9px] font-medium text-rose-300/70 mt-0.5 line-clamp-1 uppercase tracking-wider">{report.location}</p>
      </div>
    </div>
  );
};

export default LostReportThumb;
