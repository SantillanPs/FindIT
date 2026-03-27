import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ShieldCheck, Mail, Bot, ArrowRight, User as UserIcon } from "lucide-react";

const ClaimCard = ({ claim, onReview }) => {
  return (
    <Card key={claim.id} className="bg-slate-900/40 border-white/5 backdrop-blur-sm rounded-[1.5rem] overflow-hidden group hover:bg-slate-900/60 transition-all transition-transform active:scale-[0.99]">
        <CardContent className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
           <div className="flex items-center gap-6 w-full">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center text-2xl overflow-hidden relative shadow-inner flex-shrink-0 group-hover:border-uni-500/30 transition-colors">
                 {claim.proof_photo_url ? (
                   <img src={claim.proof_photo_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 ) : (
                   <FileText className="text-slate-600 group-hover:text-uni-400 transition-colors" size={24} />
                 )}
              </div>

              <div className="space-y-2 flex-grow">
                 <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-[15px] font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors">
                       {claim.owner_name || `Student: ${claim.student_id}`}
                    </h4>
                    <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[11px] font-bold px-2.5 py-1">
                       Pending Review
                    </Badge>
                    {claim.similarity_score && (
                       <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 text-[11px] font-bold px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                          <Bot size={12} className="animate-pulse" />
                          AI Score: {(claim.similarity_score * 100).toFixed(0)}%
                       </Badge>
                    )}
                 </div>

                 <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <ShieldCheck size={12} className="text-uni-400" />
                       Item Category: <span className="text-slate-200 ml-0.5">{claim.found_item_category}</span>
                    </p>
                    {claim.owner_email && (
                      <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                    )}
                    <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <Mail size={12} className="text-slate-500" />
                       <span className="text-slate-200">{claim.owner_email || 'Verified Institutional ID'}</span>
                    </p>
                 </div>

                 <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 mt-2 group-hover:border-white/10 transition-colors">
                   <p className="text-[13px] text-uni-400 font-medium italic opacity-100 leading-relaxed">
                      Proof: "{claim.proof_description.substring(0, 80)}..."
                   </p>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-auto mt-4 md:mt-0">
              <Button 
                onClick={() => onReview(claim)}
                className="w-full md:w-48 bg-uni-600 hover:bg-uni-700 text-white text-[13px] font-bold uppercase tracking-wider h-14 rounded-xl shadow-lg shadow-uni-600/10 transition-all active:scale-95 group-hover:shadow-uni-600/20"
              >
                 Analyze Claim <ArrowRight size={16} className="ml-2.5" />
              </Button>
           </div>
        </CardContent>
    </Card>
  );
};

export default ClaimCard;
