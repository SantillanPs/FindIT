import React from 'react';

const DateTimeStep = ({ 
  label, 
  title, 
  description, 
  value, 
  onChange, 
  onNext, 
  stepLabel 
}) => {
  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-10">
          <div className="p-10 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col gap-6">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center">Date & Time</label>
             <input 
              type="datetime-local"
              className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white focus:border-uni-500 outline-none"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            onClick={onNext} 
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl"
          >
            Next Step →
          </button>
      </div>
    </div>
  );
};

export default DateTimeStep;
