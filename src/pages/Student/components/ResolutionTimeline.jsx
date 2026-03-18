import React from 'react';
import { motion } from 'framer-motion';

const ResolutionTimeline = ({ status, isPickupReady, similarityScore }) => {
  const steps = [
    { id: 'submitted', label: 'Claim Submitted', icon: 'fa-file-import' },
    { id: 'review', label: 'Under Review', icon: 'fa-magnifying-glass' },
    { id: 'verified', label: 'Verification Complete', icon: 'fa-clipboard-check' },
    { id: 'pickup', label: 'Ready for Pickup', icon: 'fa-box-open' },
  ];

  const getStatusIndex = () => {
    if (status === 'rejected') return -1;
    if (isPickupReady) return 3;
    if (status === 'approved') return 2;
    // If pending but has a high similarity score, we can highlight 'review' as active
    return 1;
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="py-8 px-2 md:px-6">
      <div className="relative flex justify-between items-center w-full">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 -z-10"></div>
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-uni-500 -translate-y-1/2 -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>

        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="relative flex flex-col items-center gap-3">
              <motion.div 
                initial={false}
                animate={{ 
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? 'rgba(var(--color-uni-500), 1)' : 'rgba(15, 23, 42, 1)',
                  borderColor: isActive ? 'rgba(var(--color-uni-500), 0.5)' : 'rgba(255, 255, 255, 0.1)'
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-sm md:text-base border-2 shadow-2xl transition-colors z-10 ${isActive ? 'text-white' : 'text-slate-600'}`}
              >
                <i className={`fa-solid ${step.icon}`}></i>
                
                {isActive && (
                   <motion.div 
                     layoutId="glow"
                     className="absolute inset-0 rounded-2xl bg-uni-500/20 blur-xl -z-10"
                   />
                )}
              </motion.div>
              
              <div className="text-center space-y-1 min-w-[80px]">
                <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {step.label}
                </p>
                {index === 2 && similarityScore > 0.8 && status === 'pending' && (
                  <p className="text-[7px] font-bold text-uni-400 uppercase tracking-tighter animate-pulse">High AI Match</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {status === 'rejected' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
        >
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
            <i className="fa-solid fa-xmark"></i>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Resolution Failed</p>
            <p className="text-[9px] font-bold text-red-500/70 uppercase">This claim was not approved. Check admin notes for details.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResolutionTimeline;
