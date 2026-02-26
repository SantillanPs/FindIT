import React from 'react';
import { CATEGORIES } from '../../../constants/categories';

const LostReportCard = ({ report, matches, navigate, setSearchTerm }) => {
  const reportMatches = matches.filter(m => m.top_matches.some(tm => tm.item.id === report.id));
  const bestScore = reportMatches.length > 0 
    ? Math.max(...reportMatches.map(m => m.top_matches.find(tm => tm.item.id === report.id).similarity_score))
    : 0;

  return (
    <div className={`bg-white/[0.03] border rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:bg-white/[0.05] transition-all group relative overflow-hidden ${bestScore > 0.8 ? 'border-uni-500/30' : 'border-white/5'}`}>
       {bestScore > 0.8 && (
           <div className="absolute top-0 left-0 w-1 h-full bg-uni-500 shadow-[0_0_15px_rgba(var(--uni-rgb),0.5)] animate-pulse"></div>
       )}
       
       <div className="flex flex-col md:flex-row items-center gap-8 flex-grow">
          {/* Visual Category ID */}
          <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center text-3xl shadow-2xl relative flex-shrink-0">
             {CATEGORIES.find(c => c.id === report.category)?.emoji || '🔍'}
             <div className="absolute -top-2 -right-2 bg-uni-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full shadow-lg">
                REPORTED
             </div>
          </div>

          <div className="space-y-3 md:text-left text-center">
             <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <h4 className="text-xl font-black text-white uppercase tracking-tight">{report.item_name}</h4>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-400 uppercase tracking-widest">ID #{report.id.toString().padStart(5, '0')}</span>
                {bestScore > 0 && (
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1.5 ${bestScore > 0.8 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-uni-500/10 text-uni-400 border border-uni-500/20'}`}>
                        <i className="fa-solid fa-robot animate-bounce"></i>
                        {(bestScore * 100).toFixed(0)}% MATCH FOUND
                    </div>
                )}
             </div>
             
             <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest justify-center md:justify-start">
                <span className="flex items-center gap-2"><i className="fa-solid fa-layer-group text-uni-400"></i> {report.category}</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-location-dot text-uni-400"></i> {report.location_zone}</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-clock text-uni-400"></i> {new Date(report.last_seen_time).toLocaleDateString()}</span>
             </div>

             <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl italic line-clamp-2">
                "{report.description || 'No detailed description provided.'}"
              </p>
          </div>
       </div>

       <div className="flex flex-col md:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
          <div className="text-center md:text-right md:mr-6">
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Submitted By</p>
             <p className="text-[10px] font-black text-white uppercase">{report.guest_full_name || 'Verified Student'}</p>
             <p className="text-[9px] font-bold text-uni-400/60 lowercase mt-0.5">{report.guest_email || 'Institutional Member'}</p>
          </div>

          <button 
            onClick={() => {
                navigate('/admin/matches');
                setSearchTerm(`#${report.id.toString().padStart(4, '0')}`);
            }}
            className={`w-full md:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 border ${
                bestScore > 0.8 
                ? 'bg-uni-600 text-white border-uni-500 shadow-lg shadow-uni-600/30' 
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
             <i className={bestScore > 0 ? "fa-solid fa-clipboard-check" : "fa-solid fa-microscope"}></i>
             {reportMatches.length > 0 ? `View ${reportMatches.length} Suggestions` : 'Review Case'}
          </button>
       </div>
    </div>
  );
};

export default LostReportCard;
