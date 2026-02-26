import React from 'react';

const ClaimCard = ({ claim, onReview }) => {
  return (
    <div key={claim.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-center text-2xl overflow-hidden relative">
             {claim.proof_photo_url ? (
               <img src={claim.proof_photo_url} className="w-full h-full object-cover" />
             ) : (
               '📄'
             )}
          </div>
          <div>
             <div className="text-[12px] font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                {claim.owner_name || `Student ID: ${claim.student_id}`}
                <span className="text-[7px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/10 font-black">Pending Review</span>
                {claim.similarity_score && (
                   <span className="text-[7px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/10 font-black flex items-center gap-1">
                      <i className="fa-solid fa-robot text-[8px]"></i>
                      AI Score: {(claim.similarity_score * 100).toFixed(0)}%
                   </span>
                )}
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Item: <span className="text-white">{claim.found_item_category}</span> • {claim.owner_email || 'Institutional Member'}
             </p>
             <p className="text-[9px] text-uni-400 font-black uppercase mt-2 italic opacity-80">
                Claim Proof: "{claim.proof_description.substring(0, 60)}..."
             </p>
          </div>
       </div>
       <div className="flex gap-3">
          <button 
            onClick={() => onReview(claim)}
            className="px-6 py-2.5 bg-uni-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-uni-500 transition-all shadow-lg shadow-uni-600/20 active:scale-95"
          >
             Analyze Claim
          </button>
       </div>
    </div>
  );
};

export default ClaimCard;
