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
          <div className="flex items-center gap-6 bg-white/5 p-4 rounded-[2rem] border border-white/5 shadow-2xl">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                <p className="text-sm font-black text-white uppercase italic">Step {step} of {totalSteps}</p>
             </div>
             <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-uni-500/20"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="125.66"
                    initial={{ strokeDashoffset: 125.66 }}
                    animate={{ strokeDashoffset: 125.66 - (125.66 * (step / totalSteps)) }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    strokeLinecap="round"
                    className="text-uni-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white italic">
                  {Math.round((step / totalSteps) * 100)}%
                </div>
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
