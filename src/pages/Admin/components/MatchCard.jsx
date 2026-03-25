import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

const MatchCard = ({ match, foundItem, onDeepCompare, onAuthorizeMatch, actionLoading, setPreviewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceTier = (score) => {
    if (score >= 0.85) return { label: 'High Match', variant: 'brand', icon: 'fa-shield-check', color: 'text-brand-primary' };
    if (score >= 0.60) return { label: 'Medium Match', variant: 'accent', icon: 'fa-magnifying-glass-chart', color: 'text-brand-secondary' };
    return { label: 'Potential Match', variant: 'outline', icon: 'fa-microchip', color: 'text-muted-foreground' };
  };

  const tier = getConfidenceTier(match.similarity_score);

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm hover:border-brand-primary/30 transition-all duration-300 shadow-lg">
      {/* Match Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-8 py-6 border-b border-border/40 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-6">
          <Badge variant={tier.variant} className="py-1.5 px-4 text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm">
            <i className={`fa-solid ${tier.icon}`}></i>
            Confidence: {Math.round(match.similarity_score * 100)}%
          </Badge>
          
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-xl border border-border/10">
            Case Ref: <span className="text-white ml-1">#LR-{match.item.id}</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-brand-primary`}></i>
            {isExpanded ? 'Hide Comparison' : 'View Comparison'}
          </div>
        </div>
        
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onDeepCompare({ found: foundItem, lost: match.item, score: match.similarity_score })}
            className="hidden lg:flex font-black text-[10px] uppercase tracking-widest border-border/50 hover:bg-white/5"
          >
            Side-By-Side Review
          </Button>
          <Button 
            size="sm"
            onClick={() => onAuthorizeMatch(foundItem.id, match.item.id)}
            disabled={actionLoading === `match-${foundItem.id}-${match.item.id}`}
            className={`px-8 font-black text-[10px] uppercase tracking-widest transition-all ${
              match.similarity_score >= 0.85 ? 'bg-brand-primary text-white' : 'bg-white text-black hover:bg-brand-primary hover:text-white'
            }`}
          >
            <i className="fa-solid fa-link mr-2"></i>
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="p-8 space-y-2">
              {/* Comparison Grid */}
              <div className="grid grid-cols-12 gap-8 mb-6 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="col-span-2">Attribute</div>
                <div className="col-span-5 flex items-center gap-3 text-brand-primary"><i className="fa-solid fa-vault"></i> 1. The Vault</div>
                <div className="col-span-5 flex items-center gap-3 text-brand-secondary"><i className="fa-solid fa-user-graduate"></i> 2. The Report</div>
              </div>

              {/* Attributes Rows */}
              {[
                { label: 'Type', icon: 'fa-tag', val1: foundItem.item_name, val2: match.item.item_name, highlight: true },
                { label: 'Location', icon: 'fa-location-dot', val1: foundItem.location_zone, val2: match.item.location_zone, color1: 'text-brand-primary', color2: 'text-brand-secondary' },
                { label: 'Date', icon: 'fa-calendar', val1: new Date(foundItem.found_time).toLocaleDateString(), val2: new Date(match.item.last_seen_time).toLocaleDateString() }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-8 hover:bg-white/5 p-4 rounded-xl transition-all items-center border-t border-border/10">
                  <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    <i className={`fa-solid ${row.icon} w-6 text-muted-foreground/40`}></i> {row.label}
                  </div>
                  <div className={`col-span-5 text-sm font-black uppercase tracking-tight ${row.highlight ? 'text-white text-lg' : row.color1 || 'text-slate-300'}`}>{row.val1}</div>
                  <div className={`col-span-5 text-sm font-black uppercase tracking-tight ${row.highlight ? 'text-white text-lg' : row.color2 || 'text-slate-300'}`}>{row.val2}</div>
                </div>
              ))}

              {/* Description Details */}
              <div className="grid grid-cols-12 gap-8 hover:bg-white/5 p-4 rounded-xl transition-all items-start border-t border-border/10">
                <div className="col-span-2 flex items-center gap-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest pt-4">
                  <i className="fa-solid fa-align-left w-6 text-muted-foreground/40"></i> Details
                </div>
                <div className="col-span-5">
                  <div className="bg-muted/30 p-5 rounded-2xl border border-border/10 min-h-[100px]">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic">"{foundItem.description || 'No office notes.'}"</p>
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="bg-muted/30 p-5 rounded-2xl border border-border/10 min-h-[100px]">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic">"{match.item.description || 'No student info.'}"</p>
                  </div>
                </div>
              </div>

              {/* Footer: User Identity */}
              <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between px-4">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border/20 flex items-center justify-center text-muted-foreground overflow-hidden">
                      {match.item.safe_photo_url ? (
                        <img src={match.item.safe_photo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <i className="fa-solid fa-user-shield text-xl opacity-30"></i>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Owner / Reporter</p>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{match.item.owner_name}</p>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-border/40"></div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Verification</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${match.item.owner_name?.includes('Anonymous') ? 'text-brand-secondary' : 'text-brand-primary'}`}>
                      <i className={`fa-solid ${match.item.owner_name?.includes('Anonymous') ? 'fa-user-secret' : 'fa-certificate'} mr-2`}></i>
                      {match.item.owner_name?.includes('Anonymous') ? 'Guest Record' : 'Institutional Member'}
                    </p>
                  </div>
                </div>
                
                {match.item.safe_photo_url && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPreviewImage(match.item.safe_photo_url)}
                    className="text-brand-secondary font-black text-[10px] uppercase tracking-widest"
                  >
                    View Attached Evidence
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
