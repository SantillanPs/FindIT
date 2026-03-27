import React from 'react';
import ClaimCard from './ClaimCard';
import { ClipboardList, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ClaimsTab = ({ 
  filteredClaims, 
  setSelectedClaim, 
  setClaimReviewStep 
}) => {
  return (
    <div className="space-y-10 min-h-full">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-sm">
            <ClipboardList size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Claims</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">Verification queue pending review</p>
          </div>
        </div>
        
        {filteredClaims.length > 0 && (
          <Badge className="bg-slate-900/50 text-slate-400 border-white/10 px-4 py-1.5 rounded-xl text-[11px] font-bold">
            {filteredClaims.length} Claims Total
          </Badge>
        )}
      </div>

      {filteredClaims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
           <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5">
             <SearchX size={32} className="text-slate-700" />
           </div>
           <div>
             <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">No matching claims</p>
             <p className="text-[12px] text-slate-500 font-medium mt-1">Registry is clear or no claims match your search</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredClaims.map(claim => (
            <ClaimCard 
              key={claim.id} 
              claim={claim} 
              onReview={(c) => {
                setSelectedClaim(c);
                setClaimReviewStep(1);
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimsTab;
