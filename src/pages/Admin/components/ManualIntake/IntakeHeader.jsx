import { X, Sparkles, Archive, AlertCircle } from 'lucide-react';

const IntakeHeader = ({ step, stepLabels, stepSubtitles, isAnalysing, onClose, aiError }) => {
  const is503 = aiError?.message?.includes('503') || aiError?.message?.includes('high demand');

  return (
    <div className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${aiError ? 'bg-red-500/20 text-red-400' : isAnalysing ? 'bg-uni-500 animate-pulse' : 'bg-uni-500/10 text-uni-400'}`}>
            {aiError ? <AlertCircle size={16} /> : isAnalysing ? <Sparkles className="text-white" size={16} /> : <Archive size={16} />}
          </div>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-tight leading-none ${aiError ? 'text-red-400' : 'text-white'}`}>
              {aiError ? 'AI Service Busy' : isAnalysing ? 'AI Scanning...' : `Step ${step}: ${stepLabels[step-1]}`}
            </h2>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              {aiError ? (is503 ? 'Google API is experiencing high demand.' : aiError.message) : isAnalysing ? 'Extracting visual evidence' : stepSubtitles[step-1]}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`h-full flex-1 transition-all duration-500 ${aiError && s === step ? 'bg-red-500/30' : s <= step ? (s === step ? (isAnalysing ? 'bg-uni-400 animate-pulse' : 'bg-uni-400') : 'bg-uni-600') : 'bg-transparent'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntakeHeader;
