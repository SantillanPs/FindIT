import React from 'react';
import ClaimCard from './ClaimCard';

const ClaimsTab = ({ 
  filteredClaims, 
  setSelectedClaim, 
  setClaimReviewStep 
}) => {
  return (
    <div className="p-8 space-y-6">
      {filteredClaims.length === 0 ? (
        <div className="py-20 text-center opacity-50">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No matching claims</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
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
