import React from 'react';
import ImageUpload from '../ImageUpload';

const ImageStep = ({ 
  title, 
  description, 
  value, 
  onUpload, 
  secondaryPhotos = [],
  onSecondaryUpload,
  onNext, 
  onManualEntry,
  stepLabel,
  optional = true,
  isSubmitting = false
}) => {
  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
            {description} {optional && <span>(This step is <span className="text-uni-400">optional</span>)</span>}
         </p>
      </div>
      
      <div className="max-w-xl mx-auto w-full space-y-8">
          <div className="p-8 glass-panel rounded-[3.5rem] border border-white/5">
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Photo</p>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                    Upload a photo of <span className="text-uni-400">your item</span> — from your gallery, a screenshot, or even a picture of a similar one. This will be shown on the public listing.
                  </p>
                </div>
                <ImageUpload 
                    value={value}
                    onUploadSuccess={onUpload}
                />
              </div>

              {value && (
                <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-end px-2">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic mb-1">Forensic Angles (Optional)</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Add labels, serial numbers, or unique marks</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-600">{secondaryPhotos.length}/3</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="aspect-square">
                        <ImageUpload 
                          value={secondaryPhotos[idx]}
                          onUploadSuccess={(url) => onSecondaryUpload(url, idx)}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

               {!optional && !value && (
                <div className="mt-8 p-6 bg-uni-500/5 border border-uni-400/30 rounded-3xl text-left">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic flex items-center gap-3 mb-2">
                        <i className="fa-solid fa-circle-info"></i>
                        Mandatory Photo
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                        Since you have the item, a real photo is required. This helps verify the report and ensures we find the owner faster.
                    </p>
                </div>
              )}
          </div>
          
          <div className="space-y-4">
            <button 
                onClick={onNext} 
                disabled={(!optional && !value) || isSubmitting}
                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] transition-all border border-black/5 active:scale-95 flex items-center justify-center gap-4 ${
                ((!optional && !value) || isSubmitting)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-uni-600 text-white hover:bg-white hover:text-black'
                }`}
            >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Submitting Report...
                  </>
                ) : value ? (
                  'Submit Report →'
                ) : (
                  optional ? 'Skip & Submit →' : 'Upload Required →'
                )}
            </button>
          </div>
      </div>
    </div>
  );
};


export default ImageStep;

