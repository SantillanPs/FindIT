import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  title = "Registry Synchronized", 
  message = "No records found in this sector.",
  actionLabel,
  actionLink,
  compact = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`app-card overflow-hidden bg-slate-950/20 border-brand-border/40 relative group ${compact ? 'p-8' : 'p-20'}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"></div>
      <div className={`flex flex-col items-center text-center ${compact ? 'gap-4' : 'gap-6'}`}>
        {!compact && (
          <motion.div 
            animate={{ 
              scale: [0.95, 1, 0.95],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-32 h-32 mb-4 relative"
          >
            <img src="/empty_registry_illustration.png" alt="Registry Audit" className="w-full h-full object-contain grayscale" />
          </motion.div>
        )}
        
        <div className="space-y-2">
          <p className={`font-black text-brand-primary uppercase tracking-[0.3em] ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
            System Scan Complete
          </p>
          <h3 className={`font-black text-white uppercase tracking-tight ${compact ? 'text-sm' : 'text-xl'}`}>
            {title}
          </h3>
          <p className={`text-slate-600 font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
            {message}
          </p>
        </div>

        {(actionLabel && actionLink) && (
          <motion.div whileTap={{ scale: 0.98 }} className="pt-4">
            <Link to={actionLink} className="btn-secondary py-2 px-6 text-[9px] font-black uppercase tracking-widest">
              {actionLabel}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
