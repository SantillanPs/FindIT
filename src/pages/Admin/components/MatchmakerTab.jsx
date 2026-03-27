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
    <div className="space-y-12 pb-32">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-sm">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Matching Suite</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">Found items vs Lost reports cross-reference</p>
          </div>
        </div>
        
        {filteredMatches.length > 0 && (
          <Badge className="bg-slate-900/50 text-slate-400 border-white/10 px-4 py-1.5 rounded-xl text-[11px] font-bold">
            {filteredMatches.length} Found Groups
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
