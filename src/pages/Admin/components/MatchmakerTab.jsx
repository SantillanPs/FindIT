import React from 'react';
import MatchGroupHeader from './MatchGroupHeader';
import MatchCard from './MatchCard';
import { Sparkles, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MatchmakerTab = ({ 
  filteredMatches, 
  setSelectedMatchPair, 
  handleConnectMatch, 
  actionLoading, 
  setPreviewImage 
}) => {
  return (
    <div className="space-y-8 md:space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 md:px-2">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-uni-600/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-uni-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Sparkles size={24} className="animate-pulse relative z-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight uppercase">AI Matching Suite</h3>
            <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-uni-500 animate-pulse"></div>
               Intelligent Cross-Reference Engine Active
            </div>
          </div>
        </div>
        
        {filteredMatches.length > 0 && (
          <Badge className="bg-slate-900 border-white/5 px-6 h-10 md:h-12 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-uni-400"></div>
            {filteredMatches.length} Found Groups Identified
          </Badge>
        )}
      </div>

      {filteredMatches.length === 0 ? (
        <div className="py-32 text-center space-y-4 opacity-40">
           <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto border border-white/5">
             <SearchX size={32} className="text-slate-700" />
           </div>
           <div>
             <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">No Matches Found</p>
             <p className="text-[12px] text-slate-500 font-medium mt-1">Cross-referencing engine has no candidates</p>
           </div>
        </div>
      ) : (
        <div className="space-y-16">
           {filteredMatches.map((group, gIdx) => (
              <div key={gIdx} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500" style={{ animationDelay: `${gIdx * 100}ms` }}>
                 <MatchGroupHeader 
                   foundItem={group.found_item} 
                   setPreviewImage={setPreviewImage} 
                 />
                 
                 <div className="space-y-4 relative pl-8">
                    <div className="absolute left-3 top-0 bottom-4 w-px bg-gradient-to-b from-uni-500/30 via-uni-500/10 to-transparent"></div>
                    {group.top_matches.map((match, mIdx) => (
                       <MatchCard 
                          key={mIdx}
                          match={match}
                          foundItem={group.found_item}
                          onDeepCompare={setSelectedMatchPair}
                          onAuthorizeMatch={handleConnectMatch}
                          actionLoading={actionLoading}
                          setPreviewImage={setPreviewImage}
                       />
                     ))}
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default MatchmakerTab;
