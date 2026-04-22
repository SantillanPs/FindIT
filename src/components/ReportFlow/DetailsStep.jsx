import React from 'react';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';

const DetailsStep = ({ 
  title, 
  description, 
  value, 
  titleValue,
  onTitleChange,
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
          {children}

          <div className="space-y-6">
            <div className="flex items-center gap-4 ml-6">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">1</div>
              </div>
              <label 
                htmlFor="item-title"
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic"
              >
                Item Name / Title
              </label>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <input 
                  id="item-title"
                  type="text"
                  placeholder="Give it a simple name (e.g. Blue Hydro Flask)"
                  className="relative w-full bg-slate-900/50 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-6 text-xl font-black text-white focus:border-uni-500 transition-all outline-none placeholder:text-slate-700 italic uppercase"
                  value={titleValue}
                  onChange={(e) => onTitleChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 ml-6">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">2</div>
              </div>
              <label 
                htmlFor="item-description"
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic"
              >
                The Story (Review & Adjust)
              </label>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-uni-600/30 to-cyan-600/30 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <textarea 
                  id="item-description"
                  name="description"
                  rows="6"
                  placeholder="This is the simple story we've created. You can adjust it if you like!"
                  className="relative w-full bg-slate-900/50 backdrop-blur-xl border-2 border-white/10 rounded-[2.5rem] p-10 text-lg font-bold text-white focus:border-uni-500 transition-all outline-none placeholder:text-slate-700 resize-none leading-relaxed shadow-2xl"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-center gap-4 ml-6">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-uni-500 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">✨</div>
              </div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Parsed Attributes</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Category</label>
                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-xs font-bold text-white uppercase tracking-tight">
                  {category}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Brand</label>
                <input 
                  type="text"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-uni-500 transition-all outline-none"
                  value={attributes.brand || ''}
                  placeholder="Brand"
                  onChange={(e) => onAttributeChange('brand', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Model</label>
                <input 
                  type="text"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-uni-500 transition-all outline-none"
                  value={attributes.model || ''}
                  placeholder="Model"
                  onChange={(e) => onAttributeChange('model', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Primary Color</label>
                <input 
                  type="text"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-uni-500 transition-all outline-none"
                  value={attributes.color || ''}
                  placeholder="Color"
                  onChange={(e) => onAttributeChange('color', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={onNext} 
              className="w-full relative group overflow-hidden bg-white text-black py-7 rounded-[2.2rem] font-black text-sm uppercase tracking-[0.5em] transition-all hover:bg-clear border border-black/5 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-uni-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-4 group-hover:text-white transition-colors">
                Looks Correct
                <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
              </span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default DetailsStep;
