import React from 'react';
import { motion } from 'framer-motion';

const LocationModeStep = ({ 
  stepLabel, 
  title, 
  description, 
  value, 
  onChange, 
  onNext 
}) => {
  const modes = [
    {
      id: 'certain',
      title: 'I know exactly where',
      description: 'Choose this if you can pinpoint a specific building or room.',
      icon: 'fa-location-crosshairs',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/5',
      border: 'border-emerald-400/20'
    },
    {
      id: 'trace',
      title: 'Trace my steps',
      description: 'Choose this if you visited multiple areas and want to narrow it down.',
      icon: 'fa-shoe-prints',
      color: 'text-blue-400',
      bg: 'bg-blue-400/5',
      border: 'border-blue-400/20'
    }
  ];

  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full px-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              onChange(mode.id);
              setTimeout(onNext, 400);
            }}
            className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden text-left ${
              value === mode.id 
                ? 'bg-uni-500 border-uni-500 text-white' 
                : `bg-white/5 border-white/5 hover:border-white/20 hover:scale-[1.02] active:scale-95`
            }`}
          >
            <div className={`p-6 rounded-3xl ${value === mode.id ? 'bg-white/20' : mode.bg} text-4xl transition-transform group-hover:scale-110 mb-2`}>
              <i className={`fa-solid ${mode.icon} ${value === mode.id ? 'text-white' : mode.color} ${mode.id === 'trace' ? 'transform -rotate-90' : ''}`}></i>
            </div>
            
            <div className="text-center space-y-2">
              <span className="text-[14px] font-black uppercase tracking-widest block">{mode.title}</span>
              <p className={`text-[10px] font-bold uppercase tracking-tight leading-relaxed ${value === mode.id ? 'text-white/60' : 'text-slate-500'}`}>
                {mode.description}
              </p>
            </div>

            {value === mode.id && (
              <motion.div 
                layoutId="active-mode"
                className="absolute top-6 right-6 text-white"
              >
                <i className="fa-solid fa-circle-check text-xl"></i>
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationModeStep;
