import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MapGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden z-10"
        >
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">How to Build the Map</h2>
                <p className="text-sm text-slate-400 mt-1">A guide to structuring and navigating your campus blueprint.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
              
              {/* Hierarchy Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <i className="fa-solid fa-sitemap mt-[1px]"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white">1. Structuring the Blueprint</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The map works like a tree. <strong>Colleges</strong> and <strong>Outdoor Areas</strong> are the roots. Everything else branches out from them. When creating a new place in the catalog, always select the correct <em>"Located Inside"</em> parent.
                </p>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2 text-sm text-slate-300 font-medium">
                  <p className="flex items-center gap-2"><i className="fa-solid fa-building-columns text-uni-400 w-4"></i> Colleges <em>contain</em> Buildings</p>
                  <p className="flex items-center gap-2 ml-6 text-slate-400"><i className="fa-solid fa-building text-blue-400 w-4"></i> Buildings <em>contain</em> Floors</p>
                  <p className="flex items-center gap-2 ml-12 text-slate-500"><i className="fa-solid fa-layer-group text-purple-400 w-4"></i> Floors <em>contain</em> Rooms & Hallways</p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              {/* Canvas Controls Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <i className="fa-solid fa-computer-mouse mt-[1px]"></i>
                  </div>
                  <h3 className="text-lg font-bold text-white">2. Using the Canvas</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-amber-500 mb-2"><i className="fa-solid fa-up-down-left-right"></i> <strong>Drag & Drop</strong></div>
                    <p className="text-xs text-slate-400 leading-relaxed">Drag unplaced items from the <em>Unplaced Places</em> catalog on the left and drop them onto the grid to give them a position.</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-uni-400 mb-2"><i className="fa-solid fa-hand"></i> <strong>Pan & Zoom</strong></div>
                    <p className="text-xs text-slate-400 leading-relaxed">Use your mouse <strong>Scroll Wheel</strong> to zoom in and out. Hold the <strong>Spacebar</strong> and click-drag to pan around the canvas.</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-rose-400 mb-2"><i className="fa-solid fa-link"></i> <strong>Link tool (C)</strong></div>
                    <p className="text-xs text-slate-400 leading-relaxed">Press <strong>'C'</strong> to equip Link mode. Click one place, then click another to draw a connection. This tells FindIT they are adjacent.</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-blue-400 mb-2"><i className="fa-solid fa-arrow-pointer"></i> <strong>Arrange (V)</strong></div>
                    <p className="text-xs text-slate-400 leading-relaxed">Press <strong>'V'</strong> to equip the Arrange tool. Click and drag already placed items to organize them better on the grid.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapGuideModal;
