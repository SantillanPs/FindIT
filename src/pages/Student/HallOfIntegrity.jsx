import React from 'react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const HallOfIntegrity = () => {
  return (
    <div className="relative min-h-[600px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 blur-md pointer-events-none select-none"
      >
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">
            Hall of <span className="gradient-text not-italic">Integrity</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
            Recognizing the heroes of our community. Join the ranks of those who prioritize institutional trust.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-8">
                  <div className="space-y-2">
                      <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest">Select Ranking</p>
                      <div className="flex flex-col gap-2">
                          <button 
                              disabled
                              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-between group bg-white/5 text-slate-500`}
                          >
                              <span className="flex items-center gap-3">
                                  <i className="fa-solid fa-user-graduate"></i>
                                  Individual Keepers
                              </span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <div className="md:w-2/3 glass-panel p-8 rounded-[2.5rem] border border-white/5 min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4 opacity-20">
                  <div className="text-6xl">🏆</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Honor Registry Offline</p>
              </div>
          </div>
        </div>
      </motion.div>

      {/* Development Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm rounded-[3rem]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-12 max-w-xl w-full text-center border-brand-gold/30 bg-brand-gold/5 space-y-8"
          >
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center text-4xl mx-auto border border-brand-gold/20 animate-pulse">
                🏗️
              </div>
              <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Currently Under <span className="text-brand-gold not-italic">Construction</span></h2>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    The Hall of Integrity is undergoing a major architecture update to better recognize community contributions. 
                  </p>
              </div>
              <div className="pt-8 border-t border-white/5">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Development Phase Active</span>
                </div>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default HallOfIntegrity;
