import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMasterData } from '../context/MasterDataContext';
import { useAuth } from '../context/AuthContext';

const LostReportCard = ({ report, onWitness }) => {
  const navigate = useNavigate();
  const { categories: CATEGORIES } = useMasterData();
  const { user } = useAuth();
  const categoryData = CATEGORIES.find(c => c.id === report.category);
  
  const formattedDate = new Date(report.last_seen_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(report.last_seen_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  return (
    <div 
      className="group relative bg-bg-surface/30 backdrop-blur-md rounded-[2rem] border border-white/10 hover:border-accent-default/40 transition-all duration-500 overflow-hidden flex flex-col"
    >
      {/* 1. Image/Header Section */}
      <div className={`relative overflow-hidden bg-bg-elevated/20 transition-all duration-700 ${
        report.safe_photo_url ? 'aspect-[16/10]' : 'h-32'
      }`}>
        {report.safe_photo_url ? (
          <img 
            src={report.safe_photo_url} 
            alt={report.item_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-between px-8 bg-gradient-to-br from-bg-elevated to-bg-main">
             <div className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                {categoryData?.emoji || '🔍'}
             </div>
             <div className="text-right">
                <div className="text-[11px] font-black text-accent-default uppercase tracking-[0.4em] leading-tight">
                  Lost <br/> Report
                </div>
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

        {/* Case ID (Top Right) */}
        <div className="absolute top-4 right-4 z-20">
            <span className="text-[11px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md border border-white/10">
                Case: #{report.id.toString().padStart(4, '0')}
            </span>
        </div>

        {/* Gradient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 pt-8 relative flex flex-col flex-grow">
        
        {/* Category Icon Overlay (Middle Left) */}
        <div className="absolute -top-7 left-6 w-14 h-14 bg-[#4a261d] rounded-2xl border-4 border-[#0f172a] flex items-center justify-center z-30 group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">
                {categoryData?.emoji || '🔍'}
            </span>
        </div>

        {/* Header Row: Location Only (User feedback: Item Name is redundant here) */}
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-accent-default transition-colors line-clamp-1 mb-2">
                    {report.location_zone}
                </h3>
                
                {report.potential_zone_names && report.potential_zone_names.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {report.potential_zone_names.slice(0, 2).map((name, i) => (
                            <span 
                                key={i}
                                className="text-[10px] font-black text-accent-default uppercase tracking-widest bg-accent-default/5 px-2 py-0.5 rounded-full border border-accent-default/20 whitespace-nowrap"
                            >
                                {name}
                            </span>
                        ))}
                        {report.potential_zone_names.length > 2 && (
                            <span className="text-[10px] font-black text-accent-default/60 uppercase tracking-widest px-1 py-0.5">
                                +{report.potential_zone_names.length - 2} more
                            </span>
                        )}
                    </div>
                )}
            </div>

        {/* Description List */}
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-accent-default/10 flex items-center justify-center shrink-0 border border-accent-default/20">
                    <i className="fa-solid fa-align-left text-[10px] text-accent-default"></i>
                </div>
                <p className="text-[13px] text-white/80 font-medium leading-relaxed line-clamp-3 italic">
                    {report.description}
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent-default/10 flex items-center justify-center shrink-0 border border-accent-default/20">
                    <i className="fa-solid fa-calendar text-[10px] text-accent-default"></i>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-[12px] font-bold text-white">{formattedDate}</span>
                    <span className="text-[12px] text-white/40">•</span>
                    <span className="text-[12px] text-white/80">{formattedTime}</span>
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    navigate(`/report/found?match=${report.id}`);
                  } else {
                    navigate(`/report-found-guest?match=${report.id}`);
                  }
                }}
                className="flex-grow bg-accent-default hover:bg-accent-light text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-hand-holding-heart"></i>
                <span>I Found This!</span>
            </button>
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onWitness(report);
                }}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-accent-default hover:bg-accent-default/10 transition-all active:scale-90"
                title="I've seen this item!"
            >
                <i className="fa-solid fa-eye"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LostReportCard;
