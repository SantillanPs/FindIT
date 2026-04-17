import React from 'react';
import { motion } from 'framer-motion';

const AchievementBadge = ({ points, className = "" }) => {
  const getBadgeConfig = (pts) => {
    if (pts >= 51) return { 
      label: 'Gold Tier', 
      icon: '🏆', 
      color: 'text-amber-400', 
      bg: 'bg-amber-400/10', 
      border: 'border-amber-400/20',
      glow: 'border-amber-400/20',
      rank: 'Institutional Guardian'
    };
    if (pts >= 11) return { 
      label: 'Silver Tier', 
      icon: '🛡️', 
      color: 'text-slate-300', 
      bg: 'bg-slate-300/10', 
      border: 'border-slate-300/20',
      glow: 'border-slate-300/20',
      rank: 'Trusted Resident'
    };
    if (pts >= 1) return { 
      label: 'Bronze Tier', 
      icon: '🎗️', 
      color: 'text-orange-400', 
      bg: 'bg-orange-400/10', 
      border: 'border-orange-400/20',
      glow: 'border-orange-400/20',
      rank: 'Rising Contributor'
    };
    return { 
      label: 'Recruit Tier', 
      icon: '✨', 
      color: 'text-slate-500', 
      bg: 'bg-slate-500/5', 
      border: 'border-slate-500/10',
      glow: 'border-transparent',
      rank: 'Member Candidate'
    };
  };

  const config = getBadgeConfig(points);

  if (!config) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${config.bg} ${config.border} ${className} ${config.glow}`}
    >
      <span className="text-xl">{config.icon}</span>
      <div className="text-left">
        <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${config.color} leading-none mb-1`}>
          {config.rank}
        </p>
        <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
          {config.label}
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
