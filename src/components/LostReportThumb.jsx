import React from 'react';
import { useMasterData } from '../context/MasterDataContext';
import { imageCache } from '../lib/imageCache';
import { Sparkles, Calendar } from 'lucide-react';

const LostReportThumb = ({ report, onClick }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgError, setImgError] = React.useState(imageCache.isFailed(report.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === report.category);
  const hasPhoto = report.photo_url && !imgError;

  const formattedDate = new Date(report.date_lost).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  return (
    <div 
      onClick={onClick}
      className="group relative aspect-[3/4] rounded-[1rem] border border-white/10 hover:border-rose-500/40 cursor-pointer overflow-hidden bg-slate-900 active:scale-[0.97] transition-transform flex flex-col shadow-lg"
    >
      {/* Background Image (if any) */}
      {hasPhoto && (
        <img 
          src={report.photo_url} 
          alt={report.title} 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          loading="lazy"
          decoding="async"
          onError={() => { imageCache.markFailed(report.photo_url); setImgError(true); }}
        />
      )}

      {/* Main Content Wrapper */}
      <div className={`relative z-10 flex flex-col h-full p-3 ${hasPhoto ? 'bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent' : 'bg-gradient-to-br from-slate-900 to-rose-950/20'}`}>
        
        {/* Top Row: Category + AI Badge */}
        <div className="flex justify-between items-start w-full">
          <div className="bg-rose-500/20 backdrop-blur-md px-1.5 py-0.5 rounded border border-rose-500/30">
            <span className="text-[7px] font-black text-rose-300 uppercase tracking-widest line-clamp-1 max-w-[70px]">
              {categoryData?.label || 'General'}
            </span>
          </div>
          {report.synthesized_description && (
            <div className="bg-blue-500/20 p-1 rounded-full border border-blue-500/30 backdrop-blur-md">
              <Sparkles size={8} className="text-blue-400 fill-blue-400" />
            </div>
          )}
        </div>

        {/* Middle: Icon Placeholder (if no photo) */}
        {!hasPhoto && (
          <div className="flex-grow flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity group-hover:scale-110 duration-500">
            <span className="text-4xl">{categoryData?.emoji || '🔍'}</span>
          </div>
        )}
        {hasPhoto && <div className="flex-grow"></div>}

        {/* Bottom Info Section */}
        <div className="flex flex-col gap-0.5 mt-auto drop-shadow-md">
          <h4 className="text-xs font-black text-white line-clamp-1 tracking-tight leading-tight mb-0.5">
            {report.title}
          </h4>
          
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-300/80 uppercase tracking-widest line-clamp-1">
            <span className="truncate">{report.location}</span>
            <span className="opacity-50 shrink-0">•</span>
            <span className="shrink-0">{formattedDate}</span>
          </div>

          <p className="text-[10px] text-slate-300 font-medium leading-snug line-clamp-2 mt-1 mb-1.5">
            {report.synthesized_description || report.description}
          </p>

          {/* Quick Attributes Row */}
          {report.attributes && Object.keys(report.attributes).length > 0 && (
            <div className="flex gap-1.5 mt-0.5 overflow-hidden h-[18px] items-center">
               {Object.entries(report.attributes).map(([key, val]) => {
                  if (!val || val === 'Unknown' || val === 'None') return null;
                  return (
                     <span key={key} className="text-[8px] font-black text-slate-300 bg-white/10 px-1.5 py-[2px] rounded uppercase tracking-widest whitespace-nowrap border border-white/5 backdrop-blur-sm">
                        {val}
                     </span>
                  );
               })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostReportThumb;
