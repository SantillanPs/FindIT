import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, X, Camera } from 'lucide-react';
import ImageUpload from '../../../../components/ImageUpload';

const Step1Visuals = ({ form, setForm, isAnalysing }) => {
  const hasPhotos = form.photos.length > 0;

  return (
    <div className="space-y-4">
      {hasPhotos ? (
        <>
          {/* Photo Grid — only shows when there are photos */}
          <div className="grid grid-cols-3 gap-2">
            {form.photos.map((photo, index) => (
              <motion.div 
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden h-28 flex items-center justify-center transition-all"
              >
                <img src={photo.url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                
                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-30 pointer-events-none">
                  {photo.is_landing_page && (
                    <span className="flex items-center gap-0.5 px-1.5 py-px bg-uni-500 text-[7px] font-bold text-white uppercase tracking-wider rounded shadow-md">
                      <Eye size={6} /> Main
                    </span>
                  )}
                  {photo.is_ai_scan && (
                    <span className="flex items-center gap-0.5 px-1.5 py-px bg-amber-500 text-[7px] font-bold text-white uppercase tracking-wider rounded shadow-md">
                      <Brain size={6} /> AI
                    </span>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-1.5 pointer-events-none z-40">
                  <div className="flex justify-end pointer-events-auto">
                    <button 
                      onClick={() => {
                        const newPhotos = form.photos.filter((_, i) => i !== index);
                        setForm({ ...form, photos: newPhotos });
                      }}
                      className="w-6 h-6 rounded-md bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="flex justify-center items-center gap-3 p-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-white/10 pointer-events-auto shadow-lg">
                    <button 
                      onClick={() => {
                        const newPhotos = form.photos.map((p, i) => ({ ...p, is_landing_page: i === index }));
                        setForm({ ...form, photos: newPhotos });
                      }}
                      className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                        photo.is_landing_page ? 'bg-uni-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                      title="Set as Main Photo"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        const newPhotos = [...form.photos];
                        newPhotos[index].is_ai_scan = !newPhotos[index].is_ai_scan;
                        setForm({ ...form, photos: newPhotos });
                      }}
                      className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                        photo.is_ai_scan ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                      title="Toggle AI Scan"
                    >
                      <Brain size={14} />
                    </button>
                  </div>
                </div>

                {/* Scan Animation */}
                {isAnalysing && photo.is_ai_scan && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute inset-0 bg-uni-500/10 animate-pulse" />
                    <motion.div 
                      initial={{ y: -80 }}
                      animate={{ y: 150 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-uni-400 to-transparent shadow-[0_0_10px_rgba(var(--uni-rgb),0.8)]"
                    />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Small "Add More" tile when photos exist */}
            <div className="h-28 border border-dashed border-white/10 rounded-xl hover:border-uni-500/30 transition-colors flex items-center justify-center overflow-hidden">
              <ImageUpload 
                key={form.photos.length}
                value=""
                onUploadSuccess={url => {
                  const newPhoto = { url, is_landing_page: form.photos.length === 0, is_ai_scan: true };
                  setForm({ ...form, photos: [...form.photos, newPhoto] });
                }}
                description="Add More"
              />
            </div>
          </div>
        </>
      ) : (
        /* Empty State — full-width upload zone */
        <div className="border border-dashed border-white/10 rounded-xl hover:border-uni-500/30 transition-colors overflow-hidden">
          <ImageUpload 
            key="initial-upload"
            value=""
            onUploadSuccess={url => {
              const newPhoto = { url, is_landing_page: true, is_ai_scan: true };
              setForm({ ...form, photos: [newPhoto] });
            }}
            description="Tap to capture evidence"
          />
        </div>
      )}
    </div>
  );
};

export default Step1Visuals;
