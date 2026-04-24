import React from 'react';
import { Search } from 'lucide-react';
import ZoneSelectorStep from '../../../../components/ReportFlow/ZoneSelectorStep';

const Step3Location = ({ form, setForm }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">3. Precise Location</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">Map the item to the digital campus zones for smart discovery.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-4">
          <ZoneSelectorStep 
            stepLabel=""
            title=""
            description=""
            formData={form}
            setFormData={setForm}
            onNext={() => {}} // Not used as standalone
            hideHeader={true}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specific Room / Area Hint</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input 
              type="text" 
              placeholder="e.g. Near the main elevator..."
              className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all"
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Location;
