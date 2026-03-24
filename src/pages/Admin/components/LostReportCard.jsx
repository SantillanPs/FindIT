import { useState } from 'react';
import { useMasterData } from '../../../context/MasterDataContext';

const LostReportCard = ({ report, matches, navigate, setSearchTerm, onUpdate, isUpdating, onPreview }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [notes, setNotes] = useState(report.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const reportMatches = matches.filter(m => m.top_matches.some(tm => tm.item.id === report.id));
  const bestScore = reportMatches.length > 0 
    ? Math.max(...reportMatches.map(m => m.top_matches.find(tm => tm.item.id === report.id).similarity_score))
    : 0;

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    if (notes !== report.admin_notes) {
      onUpdate(report.id, { admin_notes: notes });
    }
  };

  return (
    <div className={`group relative bg-bg-surface/30 backdrop-blur-md rounded-[2rem] border transition-all duration-500 overflow-hidden flex flex-col ${
        bestScore > 0.8 && report.status === 'reported' ? 'border-uni-500/40' : 'border-white/10 hover:border-accent-default/40'
    }`}>
      {/* 1. Header Section (Image or Icon) */}
      <div className={`relative overflow-hidden bg-bg-elevated/20 transition-all duration-700 ${
        report.safe_photo_url ? 'aspect-[21/9]' : 'h-32'
      }`}>
        {report.safe_photo_url ? (
          <div className="relative w-full h-full">
            <img 
              src={report.safe_photo_url} 
              alt={report.item_name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            />
            <button 
                onClick={() => onPreview(report.safe_photo_url)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <i className="fa-solid fa-magnifying-glass-plus text-white text-2xl"></i>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-between px-8 bg-gradient-to-br from-bg-elevated to-bg-main">
             <div className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                {CATEGORIES.find(c => c.id === report.category)?.emoji || '🔍'}
             </div>
             <div className="text-right">
                <div className="text-[8px] font-black text-accent-default/40 uppercase tracking-[0.4em] leading-tight">
                  Admin <br/> Registry
                </div>
             </div>
          </div>
        )}

        {/* Category Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {report.category || 'General'}
                </span>
            </div>
        </div>

        {/* Case ID Overlay (Top Right) */}
        <div className="absolute top-4 right-4 z-20">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md border border-white/5">
                Case: #{report.id.toString().padStart(4, '0')}
            </span>
        </div>

        {/* Gradient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* 2. Content Section */}
      <div className="p-6 pt-10 relative flex flex-col flex-grow">
        
        {/* Category Icon Overlay (Middle Left) */}
        <div className="absolute -top-7 left-8 w-14 h-14 bg-[#4a261d] rounded-2xl border-4 border-[#0f172a] flex items-center justify-center z-30 group-hover:scale-110 transition-transform duration-500">
            <span className="text-2xl">
                {CATEGORIES.find(c => c.id === report.category)?.emoji || '🔍'}
            </span>
        </div>

        {/* Header Row: Location Title & Status Badge */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex-grow pr-4">
                <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-accent-default transition-colors line-clamp-1">
                    {report.location_zone}
                </h3>
            </div>
            <div className="shrink-0 text-right">
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                   report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                   report.status === 'dismissed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-accent-default/10 text-accent-default border-accent-default/20'
                }`}>
                   {report.status}
                </div>
            </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-accent-default/10 flex items-center justify-center shrink-0 border border-accent-default/20">
                        <i className="fa-solid fa-align-left text-[10px] text-accent-default"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Incident Report</p>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 italic">
                            "{report.description || 'No detailed description provided.'}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-default/10 flex items-center justify-center shrink-0 border border-accent-default/20">
                        <i className="fa-solid fa-user text-[10px] text-accent-default"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Submitted By</p>
                        <p className="text-[11px] font-bold text-white uppercase tracking-tight">{report.owner_name}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-default/10 flex items-center justify-center shrink-0 border border-accent-default/20">
                        <i className="fa-solid fa-calendar text-[10px] text-accent-default"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Report Date</p>
                        <p className="text-xs font-bold text-white">{new Date(report.last_seen_time).toLocaleDateString()} • {new Date(report.last_seen_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {/* Vetting Notes */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1.5">
                        <i className="fa-solid fa-pen-nib text-[10px] text-accent-default"></i>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Admin Notes</span>
                    </div>
                    {isEditingNotes ? (
                        <input 
                            autoFocus
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-accent-default/50 transition-all font-medium"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={handleNotesBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleNotesBlur()}
                            placeholder="Add admin notes..."
                        />
                    ) : (
                        <p 
                            onClick={() => setIsEditingNotes(true)}
                            className={`text-[11px] px-1 py-0.5 rounded cursor-pointer hover:bg-white/5 transition-all ${notes ? 'text-slate-300' : 'text-slate-600 italic'}`}
                        >
                            {notes || "Add vetting notes..."}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5 mt-auto">
            <button 
                onClick={() => {
                    navigate('/admin/matches');
                    setSearchTerm(`#${report.id.toString().padStart(4, '0')}`);
                }}
                className={`flex-grow h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 border ${
                    bestScore > 0.8 && report.status === 'reported'
                    ? 'bg-uni-600 text-white border-uni-500' 
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
            >
                <i className={reportMatches.length > 0 ? "fa-solid fa-clipboard-check text-base" : "fa-solid fa-microscope text-base"}></i>
                <span>{reportMatches.length > 0 ? `Analyze Matches (${reportMatches.length})` : 'Review Matches'}</span>
            </button>

            {report.status === 'reported' ? (
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'resolved' })}
                        className="flex-grow md:w-32 h-12 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {isUpdating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-check-circle"></i>}
                        Resolve
                    </button>
                    <button 
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'dismissed' })}
                        className="flex-grow md:w-32 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {isUpdating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-times-circle"></i>}
                        Dismiss
                    </button>
                </div>
            ) : (
                <button 
                    disabled={isUpdating}
                    onClick={() => onUpdate(report.id, { status: 'reported' })}
                    className="flex-grow md:w-auto px-6 h-12 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Revert to Active Registry
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default LostReportCard;
