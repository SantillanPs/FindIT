import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UserCheck, ShieldCheck, Info, Camera } from 'lucide-react';
import ImageUpload from '../../../../components/ImageUpload';

const Step1Visuals = ({ form, setForm, isAnalysing }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">1. Visual Evidence</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">Capture multi-angle photos for AI attribute extraction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Primary Photo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Main View</span>
            <span className="text-[8px] font-black text-uni-400 italic">REQUIRED</span>
          </div>
          <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-2 h-56 md:h-48 flex items-center justify-center overflow-hidden group">
            {/* Forensic Scanning Overlay */}
            {isAnalysing && (
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-uni-500/10 animate-pulse" />
                <motion.div 
                  initial={{ y: -100 }}
                  animate={{ y: 200 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-full h-1 bg-gradient-to-r from-transparent via-uni-400 to-transparent shadow-[0_0_15px_rgba(var(--uni-rgb),0.8)]"
                />
                <div className="mt-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-uni-500/30 flex items-center gap-2">
                  <Sparkles className="text-uni-400 animate-spin-slow" size={10} />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Neural Scan...</span>
                </div>
              </div>
            )}

            {/* Identification Tag */}
            {form.identified_name && !isAnalysing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 right-4 z-20 pointer-events-none"
              >
                <div className={`px-3 py-2 ${form.identified_user_id ? 'bg-uni-500/90' : 'bg-slate-800/90'} backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center justify-between transition-colors`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {form.identified_user_id ? <UserCheck className="text-white shrink-0" size={14} /> : <Sparkles className="text-uni-400 shrink-0" size={12} />}
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-white uppercase truncate">{form.identified_name}</p>
                      <p className="text-[8px] font-bold text-white/70 uppercase tracking-tighter">
                        {form.identified_user_id ? 'Registry Matched' : 'AI Identified'}
                      </p>
                    </div>
                  </div>
                  {form.identified_user_id ? <ShieldCheck className="text-white" size={16} /> : <Info className="text-slate-400" size={14} />}
                </div>
              </motion.div>
            )}

            <ImageUpload 
              value={form.photo_url}
              onUploadSuccess={url => setForm({...form, photo_url: url})}
              description="Front view"
            />
          </div>
        </div>

        {/* Secondary Photos (Stacked on mobile) */}
        <div className="grid grid-cols-2 md:contents gap-4">
          {/* Secondary 1 */}
          <div className="space-y-3 opacity-80 md:opacity-100">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alt View</span>
              <span className="text-[8px] font-bold text-slate-700 italic uppercase">Optional</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 h-40 md:h-48 flex items-center justify-center">
              <ImageUpload 
                value={form.secondary_photos[0]}
                onUploadSuccess={url => {
                  const newPhotos = [...form.secondary_photos];
                  newPhotos[0] = url;
                  setForm({...form, secondary_photos: newPhotos});
                }}
                description="Back view"
              />
            </div>
          </div>

          {/* Secondary 2 */}
          <div className="space-y-3 opacity-80 md:opacity-100">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Detail</span>
              <span className="text-[8px] font-bold text-slate-700 italic uppercase">Optional</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 h-40 md:h-48 flex items-center justify-center">
              <ImageUpload 
                value={form.secondary_photos[1]}
                onUploadSuccess={url => {
                  const newPhotos = [...form.secondary_photos];
                  newPhotos[1] = url;
                  setForm({...form, secondary_photos: newPhotos});
                }}
                description="Label / ID"
              />
            </div>
          </div>
        </div>
      </div>

      {!form.photo_url && (
        <div className="p-4 bg-uni-500/5 border border-uni-500/10 rounded-2xl flex gap-4 items-center">
          <Camera className="text-uni-400 shrink-0" size={18} />
          <p className="text-[10px] text-slate-400 font-medium italic">Upload a primary photo to unlock the next forensic step.</p>
        </div>
      )}
    </div>
  );
};

export default Step1Visuals;
