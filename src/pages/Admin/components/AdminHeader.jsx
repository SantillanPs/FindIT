import React from 'react';

/**
 * AdminHeader - Premium Professional (Pro Max)
 * - Clean, high-impact greeting.
 * - Sleek, breathable stats cards.
 * - Professional typography (no aggressive italics).
 */
const AdminHeader = ({ stats, greeting }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'uni': return { bg: 'bg-uni-500/10', text: 'text-uni-400', border: 'border-uni-500/20' };
      case 'amber': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
      case 'green': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
          {greeting}.
        </h1>
        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
          Operations Dashboard // Control Center
        </p>
      </div>

      <div className="flex flex-wrap gap-4 md:gap-6">
        {[
          { label: 'Lost Reports', value: stats.total_lost, icon: 'fa-file-circle-question', color: 'amber' },
          { label: 'In Inventory', value: stats.total_found, icon: 'fa-vault', color: 'uni' },
          { label: 'Total Claims', value: stats.total_claims, icon: 'fa-stamp', color: 'green' }
        ].map((stat, i) => {
          const classes = getColorClasses(stat.color);
          return (
            <div key={i} className="flex-grow md:flex-grow-0 bg-slate-900/40 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] px-6 md:px-8 py-5 md:py-6 flex items-center gap-5 backdrop-blur-3xl shadow-2xl hover:bg-slate-900/60 transition-all duration-300">
               <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${classes.bg} flex items-center justify-center ${classes.text} text-xl border ${classes.border} shadow-inner`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
               </div>
               <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-white leading-none">{stat.value}</p>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHeader;
