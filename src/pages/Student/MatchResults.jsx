import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

const MatchResults = () => {
  const { reportId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [reportId]);

  const fetchMatches = async () => {
    try {
      const response = await apiClient.get(`/lost/${reportId}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      <p className="mt-6 text-slate-500 font-black uppercase tracking-widest text-[9px]">Analyzing Registry for matches...</p>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <motion.div whileHover={{ x: -4 }} className="inline-block">
          <Link to="/student" className="text-[10px] font-black text-uni-400 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-colors mb-2 italic">
            ← Dashboard
          </Link>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight">We found some matches!</h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Our system identified these found items as potential matches for your lost report. Review them below.
        </p>
      </motion.header>

      <AnimatePresence>
        {matches.length === 0 ? (
          <motion.div variants={itemVariants} className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 bg-white/5">
             <div className="text-5xl opacity-20 mb-6">🔍</div>
             <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No matches found yet</h3>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                We'll notify you as soon as a matching item is reported in our system.
             </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {matches.map(({ item, similarity_score }) => (
              <motion.div 
                key={item.id} 
                variants={itemVariants}
                className="glass-panel group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-uni-500/30 transition-all flex flex-col md:flex-row text-left"
              >
                <div className="w-full md:w-72 h-48 sm:h-56 md:h-auto bg-slate-900 shrink-0 relative overflow-hidden">
                  {item.safe_photo_url ? (
                    <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl md:text-6xl opacity-10">📦</div>
                  )}
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[8px] md:text-[9px] font-black text-uni-400 rounded-full border border-white/10 uppercase tracking-widest">
                        {item.location_zone}
                     </span>
                  </div>
                </div>
                
                <div className="flex-grow p-5 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="text-[9px] md:text-[10px] font-black text-uni-400 uppercase tracking-widest mb-1">{item.category} recovered</div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">{item.item_name}</h3>
                      </div>
                      <div className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest border uppercase ${
                        similarity_score >= 0.8 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-uni-500/10 text-uni-400 border-uni-500/20'
                      }`}>
                        {Math.round(similarity_score * 100)}% Match
                      </div>
                    </div>
                    <p className="text-slate-400 text-[13px] md:text-sm italic leading-relaxed mb-6 md:mb-8 border-l-2 border-white/10 pl-4 md:pl-6 py-1">
                      "{item.description}"
                    </p>
                  </div>
                  
                  <div className="flex flex-row justify-between items-center gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 md:gap-3 text-slate-500">
                      <i className="fa-solid fa-calendar text-[9px] md:text-[10px]"></i>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Found {new Date(item.found_time).toLocaleDateString()}</span>
                    </div>
 
                    <Link 
                      to={`/submit-claim/${item.id}`} 
                      className="bg-uni-600 hover:bg-uni-500 text-white px-6 md:px-10 py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all hover:scale-[1.05]"
                    >
                      Claim
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MatchResults;
