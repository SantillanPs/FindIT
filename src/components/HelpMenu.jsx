import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Play, 
  MessageSquare, 
  ChevronRight, 
  X, 
  Search, 
  PlusCircle,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const HelpMenu = ({ onStartTour, onOpenFeedback, isLanding = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = isLanding 
    ? [
        { id: 'tour-landing', label: 'Take a Tour', icon: Play, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { id: 'tour-report-lost', label: 'How to Report Lost', icon: Search, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { id: 'tour-report-found', label: 'How to Report Found', icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      ]
    : [
        { id: 'tour-dashboard', label: 'Dashboard Guide', icon: Play, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { id: 'tour-report', label: 'Reporting Items', icon: Package, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      ];

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-72 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">FindIT Assistant</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">How can we help?</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onStartTour(item.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", item.bg)}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <span className="flex-grow text-[11px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">
                    {item.label}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}

              <div className="h-px bg-white/5 my-2 mx-2" />

              <button
                onClick={() => {
                  onOpenFeedback();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MessageSquare size={16} className="text-slate-400 group-hover:text-white" />
                </div>
                <span className="flex-grow text-[11px] font-bold text-slate-400 group-hover:text-white uppercase tracking-wider">
                  Send Feedback
                </span>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative h-12 rounded-2xl bg-sky-500 backdrop-blur-xl border-sky-400 shadow-[0_15px_30px_rgba(14,165,233,0.3)] transition-all duration-300 overflow-hidden flex items-center justify-start border-none",
          isHovered && !isOpen ? "w-32 px-4 shadow-[0_15px_40px_rgba(14,165,233,0.5)]" : "w-12 px-0 justify-center",
          isOpen && "bg-slate-800 scale-90"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {isOpen ? <X className="w-5 h-5 text-white" /> : <HelpCircle className="w-5 h-5 text-white" />}
          </div>
          <AnimatePresence>
            {isHovered && !isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap"
              >
                Help
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Button>
    </div>
  );
};

export default HelpMenu;
