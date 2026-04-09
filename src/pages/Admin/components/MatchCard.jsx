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
  Bot,
  Fingerprint,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

/**
 * MatchCard - Premium Professional (Pro Max)
 * - Clean comparison architecture.
 * - Human-centric labeling.
 * - Glassmorphism depth without visual clutter.
 */
const MatchCard = ({ match, foundItem, onDeepCompare, onAuthorizeMatch, actionLoading, setPreviewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceTier = (score) => {
    if (score >= 0.85) return { 
      label: 'Strong Match', 
      color: 'bg-uni-500/10 text-uni-400 border-uni-500/20', 
      icon: CheckCircle2,
      badge: 'bg-uni-600'
    };
    if (score >= 0.60) return { 
      label: 'Likely Match', 
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
      icon: Search,
      badge: 'bg-amber-500'
    };
    return { 
      label: 'Potential', 
      color: 'bg-slate-800/80 text-slate-500 border-white/5', 
      icon: Info,
      badge: 'bg-slate-700'
    };
  };

  const tier = getConfidenceTier(match.similarity_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden border-white/5 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 transition-all duration-500 rounded-2xl md:rounded-[2rem] group ${
        isExpanded ? 'ring-1 ring-uni-500/30 bg-slate-900/80 shadow-2xl' : ''
      }`}>
        
        {/* Header Row */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 md:p-6 cursor-pointer"
        >
          <div className="flex items-center gap-4 md:gap-5">
            {/* Score Indicator */}
            <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center border border-white/10 ${tier.color}`}>
               <span className="text-base md:text-lg font-bold">{Math.round(match.similarity_score * 100)}%</span>
               <span className="text-[7px] font-bold uppercase tracking-widest opacity-60">Match</span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                 <Badge className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider text-white border-0 ${tier.badge}`}>
                    {tier.label}
                 </Badge>
                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    ID: {match.item.id.slice(0, 8)}
                 </span>
              </div>
              <h4 className="text-base md:text-lg font-bold text-white group-hover:text-uni-400 transition-colors">
                 {match.item.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                {isExpanded ? <ChevronUp size={14} className="text-uni-400" /> : <ChevronDown size={14} className="text-uni-400" />}
                {isExpanded ? 'Hide Details' : 'Show Details'}
             </div>

             <Button 
               size="sm"
               onClick={(e) => { e.stopPropagation(); onAuthorizeMatch(foundItem.id, match.item.id); }}
               disabled={actionLoading === `match-${foundItem.id}-${match.item.id}`}
               className="h-10 md:h-11 px-6 md:px-8 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all bg-white text-slate-950 hover:bg-uni-600 hover:text-white"
             >
               <LinkIcon size={14} className="mr-2" />
               Link Match
             </Button>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-4 md:p-6 pt-0 space-y-6 bg-slate-950/20 backdrop-blur-3xl">
                
                {/* Visual Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag size={10} className="text-uni-400" /> Inventory Data
                      </p>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                         <p className="text-sm font-bold text-white">{foundItem.title}</p>
                         <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{foundItem.description || 'No description.'}</p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <UserCheck size={10} className="text-amber-500" /> Student Report
                      </p>
                      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                         <p className="text-sm font-bold text-slate-200">{match.item.title}</p>
                         <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{match.item.description || 'No description.'}</p>
                      </div>
                   </div>
                </div>

                {/* Attribute Match Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {[
                     { icon: MapPin, label: 'Location Match', val1: foundItem.location, val2: match.item.location },
                     { icon: Calendar, label: 'Timeline Match', val1: new Date(foundItem.date_found).toLocaleDateString(), val2: new Date(match.item.date_lost).toLocaleDateString() },
                   ].map((row, i) => (
                     <div key={i} className="flex flex-col gap-1.5 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                           <row.icon size={12} /> {row.label}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="text-[10px] font-bold text-uni-400 uppercase truncate">{row.val1}</div>
                           <div className="text-[10px] font-bold text-amber-500 uppercase truncate border-l border-white/10 pl-3">{row.val2}</div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Footer Interaction */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden">
                      {match.item.photo_url ? (
                        <img src={match.item.photo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Lock className="text-slate-700" size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Reported By</p>
                      <p className="text-sm font-bold text-white">{match.item.owner_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {match.item.photo_url && (
                        <Button 
                          variant="ghost" 
                          onClick={() => setPreviewImage(match.item.photo_url)}
                          className="flex-1 sm:flex-none h-11 px-5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5"
                        >
                          <ExternalLink size={14} className="mr-2" />
                          Evidence
                        </Button>
                    )}
                    <Button 
                      variant="ghost"
                      onClick={() => onDeepCompare({ found: foundItem, lost: match.item, score: match.similarity_score })}
                      className="flex-1 sm:flex-none h-11 px-5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5"
                    >
                      Audit
                    </Button>
                  </div>
                </div>

              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default MatchCard;
