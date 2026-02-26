import React from 'react';

const SimpleInputStep = ({ 
  title, 
  description, 
  value, 
  onChange, 
  onNext, 
  placeholder, 
  stepLabel, 
  icon,
  buttonText = "Next Step →"
}) => {
  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-10 group">
          <div className="relative">
             {icon && <i className={`fa-solid ${icon} absolute left-8 top-1/2 -translate-y-1/2 text-uni-400 text-2xl opacity-60`}></i>}
             <input 
              type="text"
              placeholder={placeholder}
              className={`w-full bg-white/5 border-2 border-white/10 rounded-[3.5rem] p-10 ${icon ? 'pl-20' : 'px-10'} text-2xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-2xl`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          </div>
          
          <button 
            onClick={onNext} 
            disabled={!value}
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95"
          >
            {buttonText}
          </button>
      </div>
    </div>
  );
};

export default SimpleInputStep;
