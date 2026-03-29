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
      
      // 1. Fetch the lost item's embedding
      const { data: lostItem, error: fetchError } = await supabase
        .from('lost_items')
        .select('embedding')
        .eq('id', reportId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!lostItem?.embedding) {
        setMatches([]);
        return;
      }

      // 2. Call RPC to match against found_items
      const { data: matchedData, error: matchError } = await supabase.rpc('match_found_items', {
        query_embedding: lostItem.embedding,
        match_threshold: 0.1, // Adjusted for broader matching
        match_count: 50
      });

      if (matchError) throw matchError;

      // 3. Format matches to fit the UI expectation
      // The UI expects { item: object, similarity_score: number }
      const formattedMatches = (matchedData || []).map(m => ({
        item: {
          id: m.id,
          item_name: m.item_name,
          category: m.category,
          description: m.description,
          location_zone: m.location_zone,
          found_time: m.found_time,
          safe_photo_url: m.safe_photo_url
        },
        similarity_score: m.similarity
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Failed to fetch matches from Supabase', error);
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
            {matches.map(({ item, similarity_score }) => {
              const tier = getConfidenceTier(similarity_score);
              return (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden border-border/50 bg-card/60 hover:bg-card/80 transition-all duration-500 shadow-xl shadow-brand-primary/5"
                >
                  <div className="flex flex-col md:flex-row min-h-[320px]">
                    <div className="w-full md:w-80 h-64 md:h-auto bg-muted shrink-0 relative overflow-hidden">
                      {item.safe_photo_url ? (
                        <img src={item.safe_photo_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">📦</div>
                      )}
                      <div className="absolute top-4 left-4">
                         <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-[9px] py-1 px-3">
                            {item.location_zone}
                         </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="flex-grow p-8 flex flex-col justify-between text-left">
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category} recovered</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{item.item_name}</h3>
                          </div>
                          <Badge variant={tier.variant} className="py-2 px-5 text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm shrink-0 w-fit">
                            <i className={`fa-solid ${tier.icon}`}></i>
                            {tier.label} ({Math.round(similarity_score * 100)}%)
                          </Badge>
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
                          <span className="text-[10px] font-bold uppercase tracking-widest">Logged: {new Date(item.found_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
