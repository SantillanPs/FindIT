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
    <div className="space-y-16 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <div className={`w-24 h-24 ${type === 'lost' ? 'bg-uni-500/10 border-uni-500/20' : 'bg-green-500/10 border-green-500/20'} rounded-full flex items-center justify-center mx-auto border text-4xl mb-6 shadow-2xl`}>
            {type === 'lost' ? '📡' : '🌍'}
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public {type === 'lost' ? 'registry' : 'feed'}.</p>
      </div>
      
      <div className="max-w-5xl mx-auto w-full space-y-12 text-left">
        {/* Horizontal Info Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryTile 
                label="Item Category" 
                value={formData.category === 'Other' ? otherItemName : formData.category}
                icon="fa-tag"
            />
            <SummaryTile 
                label={type === 'lost' ? "Last Seen at" : "Found at"} 
                value={formData.location_zone}
                icon="fa-location-dot"
            />
            <SummaryTile 
                label="Reporter Identity" 
                value={primaryName}
                icon="fa-user-tag"
            />
        </div>

        {/* Descriptive Area & Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="glass-panel p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Description Snippet</p>
                    <p className="text-lg font-bold text-slate-300 italic leading-relaxed uppercase">"{formData.description}"</p>
                </div>
                
                {(formData.contact_info || formData.guest_email) && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Contact Channels</p>
                        <div className="space-y-2">
                             {formData.guest_email && <p className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5 inline-block mr-2">📧 {formData.guest_email}</p>}
                             {formData.contact_info && <p className="text-sm font-bold text-white uppercase tracking-widest leading-relaxed bg-white/5 p-4 rounded-2xl">{formData.contact_info}</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative group rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl aspect-video lg:aspect-auto">
                {formData.safe_photo_url ? (
                    <img src={formData.safe_photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Item Preview" />
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
                className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:bg-uni-500 hover:text-white transition-all group flex items-center justify-center gap-6 active:scale-95"
            >
                {loading ? (
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        TRANSMITTING...
                    </div>
                ) : (
                    <>
                        <i className="fa-solid fa-cloud-arrow-up text-2xl group-hover:-translate-y-1 transition-transform"></i>
                        Confirm & Finalize Report
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

const SummaryTile = ({ label, value, icon }) => (
    <div className="p-8 glass-panel rounded-[2rem] border border-white/5 shadow-xl flex items-center gap-6 group hover:border-white/10 transition-all overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl text-uni-400 border border-white/5 group-hover:bg-uni-500 group-hover:text-white transition-all shrink-0">
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-md font-black text-white uppercase tracking-tight truncate">{value}</p>
        </div>
    </div>
);

export default ReportSummary;
