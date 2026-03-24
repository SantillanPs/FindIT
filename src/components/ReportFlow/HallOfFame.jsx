import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HallOfFame = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const examples = {
    'Cellphone': {
      wrong: 'Blue phone.',
      better: 'iPhone, blue, with a sunflower sticker.',
      tips: ['Add the brand (e.g. iPhone)', 'Add stickers or scratches']
    },
    'ID Card': {
      wrong: 'My ID.',
      better: 'ID Card for [Your Name] with a blue lanyard.',
      tips: ['Add your name', 'Add college/dept']
    },
    'Wallet': {
      wrong: 'Wallet.',
      better: 'Black leather wallet with school ID.',
      tips: ['Add color and material', 'Add contents']
    },
    'Bag / Backpack': {
      wrong: 'My bag.',
      better: 'Black backpack with a yellow keychain.',
      tips: ['Add brand', 'Add keychains or pins']
    },
    'default': {
      wrong: 'Generic description.',
      better: 'Specific description with color and unique marks.',
      tips: ['Be specific', 'Add unique marks']
    }
  };

  const current = examples[category] || examples['default'];

  return (
    <div className="mt-6">
      <div className="flex justify-center">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-all flex items-center gap-3"
        >
          <i className={`fa-solid ${isExpanded ? 'fa-xmark' : 'fa-lightbulb'} text-xs`}></i>
          {isExpanded ? 'Close' : 'View Example'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-6 max-w-lg mx-auto text-left">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest opacity-60">Too Simple</p>
                  <p className="text-sm font-medium text-slate-500 italic">"{current.wrong}"</p>
                </div>
                
                <div className="h-px bg-white/5"></div>

                <div className="space-y-1">
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-widest opacity-60">Better Way (Helpful)</p>
                  <p className="text-sm font-bold text-white italic">"{current.better}"</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center px-4">
                 {current.tips.map((tip, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-uni-500 opacity-40"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tip}</span>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HallOfFame;
