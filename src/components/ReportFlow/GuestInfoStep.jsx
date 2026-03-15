import React from 'react';

const GuestInfoStep = ({ 
  firstName, 
  lastName, 
  email,
  contactInfo,
  onChange, 
  onNext, 
  stepLabel 
}) => {
  const isComplete = firstName && lastName && email;

  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">
          {stepLabel}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">
          Contact Details
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
          Help us reach you if your item is found.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 text-left">First Name</label>
            <input 
              type="text"
              placeholder="Juan"
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-xl"
              value={firstName}
              onChange={(e) => onChange({ guest_first_name: e.target.value })}
            />
          </div>
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 text-left">Last Name</label>
            <input 
              type="text"
              placeholder="Cruz"
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-xl"
              value={lastName}
              onChange={(e) => onChange({ guest_last_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group">
             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 text-left">Email Address</label>
             <input 
              type="email"
              placeholder="juan.cruz@example.com"
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-xl font-black text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-xl"
              value={email}
              onChange={(e) => onChange({ guest_email: e.target.value })}
            />
          </div>

          <div className="relative group">
             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 text-left italic text-uni-400">How can we contact you? (Optional)</label>
             <textarea 
              placeholder="e.g. FB: juan.cruz.12 / Phone: 09123456789"
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-[15px] font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-xl min-h-[82px] max-h-[82px] resize-none"
              value={contactInfo}
              onChange={(e) => onChange({ contact_info: e.target.value })}
            />
          </div>
        </div>
        
        <button 
          onClick={onNext} 
          disabled={!isComplete}
          className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all shadow-2xl shadow-uni-600/30 active:scale-95 mt-4"
        >
          Review Summary →
        </button>
      </div>
    </div>
  );
};

export default GuestInfoStep;
