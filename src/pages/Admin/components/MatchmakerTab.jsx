import React from 'react';
import MatchGroupHeader from './MatchGroupHeader';
import MatchCard from './MatchCard';

const MatchmakerTab = ({ 
  filteredMatches, 
  setSelectedMatchPair, 
  handleConnectMatch, 
  actionLoading, 
  setPreviewImage 
}) => {
  return (
    <div className="p-8 space-y-12 pb-32">
      {filteredMatches.length === 0 ? (
        <div className="py-20 text-center opacity-50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Matches Found</p>
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-2">No cross-referenced reports found at this time</p>
        </div>
      ) : (
        <div className="space-y-16">
           {filteredMatches.map((group, gIdx) => (
              <div key={gIdx} className="space-y-8">
                 <MatchGroupHeader 
                   foundItem={group.found_item} 
                   setPreviewImage={setPreviewImage} 
                 />
                 
                 <div className="space-y-4">
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
