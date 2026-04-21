import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const MatchResults = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [reportId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // 1. Invoke the Forensic Matching Engine Edge Function
      const { data: matchedData, error: matchError } = await supabase.functions.invoke('match-forensics', {
        body: { lost_item_id: reportId }
      });

      if (matchError) throw matchError;

      // 2. Format matches with Forensic Reasoning
      const formattedMatches = (matchedData || []).map(m => ({
        item: {
          id: m.id,
          title: m.title,
          category: m.category,
          description: m.description,
          location: m.location,
          date_found: m.date_found,
          photo_url: m.photo_url
        },
        similarity_score: m.match_score / 100, // Normalize to 0-1
        reasoning: m.match_reasoning || [],
        is_high_confidence: m.is_high_confidence
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Forensic matching failed', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceTier = (score) => {
    if (score >= 0.85) return { label: 'High Match', variant: 'brand', icon: 'fa-shield-check' };
    if (score >= 0.60) return { label: 'Medium Match', variant: 'accent', icon: 'fa-magnifying-glass-chart' };
    return { label: 'Potential Match', variant: 'outline', icon: 'fa-microchip' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
       <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
       <p className="mt-8 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Analyzing Database for correlations...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="space-y-6 text-left border-b border-border/40 pb-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="px-0 hover:bg-transparent text-brand-primary font-black text-[10px] uppercase tracking-widest gap-2"
        >
          <i className="fa-solid fa-chevron-left"></i>
          Return to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Match Results</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest mt-3 max-w-2xl">
            Our algorithmic engine identified these found items as potential matches for your report.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {matches.length === 0 ? (
          <Card className="py-24 text-center border-border/50 bg-card/40 backdrop-blur-md">
             <div className="text-5xl mb-8 opacity-20">🔍</div>
             <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-4">No direct matches detected</h3>
             <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                We'll continue scanning the registry. You'll be notified immediately upon a high-confidence match.
             </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {matches.map(({ item, similarity_score, reasoning, is_high_confidence }) => {
              const tier = getConfidenceTier(similarity_score);
              return (
                <Card 
                  key={item.id} 
                  className={`group overflow-hidden border-border/50 bg-card/60 hover:bg-card/80 transition-all duration-500 shadow-xl ${is_high_confidence ? 'ring-2 ring-brand-primary ring-offset-4 ring-offset-black' : 'shadow-brand-primary/5'}`}
                >
                  <div className="flex flex-col md:flex-row min-h-[320px]">
                    <div className="w-full md:w-80 h-64 md:h-auto bg-muted shrink-0 relative overflow-hidden">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">📦</div>
                      )}
                      
                      {is_high_confidence && (
                        <div className="absolute top-0 left-0 bg-brand-primary text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-tighter shadow-lg z-10">
                          Critical Alert Match
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4">
                         <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-[9px] py-1 px-3">
                            {item.location}
                         </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="flex-grow p-8 flex flex-col justify-between text-left">
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category} recovered</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{item.title}</h3>
                          </div>
                          <Badge variant={tier.variant} className="py-2 px-5 text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm shrink-0 w-fit">
                            <i className={`fa-solid ${tier.icon}`}></i>
                            {tier.label} ({Math.round(similarity_score * 100)}%)
                          </Badge>
                        </div>

                        {/* Forensic Reasoning Cloud */}
                        <div className="flex flex-wrap gap-2">
                           {reasoning.map((reason, idx) => (
                             <Badge key={idx} variant="outline" className="text-[8px] font-bold border-brand-primary/20 bg-brand-primary/5 text-brand-primary/80 py-1 px-2 uppercase tracking-wide">
                               {reason}
                             </Badge>
                           ))}
                        </div>
                        
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Evidence Summary:</p>
                           <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed italic border-l-2 border-brand-primary/30 pl-6 py-2">
                            "{item.description}"
                           </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 mt-auto border-t border-border/40">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <i className="fa-solid fa-calendar-check text-xs"></i>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Logged: {new Date(item.date_found).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
     
                        <Button 
                          onClick={() => navigate(`/submit-claim/${item.id}`)}
                          className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02]"
                        >
                          Verify Ownership
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResults;
