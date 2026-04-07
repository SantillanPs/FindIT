import React from 'react';

const ReportSummary = ({ 
  type = 'lost', 
  formData, 
  otherItemName, 
  loading, 
  onSubmit 
}) => {
  const primaryName = formData.guest_first_name 
    ? `${formData.guest_first_name} ${formData.guest_last_name}` 
    : formData.contact_full_name || 'Anonymous';

  return (
    <div className="space-y-10 py-5 flex-grow flex flex-col text-center">
      
      <div className="max-w-5xl mx-auto w-full space-y-12 text-left">
        {/* Horizontal Info Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryTile 
                label="Item Category" 
                value={formData.category === 'Other' ? otherItemName : formData.category}
                icon="fa-tag"
                color="text-amber-400"
                borderColor="border-amber-500/30"
            />
            <SummaryTile 
                label="Reporter Identity" 
                value={primaryName}
                icon="fa-user-tag"
                color="text-cyan-400"
                borderColor="border-cyan-500/30"
            />
        </div>

        {/* Descriptive Area & Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="glass-panel p-10 rounded-[3rem] border border-white/5 space-y-10 flex flex-col justify-center">
                <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-indigo-400 shrink-0 border-2 border-indigo-500/30 mt-1">
                        <i className="fa-solid fa-quote-left"></i>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Item Description</p>
                        <p className="text-xl font-bold text-white italic leading-snug uppercase">"{formData.description}"</p>
                    </div>
                </div>

                <div className="flex gap-6 items-start pt-8 border-t border-white/5">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-emerald-400 shrink-0 border-2 border-emerald-500/30 mt-1">
                        <i className="fa-solid fa-map-location-dot"></i>
                    </div>
                    <div className="space-y-1 flex-grow">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            {type === 'found' ? 'Found Location' : 'Last Seen Journey'}
                        </p>
                        {type === 'found' ? (
                            <p className="text-lg font-black text-white uppercase tracking-tight leading-snug">{formData.location}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {formData.location.split(', ').map((loc, i) => (
                                    <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
                                        {loc} 
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {(formData.contact_info || formData.guest_email) && (
                    <div className="flex gap-6 items-start pt-8 border-t border-white/5">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-rose-400 shrink-0 border-2 border-rose-500/30 mt-1">
                            <i className="fa-solid fa-id-card"></i>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Contact Channels</p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                 {formData.guest_email && (
                                     <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                         <i className="fa-solid fa-envelope text-rose-400 text-xs"></i>
                                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{formData.guest_email}</span>
                                     </div>
                                 )}
                                 {formData.contact_info && (
                                     <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                         <i className="fa-solid fa-phone text-rose-400 text-xs"></i>
                                         <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[200px]">{formData.contact_info}</span>
                                     </div>
                                 )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative group rounded-[3rem] overflow-hidden border-2 border-white/5 aspect-video lg:aspect-auto">
                {formData.photo_url ? (
                    <img src={formData.photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Item Preview" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center space-y-4 opacity-50 italic text-center p-10">
                        <span className="text-5xl">📷</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">No visual preview attached</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        </div>

        <div className="pt-8">
            <button 
                onClick={onSubmit} 
                disabled={loading}
                className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] border border-black/5 hover:bg-uni-500 hover:text-white transition-all group flex items-center justify-center gap-6 active:scale-95"
            >
                {loading ? (
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        SUBMITTING...
                    </div>
                ) : (
                    <>
                        <i className="fa-solid fa-cloud-arrow-up text-2xl group-hover:-translate-y-1 transition-transform"></i>
                        Submit Report
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

const SummaryTile = ({ label, value, icon, color = 'text-uni-400', borderColor = 'border-white/5' }) => (
    <div className="p-8 glass-panel rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all overflow-hidden">
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${color} border-2 ${borderColor} transition-all shrink-0`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-md font-black text-white uppercase tracking-tight truncate">{value}</p>
        </div>
    </div>
);

export default ReportSummary;
