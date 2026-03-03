import React from 'react';
import { CATEGORIES } from '../../../constants/categories';

const InventoryCard = ({ item, matches, pendingClaims, navigate, setSearchTerm, handleStatusUpdate, setShowReleaseModal, setReleaseForm, actionLoading }) => {
  const itemMatches = matches.find(m => m.found_item.id === item.id)?.top_matches || [];
  const itemClaims = pendingClaims.filter(c => c.found_item_id === item.id);

  return (
    <div key={item.id} className={`bg-white/[0.02] border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative ${
       item.status === 'claimed' ? 'border-green-500/30' : 
       item.status === 'in_custody' ? 'border-sky-500/20' : 'border-white/5'
    }`}>
       {item.status !== 'reported' && (
           <div className={`absolute top-0 left-0 w-1 h-full shadow-[0_0_15px_rgba(var(--color-status-rgb),0.5)] ${
             item.status === 'in_custody' ? 'bg-sky-500' : 'bg-green-500'
           }`}></div>
       )}
       <div className="flex items-center gap-5">
          {/* Visual ID */}
          <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center text-2xl shadow-inner relative flex-shrink-0">
             {CATEGORIES.find(c => c.id === item.category)?.emoji || '📦'}
             <div className="absolute -bottom-1 -right-1 bg-slate-800 text-[7px] font-black text-slate-400 px-1.5 py-0.5 rounded-md border border-white/5">
                #{item.id.toString().padStart(4, '0')}
             </div>
          </div>

          {/* Primary Info */}
          <div className="space-y-1">
             <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{item.item_name}</h4>
             <div className="flex items-center gap-3">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.category}</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                   {new Date(item.found_time).toLocaleDateString()}
                </span>
             </div>
          </div>
       </div>

       {/* Match & Claim Insights */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow max-w-xl">
          <div className="space-y-1">
             <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest opacity-60">Status Info</p>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-200 uppercase tracking-wide">
                <i className="fa-solid fa-location-dot text-uni-400 text-[9px]"></i>
                {item.location_zone}
             </div>
             <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
                Log: {item.contact_full_name || 'System Registry'}
             </p>
          </div>

          <div className="space-y-1 border-l border-white/5 pl-4 hidden sm:block">
             <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest opacity-60">Insight Analysis</p>
             <div className="flex flex-wrap gap-2">
                {itemMatches.length > 0 ? (
                    <div className="flex items-center gap-1.5 bg-uni-500/10 px-2 py-0.5 rounded border border-uni-500/20">
                       <span className="text-[8px] font-black text-uni-400">{itemMatches.length} matches</span>
                       <div className="w-1 h-1 rounded-full bg-uni-400 animate-pulse"></div>
                    </div>
                ) : (
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Searching matches...</span>
                )}
                
                {itemClaims.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                       <span className="text-[8px] font-black text-amber-500">{itemClaims.length} Claims</span>
                    </div>
                )}

                {itemMatches.length > 0 && (
                    <button 
                        onClick={() => {
                            navigate('/admin/matches');
                            setSearchTerm(`#${item.id.toString().padStart(4, '0')}`);
                        }}
                        className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:underline decoration-uni-500/50 underline-offset-4"
                    >
                        Inspect Matches →
                    </button>
                )}
             </div>
          </div>
       </div>

       {/* Actions */}
       <div className="w-full md:w-auto flex flex-col items-end gap-3 border-t md:border-none border-white/5 pt-4 md:pt-0">
          <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.1em] border ${
             item.status === 'reported' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
             item.status === 'in_custody' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
             'bg-green-500/10 text-green-400 border-green-500/20'
          }`}>
            {item.status === 'reported' ? 'Pending intake' : item.status.replace('_', ' ')}
          </div>

          {item.status === 'reported' ? (
              <button 
                onClick={() => handleStatusUpdate(item, 'in_custody')}
                disabled={actionLoading === item.id}
                className="w-full md:w-40 bg-uni-600 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-uni-500 transition-all shadow-lg shadow-uni-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                 <i className="fa-solid fa-plus-circle"></i>
                 {actionLoading === item.id ? '...' : 'Secure Item'}
              </button>
          ) : (
             <button 
                onClick={() => {
                   setShowReleaseModal(item);
                    setReleaseForm({ 
                       name: item.identified_name || '', 
                       id_number: item.identified_student_id || '',
                       photo_url: '' 
                    });
                }}
                className="w-full md:w-auto px-6 py-2 rounded-xl text-[9px] font-black text-green-500 hover:text-white hover:bg-green-500/20 uppercase tracking-[0.2em] transition-all border border-green-500/10 active:scale-95"
             >
                Process Release
             </button>
          )}
       </div>
    </div>
  );
};

export default InventoryCard;
