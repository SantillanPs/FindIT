import React from 'react';
import HallOfFame from './HallOfFame';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';

const DetailsStep = ({ 
  title, 
  description, 
  value, 
  onChange, 
  onNext, 
  placeholder, 
  stepLabel,
  category,
  attributes = {},
  onAttributeChange,
  children
}) => {
  const fields = ITEM_ATTRIBUTES[category] || [];

  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>
      <div className="space-y-8 max-w-3xl mx-auto w-full text-left">
          
          {fields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white/5 p-8 rounded-[2rem] border border-white/5">
              {fields.map(field => (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">{field}</label>
                  
                  {field === 'Color' || field === 'Primary Color' || field === 'Frame Color' ? (
                    <select
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-uni-500 transition-all outline-none appearance-none"
                      value={attributes[field] || ''}
                      onChange={(e) => onAttributeChange(field, e.target.value)}
                    >
                      <option value="">Select Color</option>
                      {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : field === 'Condition' ? (
                    <select
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-uni-500 transition-all outline-none appearance-none"
                      value={attributes[field] || ''}
                      onChange={(e) => onAttributeChange(field, e.target.value)}
                    >
                      <option value="">Select Condition</option>
                      {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder={`Enter ${field.toLowerCase()}`}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-uni-500 transition-all outline-none placeholder:text-slate-700"
                      value={attributes[field] || ''}
                      onChange={(e) => onAttributeChange(field, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Unique Nuance / Extra Notes</label>
            <textarea 
                rows="4"
                placeholder="Any unique stickers, scratches, or details that help distinguish it?"
                className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-lg font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 resize-none leading-relaxed"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
          </div>
          
          {children}
          
          <HallOfFame category={category} />

          <button 
            onClick={onNext} 
            disabled={!value || value.length < 5}
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-white hover:text-black transition-all border border-black/5 active:scale-95"
          >
            Next Step →
          </button>
      </div>
    </div>
  );
};

export default DetailsStep;
