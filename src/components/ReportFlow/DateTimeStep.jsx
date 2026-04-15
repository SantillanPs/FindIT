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
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-10">
          <div className="p-10 glass-panel rounded-[3.5rem] border border-white/5 flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label 
                    htmlFor="report-date"
                    className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4"
                  >
                    Select Date
                  </label>
                  <input 
                    id="report-date"
                    name="date"
                    type="date"
                    className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white focus:border-uni-500 outline-none transition-all uppercase tracking-widest"
                    value={value.split('T')[0] || ''}
                    onChange={(e) => {
                      const time = value.split('T')[1] || '12:00';
                      onChange(`${e.target.value}T${time}`);
                    }}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label 
                    htmlFor="report-time"
                    className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4"
                  >
                    Select Time
                  </label>
                  <input 
                    id="report-time"
                    name="time"
                    type="time"
                    className="w-full bg-slate-950/50 border-2 border-white/10 rounded-2xl p-6 text-xl font-black text-white focus:border-uni-500 outline-none transition-all uppercase tracking-widest"
                    value={value.split('T')[1] || ''}
                    onChange={(e) => {
                      const date = value.split('T')[0] || new Date().toISOString().split('T')[0];
                      onChange(`${date}T${e.target.value}`);
                    }}
                  />
                </div>
             </div>
          </div>
          <button 
            onClick={onNext} 
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all border border-black/5 active:scale-95"
          >
            Next Step →
          </button>
      </div>
    </div>
  );
};

export default DateTimeStep;
