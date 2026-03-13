import React from 'react';

const ReportSummary = ({ 
  type = 'lost', 
  formData, 
  otherItemName, 
  loading, 
  onSubmit 
}) => {
  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <div className={`w-24 h-24 ${type === 'lost' ? 'bg-uni-500/10 border-uni-500/20' : 'bg-green-500/10 border-green-500/20'} rounded-full flex items-center justify-center mx-auto border text-4xl mb-6 shadow-2xl`}>
            {type === 'lost' ? '📡' : '🌍'}
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public {type === 'lost' ? 'registry' : 'feed'}.</p>
      </div>
      
      <div className="max-w-4xl mx-auto w-full space-y-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {type === 'lost' ? (
              <div className="p-10 glass-panel rounded-[3rem] border border-white/5 text-left space-y-8 shadow-2xl flex flex-col justify-center h-full">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Item Details</p>
                       <p className="text-xl font-black text-white uppercase tracking-tight italic">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                    </div>
                    {formData.safe_photo_url && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                            <img src={formData.safe_photo_url} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                    )}
                 </div>
                 <div className="space-y-1 border-t border-white/5 pt-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Last Seen At</p>
                    <p className="text-xl font-black text-white uppercase tracking-tight">{formData.location_zone}</p>
                 </div>
              </div>
            ) : (
              <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative group">
                 <img src={formData.safe_photo_url} alt="Found item" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-6 left-6 right-6 text-left">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic mb-1 text-shadow">Item Details</p>
                    <p className="text-lg font-black text-white uppercase tracking-tight italic text-shadow">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                 </div>
              </div>
            )}

            <div className="space-y-6">
               <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 text-left space-y-6 shadow-2xl">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">{type === 'lost' ? 'Last seen at' : 'Found at'}</p>
                     <p className="text-lg font-black text-white uppercase tracking-tight leading-none">{formData.location_zone}</p>
                  </div>
                  <div className="space-y-4 border-t border-white/5 pt-6">
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Reported by</p>
                        <p className="text-xs font-black text-white uppercase tracking-[0.2em]">
                           {formData.guest_first_name ? `${formData.guest_first_name} ${formData.guest_last_name}` : formData.contact_full_name}
                        </p>
                     </div>
                     {formData.contact_info && (
                        <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Contact Info</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">{formData.contact_info}</p>
                        </div>
                     )}
                  </div>
               </div>

               <button 
                onClick={onSubmit} 
                disabled={loading}
                className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:bg-uni-400 hover:text-white transition-all group flex items-center justify-center gap-6"
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                     <i className="fa-solid fa-paper-plane text-2xl group-hover:rotate-12 transition-transform"></i>
                     Submit Report
                  </>
                )}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
