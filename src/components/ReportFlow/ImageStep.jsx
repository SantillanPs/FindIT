import React from 'react';
import ImageUpload from '../ImageUpload';

const ImageStep = ({ 
  title, 
  description, 
  value, 
  onUpload, 
  onNext, 
  stepLabel,
  optional = true 
}) => {
  return (
    <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
           {description} {optional && <span>(This step is <span className="text-uni-400">optional</span>)</span>}
         </p>
      </div>
      
      <div className="max-w-xl mx-auto w-full space-y-10">
          <div className="p-8 glass-panel rounded-[3.5rem] border border-white/5 shadow-2xl">
              <ImageUpload 
                  value={value}
                  onUploadSuccess={onUpload}
              />
              <div className="mt-8 p-6 bg-white/5 border border-white/5 border-dashed rounded-3xl text-left">
                  <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic flex items-center gap-3 mb-2">
                      <i className="fa-solid fa-camera-rotate"></i>
                      Reference Photos
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      If you don't have a photo of your specific item, searching for the exact model or brand online and uploading a screenshot works great too!
                  </p>
              </div>
          </div>
          
          <button 
            onClick={onNext} 
            className="w-full bg-uni-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
          >
            {value ? 'Next Step →' : (optional ? 'Skip & Continue →' : 'Next Step →')}
          </button>
      </div>
    </div>
  );
};

export default ImageStep;
