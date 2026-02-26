import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagePreviewOverlay = ({ previewImage, setPreviewImage }) => {
  if (!previewImage) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setPreviewImage(null)}
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
      >
        <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
        <button 
          onClick={() => setPreviewImage(null)}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </motion.div>
    </div>
  );
};

export default ImagePreviewOverlay;
