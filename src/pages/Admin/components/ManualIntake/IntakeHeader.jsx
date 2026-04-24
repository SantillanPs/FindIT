import { X, Sparkles, Archive, AlertCircle } from 'lucide-react';

const IntakeHeader = ({ step, stepLabels, stepSubtitles, isAnalysing, onClose, aiError }) => {
  const is503 = aiError?.message?.includes('503') || aiError?.message?.includes('high demand');

  return (
    <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-colors ${aiError ? 'bg-red-500/20 text-red-400' : isAnalysing ? 'bg-uni-500 animate-pulse' : 'bg-uni-500/10 text-uni-400'}`}>
            {aiError ? <AlertCircle size={20} /> : isAnalysing ? <Sparkles className="text-white" size={20} /> : <Archive size={20} />}
          </div>
          <div>
            <h2 className={`text-base md:text-xl font-black uppercase tracking-tight leading-none ${aiError ? 'text-red-400' : 'text-white'}`}>
              {aiError ? 'AI Service Busy' : isAnalysing ? 'AI Scanning...' : `Step ${step}: ${stepLabels[step-1]}`}
            </h2>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mt-1">
              {aiError ? (is503 ? 'Google API is experiencing high demand. Try again later.' : aiError.message) : isAnalysing ? 'Extracting Visual Evidence' : stepSubtitles[step-1]}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`h-full flex-1 transition-all duration-500 ${aiError && s === step ? 'bg-red-500/30' : s <= step ? (s === step ? (isAnalysing ? 'bg-uni-400 animate-pulse' : 'bg-uni-400') : 'bg-uni-600') : 'bg-white/5'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntakeHeader;
