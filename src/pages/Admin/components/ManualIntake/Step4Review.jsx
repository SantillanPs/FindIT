import React from 'react';
import { User, ShieldCheck, Calendar, Clock } from 'lucide-react';

const Step4Review = ({ form, setForm }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Reporter (Optional)</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
            <input type="text" placeholder="Name from form..." className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none transition-all" value={form.reporter_name} onChange={e => setForm({...form, reporter_name: e.target.value})} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Staff (Optional)</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-uni-400" size={13} />
            <input type="text" placeholder="Your name..." className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none transition-all" value={form.assisted_by} onChange={e => setForm({...form, assisted_by: e.target.value})} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-uni-400" size={13} />
            <input required type="date" className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none transition-all [color-scheme:dark]" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Time (Optional)</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
            <input type="text" placeholder="e.g. 2:30 PM" className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none transition-all" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Review;
