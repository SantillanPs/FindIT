import React from 'react';
import ImageUpload from '../ImageUpload';
import { Badge } from "@/components/ui/badge";

const MultiImageStep = ({ 
  title, 
  description, 
  primaryImage, 
  onPrimaryUpload, 
  secondaryPhotos, 
  onSecondaryUpload,
  onNext, 
  onManualEntry,
  stepLabel,
  optional = false 
}) => {
  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
         <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
         <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
         <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
           {description}
         </p>
      </div>
      
      <div className="max-w-4xl mx-auto w-full space-y-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slot 1: Primary (Front) */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">1. Front View</span>
                      <Badge className="bg-uni-500 text-white text-[9px] uppercase">Required</Badge>
                  </div>
                  <div className="glass-panel rounded-[2.5rem] border border-white/5 p-4 overflow-hidden flex items-center justify-center min-h-[220px]">
                      <ImageUpload 
                          value={primaryImage}
                          onUploadSuccess={onPrimaryUpload}
                          description="Capture the main view"
                      />
                  </div>
              </div>

              {/* Slot 2: Back/Secondary */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">2. Back View</span>
                      <Badge variant="outline" className="border-white/10 text-slate-500 text-[9px] uppercase">Optional</Badge>
                  </div>
                  <div className="glass-panel rounded-[2.5rem] border border-white/5 p-4 overflow-hidden flex items-center justify-center min-h-[220px]">
                      <ImageUpload 
                          value={secondaryPhotos[0]}
                          onUploadSuccess={(url) => onSecondaryUpload(0, url)}
                          description="Capture the Brand/Details"
                      />
                  </div>
              </div>

              {/* Slot 3: Detail/Text */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">3. Precision View</span>
                      <Badge variant="outline" className="border-white/10 text-slate-500 text-[9px] uppercase">Optional</Badge>
                  </div>
                  <div className="glass-panel rounded-[2.5rem] border border-white/5 p-4 overflow-hidden flex items-center justify-center min-h-[220px]">
                      <ImageUpload 
                          value={secondaryPhotos[1]}
                          onUploadSuccess={(url) => onSecondaryUpload(1, url)}
                          description="Capture any ID/Serial"
                      />
                  </div>
              </div>
          </div>

          {!primaryImage && (
              <div className="p-6 bg-uni-500/5 border border-uni-400/30 rounded-3xl text-left max-w-xl mx-auto">
                  <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic flex items-center gap-3 mb-2">
                      <i className="fa-solid fa-circle-info"></i>
                      Multi-Angle Advantage
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      Capturing the <span className="text-uni-400">Back</span> or <span className="text-uni-400">Labels</span> helps the AI identify the brand and model instantly.
                  </p>
              </div>
          )}

          <div className="max-w-xl mx-auto w-full space-y-4">
            <button 
                onClick={onNext} 
                disabled={!primaryImage}
                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] transition-all border border-black/5 active:scale-95 flex items-center justify-center gap-4 ${
                (!primaryImage) 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-uni-600 text-white hover:bg-white hover:text-black shadow-lg shadow-uni-500/20'
                }`}
            >
                {primaryImage ? 'Proceed to Analysis →' : 'Primary Photo Required'}
            </button>

          </div>
      </div>
    </div>
  );
};

export default MultiImageStep;
