import React from 'react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const AssetVault = () => {
  return (
    <div className="relative min-h-[600px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-10 blur-lg pointer-events-none select-none"
      >
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-header">Asset Vault</h1>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Institutional Proof of Ownership</p>
          </div>
          <button
            disabled
            className="bg-slate-800/20 text-slate-500 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <i className="fa-solid fa-plus"></i>
            Register New Asset
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 glass-panel border border-white/5 rounded-2xl flex items-center justify-center">
               <i className="fa-solid fa-box-archive text-4xl text-slate-800"></i>
            </div>
          ))}
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
                🛡️
              </div>
              <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Asset Vault <span className="text-brand-gold not-italic">Under Maintenance</span></h2>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    We are upgrading our institutional asset verification system. Your vaulted items remain secure and will be accessible again soon.
                  </p>
              </div>
              <div className="pt-8 border-t border-white/5">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">System Upgrade in Progress</span>
                </div>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

const AssetCard = ({ asset, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="app-card overflow-hidden flex flex-col group border border-border-main hover:border-uni-500/50 transition-all bg-bg-surface rounded-2xl"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900/50">
        {asset.photo_url ? (
          <img src={asset.photo_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={asset.model_name} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-box-archive text-4xl text-slate-800"></i>
            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">No Visual Evidence</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5 text-[8px] font-bold text-white uppercase tracking-widest">
            {asset.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-header">{asset.brand} {asset.model_name}</h4>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                 {asset.serial_number ? `SN: ${asset.serial_number}` : 'Identity: Generic'}
               </span>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all flex items-center justify-center flex-shrink-0 border border-red-500/10"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-border-main/50 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Registration Date</span>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                {new Date(asset.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Verified Vault</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssetVault;
