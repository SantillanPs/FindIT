import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MousePointer2, 
  Link2, 
  Move, 
  RotateCcw, 
  Trash2, 
  Zap,
  Info,
  ShieldCheck,
  Map as MapIcon,
  Search,
  BookOpen
} from 'lucide-react';

/**
 * MapGuideModal - Premium Professional (Pro Max)
 * - Clean instructional modal.
 * - Human-centric labeling.
 * - Glassmorphism depth with professional typography.
 */
const MapGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: "Place New Zones",
      desc: "Create zones in the catalog, then drag them onto the map canvas to set their physical location.",
      icon: MapIcon,
      color: "text-uni-400"
    },
    {
      title: "Establish Connections",
      desc: "Switch to 'Path' mode. Click a starting zone, then click a destination to create a navigable path.",
      icon: Link2,
      color: "text-amber-500"
    },
    {
      title: "Manage Infrastructure",
      desc: "Hover over any zone to return it to the catalog or delete it. Click a path to remove it.",
      icon: ShieldCheck,
      color: "text-green-500"
    }
  ];

  const shortcuts = [
    { key: "V", action: "Move Tool" },
    { key: "C", action: "Path Tool" },
    { key: "Space", action: "Hold to Pan" },
    { key: "Esc", action: "Cancel / Deselect" },
    { key: "Wheel", action: "Zoom In/Out" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden pointer-events-auto shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-uni-600/20 text-uni-400 flex items-center justify-center border border-uni-500/20">
                <BookOpen size={20} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white tracking-tight">Map Builder Guide</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Editor Instructions & Controls</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-10 overflow-y-auto no-scrollbar">
            {/* Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className={`w-10 h-10 rounded-xl bg-black flex items-center justify-center ${step.color} border border-white/5`}>
                    <step.icon size={18} />
                  </div>
                  <div className="text-left space-y-1.5">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-4">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={12} className="text-amber-500" /> Hotkeys & Controls
               </h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {shortcuts.map((sc, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-black/40 border border-white/5">
                       <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-bold border-b-2 border-slate-950">{sc.key}</kbd>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sc.action}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-5 rounded-2xl bg-uni-500/5 border border-uni-500/10 flex items-start gap-4">
               <Info className="text-uni-400 shrink-0 mt-0.5" size={16} />
               <p className="text-[11px] text-slate-400 leading-relaxed text-left">
                  <span className="font-bold text-uni-400">Pro Tip:</span> Paths are directional. If you need a two-way connection, link Zone A to Zone B, then link Zone B to Zone A.
               </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-slate-950 hover:bg-uni-600 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapGuideModal;
