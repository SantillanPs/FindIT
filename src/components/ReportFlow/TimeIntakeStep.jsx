import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const TimeIntakeStep = ({ value, onChange, onNext, stepLabel }) => {
  const getMinDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1); // Allow up to 1 month back
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Split value into date and time
  const [date, time] = value ? value.split('T') : ['', ''];

  const handleDateChange = (newDate) => {
    onChange(`${newDate}T${time || '12:00'}`);
  };

  const handleTimeChange = (newTime) => {
    onChange(`${date || getMaxDate()}T${newTime}`);
  };

  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">
          {stepLabel}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">
          When did it <span className="text-blue-400">happen?</span>
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
          Help us narrow down the search by telling us when you last saw it.
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8 text-left">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <Calendar size={12} />
              Approximate Date
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <input
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="relative w-full h-16 bg-slate-900/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl px-6 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <Clock size={12} />
              Approximate Time
            </label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="relative w-full h-16 bg-slate-900/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl px-6 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!date}
          className="w-full relative group overflow-hidden bg-white text-black py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.5em] transition-all hover:bg-clear border border-black/5 active:scale-[0.98] disabled:opacity-30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
          <span className="relative z-10 flex items-center justify-center gap-4 group-hover:text-white transition-colors">
            Next Step
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default TimeIntakeStep;
