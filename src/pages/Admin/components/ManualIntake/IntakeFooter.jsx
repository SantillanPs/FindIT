import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const IntakeFooter = ({ 
  step, 
  onClose, 
  handleBack, 
  handleNext, 
  handleSubmit, 
  isAnalysing, 
  actionLoading, 
  form,
  handleManualScan,
  aiDraft
}) => {
  return (
    <div className="px-4 py-3 md:px-6 md:py-4 border-t border-white/5 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between gap-3">
      {/* Left: Back / Cancel */}
      <button 
        type="button"
        onClick={step === 1 ? onClose : handleBack} 
        className="px-5 h-11 bg-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center"
      >
        {step === 1 ? 'Cancel' : 'Back'}
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {step < 4 ? (
          <>
            {/* Icon-only Scan button on Step 1 */}
            {step === 1 && form.photos.some(p => p.is_ai_scan) && !isAnalysing && (
              <button 
                type="button"
                onClick={handleManualScan}
                className="w-11 h-11 bg-uni-500/20 text-uni-400 border border-uni-500/30 hover:bg-uni-500/30 rounded-xl transition-all flex items-center justify-center shadow-lg"
                title="Run AI Scan"
              >
                <Sparkles size={18} />
              </button>
            )}

            <button 
              type="button"
              onClick={handleNext}
              disabled={isAnalysing || (step === 1 && form.photos.length === 0)}
              className="px-6 h-11 bg-white text-black hover:bg-uni-400 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              {isAnalysing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-8 h-11 bg-uni-500 text-white hover:bg-uni-400 disabled:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group shadow-lg"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Submit
                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntakeFooter;
