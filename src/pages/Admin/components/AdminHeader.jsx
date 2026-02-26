import React from 'react';

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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
          {greeting}.
        </h1>
      </div>

      <div className="flex gap-4">
        {[
          { label: 'Total Lost', value: stats.total_lost, icon: 'fa-file-circle-question', color: 'amber' },
          { label: 'In Custody', value: stats.total_found, icon: 'fa-vault', color: 'uni' },
          { label: 'Claims', value: stats.total_claims, icon: 'fa-stamp', color: 'green' }
        ].map((stat, i) => {
          const classes = getColorClasses(stat.color);
          return (
            <div key={i} className="bg-white/5 border border-white/5 rounded-3xl px-8 py-5 flex items-center gap-5 backdrop-blur-md">
               <div className={`w-12 h-12 rounded-2xl ${classes.bg} flex items-center justify-center ${classes.text} text-xl border ${classes.border} shadow-inner`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white italic leading-none">{stat.value}</p>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHeader;
