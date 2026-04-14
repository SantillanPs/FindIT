import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ShieldCheck, Mail, Bot, ArrowRight, User as UserIcon } from "lucide-react";

/**
 * ClaimCard - Premium Professional (Pro Max)
 * - Refined glassmorphism.
 * - Human-centric labeling.
 * - Clean, heavy-legibility typography.
 */
const ClaimCard = ({ claim, onReview }) => {
  return (
    <Card key={claim.id} className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[1.5rem] overflow-hidden group hover:bg-slate-900/60 transition-all duration-300">
        <CardContent className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
           <div className="flex items-center gap-6 w-full">
              {/* Proof / Image Section */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl border border-white/5 flex items-center justify-center text-2xl overflow-hidden relative shadow-2xl flex-shrink-0 group-hover:border-uni-500/30 transition-colors">
                 {claim.proof_photo_url ? (
                   <img src={claim.proof_photo_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 ) : (
                   <FileText className="text-slate-800 group-hover:text-uni-400 transition-colors" size={24} />
                 )}
              </div>

              <div className="space-y-1.5 flex-grow">
                 <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors">
                       {claim.owner_name || `Student: ${claim.student_id}`}
                    </h4>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest">
                       Pending Review
                    </Badge>
                    {claim.similarity_score && (
                       <Badge className="bg-uni-500/10 text-uni-400 border-uni-500/20 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1.5">
                          <Bot size={11} />
                          AI Score: {Math.round(claim.similarity_score * 100)}%
                       </Badge>
                    )}
                 </div>

                 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={14} className="text-uni-400" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claimed Item:</span>
                       <span className="text-xs font-semibold text-slate-300">{claim.item_title || 'General Item'}</span>
                    </div>
                    {claim.owner_email && (
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-800"></div>
                    )}
                    <div className="flex items-center gap-2">
                       <Mail size={14} className="text-slate-600" />
                       <span className="text-xs font-semibold text-slate-300">{claim.owner_email || 'Verified ID'}</span>
                    </div>
                 </div>

                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-3 group-hover:border-white/10 transition-colors">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Student's Statement</span>
                       "{claim.proof_description.substring(0, 80)}..."
                    </p>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-auto self-center">
              <Button 
                onClick={() => onReview(claim)}
                className="w-full md:w-48 bg-white text-slate-950 hover:bg-uni-600 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] h-14 rounded-xl shadow-2xl transition-all active:scale-95"
              >
                 Review Claim <ArrowRight size={16} className="ml-2.5" />
              </Button>
           </div>
        </CardContent>
    </Card>
  );
};

export default ClaimCard;
