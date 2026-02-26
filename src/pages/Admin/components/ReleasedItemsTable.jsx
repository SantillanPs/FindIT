import React from 'react';

const ReleasedItemsTable = ({ releasedItems }) => {
  return (
    <div className="overflow-x-auto p-8">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <th className="px-8 py-5">Item & Ref</th>
            <th className="px-8 py-5">Handed Over To</th>
            <th className="px-8 py-5">Release Details</th>
            <th className="px-8 py-5 text-right">Audit Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {releasedItems.map(item => (
            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-8 py-6">
                <div className="font-black text-white text-[11px] uppercase tracking-widest mb-1">{item.item_name}</div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">#{item.id.toString().padStart(4, '0')} • {item.category}</div>
              </td>
               <td className="px-8 py-6">
                 <div className="flex items-center gap-3">
                    {item.released_to_photo_url && (
                        <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden shrink-0">
                            <img src={item.released_to_photo_url} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                       <div className="text-[11px] text-uni-400 font-black uppercase tracking-widest">{item.released_to_name}</div>
                       <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">{item.released_to_id_number}</div>
                    </div>
                 </div>
               </td>
              <td className="px-8 py-6">
                <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Released {new Date(item.released_at).toLocaleDateString()}</div>
                <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Authorized By {item.released_by_name}</div>
              </td>
              <td className="px-8 py-6 text-right">
                 <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-green-500/10 text-green-400 border-green-500/20">Archived Record</span>
              </td>
            </tr>
          ))}
          {releasedItems.length === 0 && (
            <tr>
              <td colSpan="4" className="px-8 py-20 text-center opacity-50">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No released items found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReleasedItemsTable;
