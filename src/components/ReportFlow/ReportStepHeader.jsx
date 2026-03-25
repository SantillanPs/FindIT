import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportStepHeader = ({ title, label, step, totalSteps, error, icon }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2 text-left">
             <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em] italic flex items-center gap-2">
                {icon && <i className={`fa-solid ${icon}`}></i>}
                {label}
             </p>
             <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">{title}</h1>
          </div>
          <div className="flex flex-col items-end gap-3 min-w-[140px]">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Progress</p>
                <p className="text-sm font-black text-white uppercase italic leading-none">Step {step} of {totalSteps}</p>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="h-full bg-uni-500 shadow-[0_0_10px_rgba(var(--uni-500-rgb),0.5)]"
                />
             </div>
          </div>
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center rounded-3xl flex items-center justify-center gap-4"
          >
             <i className="fa-solid fa-circle-exclamation text-xl"></i>
             {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportStepHeader;
