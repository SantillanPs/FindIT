import React from 'react';
import { User, ShieldCheck, Calendar, Clock } from 'lucide-react';

const Step4Review = ({ form, setForm }) => {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">4. Audit & Finalization</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">Complete the paper-trail bridge with reporter and staff info.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reporter Identity (Optional)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                placeholder="Physical form name..."
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none transition-all"
                value={form.reporter_name}
                onChange={e => setForm({...form, reporter_name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assisted By (Staff - Optional)</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-uni-400" size={16} />
              <input 
                type="text" 
                placeholder="Your name / ID..."
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none transition-all"
                value={form.assisted_by}
                onChange={e => setForm({...form, assisted_by: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Report Timing</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-uni-400" size={16} />
              <input 
                required
                type="date" 
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none transition-all [color-scheme:dark]"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Time (Optional)</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                placeholder="e.g. 2:30 PM"
                className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none transition-all"
                value={form.time}
                onChange={e => setForm({...form, time: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Review;
