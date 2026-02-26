import React from 'react';

const DetailsStep = ({ 
  title, 
  description, 
  value, 
  onChange, 
  onNext, 
  placeholder, 
  stepLabel,
  children
}) => {
  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>
      <div className="space-y-8 max-w-2xl mx-auto w-full text-left">
          <textarea 
            rows="5"
            placeholder={placeholder}
            className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl resize-none leading-relaxed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          
          {children}

          <button 
            onClick={onNext} 
            disabled={!value || value.length < 5}
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95"
          >
            Next Step →
          </button>
      </div>
    </div>
  );
};

export default DetailsStep;
