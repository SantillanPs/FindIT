import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const LostReportStatus = () => {
  const { trackingId } = useParams();
  const [report, setReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [trackingId]);

  const fetchData = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('lost_items')
        .select('*')
        .eq('tracking_id', trackingId)
        .single();
      
      if (reportError) throw reportError;
      setReport(reportData);
      
      // Fetch matches using pgvector RPC if embedding exists
      if (reportData.embedding) {
          const { data: matchData, error: matchError } = await supabase
            .rpc('match_found_items', {
                query_embedding: reportData.embedding,
                match_threshold: 0.3, // Lower threshold for broader results in tracking
                match_count: 5
            });
          
          if (matchError) throw matchError;
          
          // Map to match the expected UI structure
          setMatches((matchData || []).map(m => ({
              item: m,
              similarity_score: m.similarity
          })));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Invalid tracking link or report no longer exists.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <i className="fa-solid fa-satellite-dish text-4xl text-slate-700 opacity-20"></i>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">{error}</h2>
        <Link to="/" className="text-[10px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors">
            Return to Registry
        </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
           <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em]">Lost Item Report Management</p>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">"Searching for your {report.title}"</h1>
        </div>
        <div className="px-6 py-3 bg-uni-500/10 border border-uni-500/20 rounded-2xl">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
           <p className="text-sm font-black text-white uppercase italic">{report.status}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Details Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/10 space-y-8">
                <div className="space-y-4">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Original Report</span>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</p>
                        <p className="text-sm font-bold text-white leading-relaxed">{report.description}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Seen</p>
                        <p className="text-sm font-bold text-white uppercase">{report.location}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(report.date_lost).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Cancel Report
                    </button>
                </div>
            </div>
        </div>

        {/* Matches Section */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Detection Results</h2>
                <span className="text-[10px] font-black text-uni-400 uppercase tracking-widest bg-uni-500/10 px-3 py-1 rounded-full border border-uni-500/20">
                    {matches.length} Matches Found
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {matches.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-[2.5rem]"
                        >
                            <div className="text-4xl opacity-20">🛰️</div>
                            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">AI Satellite scanning registry...</p>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">New items are checked every few minutes.</p>
                        </motion.div>
                    ) : (
                        matches.map((match, idx) => (
                            <motion.div 
                                key={match.item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative glass-panel p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-uni-500/30 transition-all flex flex-col md:flex-row gap-6 items-center"
                            >
                                <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                                    📦
                                </div>
                                <div className="flex-grow space-y-2 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{match.item.category}</p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                            match.similarity_score > 0.8 ? 'bg-green-500/20 text-green-400' :
                                            match.similarity_score > 0.6 ? 'bg-uni-500/20 text-uni-400' :
                                            'bg-slate-500/20 text-slate-400'
                                        }`}>
                                            {Math.round(match.similarity_score * 100)}% Match
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed line-clamp-2 uppercase tracking-wide">
                                        {match.item.description}
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                                        Found at {match.item.location}
                                    </p>
                                </div>
                                <Link 
                                    to={`/submit-claim/${match.item.id}`}
                                    className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-uni-400 hover:text-white transition-all shrink-0"
                                >
                                    Claim Item
                                </Link>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LostReportStatus;
