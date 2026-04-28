import React from 'react';
import { Search } from 'lucide-react';
import ZoneSelectorStep from '../../../../components/ReportFlow/ZoneSelectorStep';

const Step3Location = ({ form, setForm, onNext }) => {
  const handleSkip = () => {
    setForm({ ...form, location: 'Legacy Intake - No Location Record', zone_id: null });
    if (onNext) onNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-medium">Map item to a campus zone.</p>
        <button onClick={handleSkip} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider">
          Skip
        </button>
      </div>
      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3">
        <ZoneSelectorStep stepLabel="" title="" description="" formData={form} setFormData={setForm} onNext={onNext} hideHeader={true} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Specific Area</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
          <input type="text" placeholder="e.g. Near the main elevator..." className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 text-xs font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
      </div>
    </div>
  );
};

export default Step3Location;
