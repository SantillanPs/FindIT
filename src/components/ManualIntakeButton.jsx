import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const ManualIntakeButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative h-12 rounded-2xl bg-sky-500 backdrop-blur-xl border-sky-400 shadow-[0_15px_30px_rgba(14,165,233,0.3)] transition-all duration-300 overflow-hidden flex items-center justify-start border-none hover:bg-sky-600",
          isHovered ? "w-32 px-4 shadow-[0_15px_40px_rgba(14,165,233,0.5)]" : "w-12 px-0 justify-center"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap"
              >
                Intake
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Button>
    </div>
  );
};

export default ManualIntakeButton;
