import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ShieldCheck, ExternalLink } from "lucide-react";

/**
 * ReleasedItemsTable - Premium Professional (Pro Max)
 * - Clean, breathable table layout.
 * - High-end typography (no aggressive font-black).
 * - Premium glassmorphism integration.
 */
const ReleasedItemsTable = ({ releasedItems }) => {
  return (
    <div className="overflow-x-auto p-4 md:p-8">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <th className="px-6 py-4">Item Details</th>
            <th className="px-6 py-4">Receiver Info</th>
            <th className="px-6 py-4">Fulfillment Info</th>
            <th className="px-6 py-4 text-right">Audit</th>
          </tr>
        </thead>
        <tbody>
          {releasedItems.map(item => (
            <tr key={item.id} className="group bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 transition-all duration-300">
              {/* 1. Item Ref */}
              <td className="px-6 py-6 border-y border-l border-white/5 rounded-l-[1.5rem]">
                <div className="flex flex-col gap-1.5">
                  <div className="font-bold text-white text-[13px] tracking-tight group-hover:text-uni-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">#{item.id.toString().slice(-4)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                    <span className="text-[9px] font-bold text-uni-400 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
              </td>

              {/* 2. Receiver */}
              <td className="px-6 py-6 border-y border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/5 overflow-hidden shrink-0 shadow-lg relative">
                        {item.released_to_photo_url || item.photo_url ? (
                            <img src={item.released_to_photo_url || item.photo_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <User size={16} className="text-slate-800 absolute inset-0 m-auto" />
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <div className="text-xs font-bold text-slate-200">
                          {item.released_to_id ? (
                            <Link to={`/admin/profile/${item.released_to_id}`} className="hover:text-uni-400 border-b border-transparent hover:border-uni-400/30 transition-all">
                              {item.released_to_name || 'Anonymous Receiver'}
                            </Link>
                          ) : (
                            item.released_to_name || 'Walk-in Claimant'
                          )}
                       </div>
                       <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                         {item.released_to_id_number || 'No ID Recorded'}
                       </div>
                    </div>
                 </div>
               </td>

              {/* 3. Fulfillment */}
              <td className="px-6 py-6 border-y border-white/5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <Calendar size={12} className="text-uni-500" />
                    {item.released_at ? new Date(item.released_at).toLocaleDateString() : 'Awaiting Date'}
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    {item.released_by_name ? `Verified By ${item.released_by_name}` : 'Awaiting Admin Audit'}
                  </div>
                </div>
              </td>

              {/* 4. Audit Status */}
              <td className="px-6 py-6 border-y border-r border-white/5 rounded-r-[1.5rem] text-right">
                 <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1">
                   Audit Complete
                 </Badge>
              </td>
            </tr>
          ))}
          {releasedItems.length === 0 && (
            <tr>
              <td colSpan="4" className="px-6 py-24 text-center">
                 <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-800">
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No fulfillment history recorded</p>
                 </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReleasedItemsTable;
