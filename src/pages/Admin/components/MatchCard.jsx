import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Search, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Link as LinkIcon, 
  FileSearch, 
  Tag, 
  MapPin, 
  Calendar, 
  AlignLeft, 
  UserCheck, 
  Lock,
  ExternalLink,
  Bot
} from "lucide-react";

const MatchCard = ({ match, foundItem, onDeepCompare, onAuthorizeMatch, actionLoading, setPreviewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceTier = (score) => {
    if (score >= 0.85) return { 
      label: 'High Match', 
      variant: 'default', 
      icon: ShieldCheck, 
      color: 'bg-uni-600/10 text-uni-400 border-uni-500/20' 
    };
    if (score >= 0.60) return { 
      label: 'Medium Match', 
      variant: 'secondary', 
      icon: FileSearch, 
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
    };
    return { 
      label: 'Potential Match', 
      variant: 'outline', 
      icon: Cpu, 
      color: 'bg-slate-800 text-slate-400 border-white/5' 
    };
  };

  const tier = getConfidenceTier(match.similarity_score);

  return (
    <Card className="overflow-hidden border-white/5 bg-slate-900/40 backdrop-blur-sm hover:border-uni-500/30 transition-all duration-300 shadow-xl group">
      {/* Match Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-950/20 cursor-pointer hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-6">
          <Badge className={`py-1.5 px-4 text-[13px] font-bold gap-2 shadow-sm ${tier.color}`}>
            <tier.icon size={14} />
            Confidence: {Math.round(match.similarity_score * 100)}%
          </Badge>
          
          <div className="hidden md:flex items-center gap-2 text-[13px] font-bold text-slate-300 uppercase tracking-wider bg-slate-900/50 px-4 py-2 rounded-xl border border-white/10">
            Case Ref: <span className="text-white ml-1">#LR-{match.item.id}</span>
          </div>

          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-uni-400 transition-colors">
            {isExpanded ? <ChevronUp size={16} className="text-uni-400" /> : <ChevronDown size={16} className="text-uni-400" />}
            {isExpanded ? 'Hide Data Comparison' : 'View Data Comparison'}
          </div>
        </div>
        
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => onDeepCompare({ found: foundItem, lost: match.item, score: match.similarity_score })}
            className="hidden lg:flex font-bold text-[13px] uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 h-12 px-6 rounded-xl"
          >
            Deep Compare
          </Button>
          <Button 
            size="sm"
            onClick={() => onAuthorizeMatch(foundItem.id, match.item.id)}
            disabled={actionLoading === `match-${foundItem.id}-${match.item.id}`}
            className={`h-12 px-10 font-bold text-[13px] uppercase tracking-wider transition-all rounded-xl shadow-lg active:scale-95 ${
              match.similarity_score >= 0.85 
              ? 'bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20' 
              : 'bg-white text-slate-950 hover:bg-uni-600 hover:text-white'
            }`}
          >
            <LinkIcon size={16} className="mr-2" />
            Authorize Link
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <CardContent className="p-8 space-y-2 bg-slate-950/20">
              {/* Comparison Grid Header */}
              <div className="grid grid-cols-12 gap-8 mb-6 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-2">Attribute</div>
                <div className="col-span-10 md:col-span-10 grid grid-cols-2 gap-8">
                   <div className="flex items-center gap-3 text-uni-400"><Tag size={14} /> Found Item</div>
                   <div className="flex items-center gap-3 text-amber-500"><UserCheck size={14} /> Lost Report</div>
                </div>
              </div>

              {/* Attributes Rows */}
              {[
                { label: 'Item Type', icon: Tag, val1: foundItem.title, val2: match.item.title, highlight: true },
                { label: 'Location', icon: MapPin, val1: foundItem.location, val2: match.item.location, color1: 'text-uni-400', color2: 'text-amber-500' },
                { label: 'Timestamp', icon: Calendar, val1: new Date(foundItem.date_found).toLocaleDateString(), val2: new Date(match.item.date_lost).toLocaleDateString() }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-8 hover:bg-white/5 p-4 rounded-2xl transition-all items-center border-t border-white/5">
                  <div className="col-span-2 flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                    <row.icon size={16} className="opacity-40" /> {row.label}
                  </div>
                  <div className="col-span-10 grid grid-cols-2 gap-8">
                     <div className={`text-sm font-bold uppercase tracking-tight ${row.highlight ? 'text-white text-base' : row.color1 || 'text-slate-200'}`}>{row.val1}</div>
                     <div className={`text-sm font-bold uppercase tracking-tight ${row.highlight ? 'text-white text-base' : row.color2 || 'text-slate-200'}`}>{row.val2}</div>
                  </div>
                </div>
              ))}

              {/* Description Details */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/5 p-4 rounded-2xl transition-all items-start border-t border-white/5">
                <div className="col-span-2 flex items-center gap-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider pt-6">
                  <AlignLeft size={16} className="opacity-40" /> Context
                </div>
                <div className="col-span-10 grid grid-cols-2 gap-8">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 min-h-[100px]">
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium italic">"{foundItem.description || 'No additional office notes.'}"</p>
                  </div>
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 min-h-[100px]">
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium italic">"{match.item.description || 'No student description.'}"</p>
                  </div>
                </div>
              </div>

              {/* Footer: User Identity & Evidence */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-600 overflow-hidden shadow-inner">
                      {match.item.photo_url ? (
                        <img src={match.item.photo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Lock className="opacity-20" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Authenticated Holder</p>
                      <p className="text-[15px] font-bold text-white tracking-tight">{match.item.owner_name}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block h-10 w-px bg-white/10"></div>
                  
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Verification Level</p>
                    <p className={`text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 ${match.item.owner_name?.includes('Anonymous') ? 'text-amber-500' : 'text-uni-400'}`}>
                       {match.item.owner_name?.includes('Anonymous') ? <Bot size={14} /> : <ShieldCheck size={14} />}
                       {match.item.owner_name?.includes('Anonymous') ? 'Non-institutional Guest' : 'Verified Institutional Member'}
                    </p>
                  </div>
                </div>
                
                {match.item.photo_url && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPreviewImage(match.item.photo_url)}
                    className="h-12 w-full md:w-auto px-8 rounded-xl hover:bg-uni-500/10 text-uni-400 font-bold text-[12px] uppercase tracking-wider flex items-center gap-2 group/btn"
                  >
                    <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                    Inspect Evidence Metadata
                  </Button>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MatchCard;
