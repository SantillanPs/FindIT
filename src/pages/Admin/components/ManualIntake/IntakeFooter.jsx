import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="p-4 md:p-8 border-t border-white/5 bg-slate-900/90 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
      <div className="flex items-center gap-3 w-full md:w-auto order-2 md:order-1">
        <button 
          type="button"
          onClick={step === 1 ? onClose : handleBack} 
          className="flex-1 md:flex-none px-6 h-14 md:h-12 bg-white/5 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto order-1 md:order-2">
        {step < 4 ? (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Conditional "Run AI Scan" button in Step 1 */}
            {step === 1 && form.photo_url && !isAnalysing && (
              <button 
                type="button"
                onClick={handleManualScan}
                className="flex-1 md:flex-none px-8 h-14 md:h-14 bg-uni-500/20 text-uni-400 border border-uni-500/30 hover:bg-uni-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-xl"
              >
                Scan Evidence
              </button>
            )}

            <button 
              type="button"
              onClick={handleNext}
              disabled={isAnalysing || (step === 1 && !form.photo_url)}
              className="flex-1 md:px-12 h-14 md:h-14 bg-white text-black hover:bg-uni-400 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-white/5"
            >
              {isAnalysing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-black rounded-full animate-spin" />
                  Neural Processing...
                </>
              ) : (
                <>
                  {step === 1 ? (aiDraft ? 'Continue' : 'Capture & Skip Scan') : 'Next Intelligence'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="w-full md:px-12 h-14 md:h-14 bg-uni-500 text-white hover:bg-uni-400 disabled:bg-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-uni-500/20"
          >
            {actionLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                Finalize Archive
                <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntakeFooter;
