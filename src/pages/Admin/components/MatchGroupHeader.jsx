import { Badge } from "@/components/ui/badge";
import { Package, Search, MapPin, Tag } from "lucide-react";

/**
 * MatchGroupHeader - Premium Professional (Pro Max)
 * - Clean, breathable layout for the item being matched.
 * - Human-centric labeling.
 */
const MatchGroupHeader = ({ foundItem }) => {
  return (
    <div className="relative p-5 md:p-8 bg-slate-900/60 backdrop-blur-3xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-uni-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5 md:gap-6">
           {/* Item Visual */}
           <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-xl overflow-hidden shrink-0">
              {foundItem.photo_url ? (
                <img src={foundItem.photo_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <Package size={32} className="text-slate-800" />
              )}
           </div>

           <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                 <Badge className="bg-uni-500/20 text-uni-400 border-0 px-2.5 font-bold uppercase text-[9px] tracking-wider">
                    Item Analysis
                 </Badge>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    ID: {foundItem.id.slice(0, 8)}
                 </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                 {foundItem.title}
              </h2>
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <MapPin size={14} className="text-uni-500" />
                  {foundItem.location}
                </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-start md:items-center w-full md:min-w-[140px]">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Reported Status</span>
              <span className="text-xs font-bold text-white uppercase italic tracking-wider">In Registry</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MatchGroupHeader;
