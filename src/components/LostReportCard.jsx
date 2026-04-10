import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterData } from '../context/MasterDataContext';
import { useAuth } from '../context/AuthContext';
import { AlignLeft, Calendar, Heart, Eye, Search } from 'lucide-react';

const LostReportCard = ({ report, onWitness }) => {
  const navigate = useNavigate();
  const { categories: CATEGORIES } = useMasterData();
  const { user } = useAuth();
  const categoryData = CATEGORIES.find(c => c.id === report.category);
  
  const formattedDate = new Date(report.date_lost).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(report.date_lost).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 hover:border-rose-500/40 transition-all duration-500 overflow-hidden flex flex-col">
      {/* 1. Image/Header Section */}
      <div className={`relative overflow-hidden bg-bg-elevated/20 transition-all duration-700 ${report.photo_url ? 'aspect-[16/10]' : 'h-32'}`}>
        {report.photo_url ? (
          <img 
            src={report.photo_url} 
            alt={report.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-between px-8 bg-gradient-to-br from-slate-900 to-slate-950">
             <div className="text-5xl text-slate-500/20 group-hover:scale-110 transition-transform duration-700">
                <Search className="h-16 w-16" />
             </div>
             <div className="text-right">
                <div className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.4em] leading-tight">
                  Lost <br/> Report
                </div>
             </div>
          </div>
        )}

        {/* Category Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    {categoryData?.label || 'General'}
                </span>
            </div>
        </div>

        {/* Gradient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 pt-8 relative flex flex-col flex-grow">
        
        {/* Category Icon Overlay (Middle Left) */}
        <div className="absolute -top-7 left-6 w-14 h-14 bg-bg-elevated/80 backdrop-blur-md rounded-2xl border-4 border-[#0f172a] shadow-xl flex items-center justify-center z-30 group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">
                {categoryData?.emoji || '🔍'}
            </span>
        </div>

        {/* Header Row */}
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-accent-default transition-colors line-clamp-1 mb-1">
                {report.title}
            </h3>
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">
                {report.location}
            </p>
            
            {report.potential_zone_names && report.potential_zone_names.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {report.potential_zone_names.slice(0, 2).map((name, i) => (
                        <span 
                            key={i}
                            className="text-[11px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap"
                        >
                            {name}
                        </span>
                    ))}
                    {report.potential_zone_names.length > 2 && (
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1 py-0.5">
                            +{report.potential_zone_names.length - 2} more
                        </span>
                    )}
                </div>
            )}
        </div>

        {/* Description List */}
        <div className="px-5 space-y-3 mb-6 flex-grow mt-4">
            <div className="flex items-start gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-white/5">
                    <AlignLeft className="h-3 w-3 text-rose-400" />
                </div>
                <p className="text-[13px] text-slate-300 font-medium leading-relaxed line-clamp-3">
                    {report.description}
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-white/5">
                    <Calendar className="h-3 w-3 text-rose-400" />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-[12px] font-bold text-white uppercase tracking-wider">{formattedDate}</span>
                    <span className="text-[12px] text-white/40">•</span>
                    <span className="text-[12px] font-medium text-slate-300">{formattedTime}</span>
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="p-5 flex gap-3 pt-4 border-t border-white/5 bg-white/5 rounded-b-[2rem] -mx-5 -mb-5">
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    navigate(`/report/found?match=${report.id}`);
                  } else {
                    navigate(`/report-found-guest?match=${report.id}`);
                  }
                }}
                className="flex-grow bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-xl"
            >
                <Heart className="h-4 w-4 fill-black" />
                <span>I Found This!</span>
            </button>
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onWitness(report);
                }}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                title="I've seen this item!"
            >
                <Eye className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default LostReportCard;
