import React from 'react';
import { Joyride, STATUS } from 'react-joyride';

// Helper to remove style-related props that React doesn't recognize on DOM elements
const cleanProps = (props) => {
  const { borderRadius, backgroundColor, boxShadow, opacity, ...clean } = props;
  return clean;
};

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div {...cleanProps(tooltipProps)} className="glass-panel p-8 max-w-sm w-full border-brand-gold/20 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl">
      {step.title && (
        <h3 className="text-sm font-black text-brand-gold uppercase tracking-[0.2em] mb-3">
          {step.title}
        </h3>
      )}
      <div className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest opacity-90">
        {step.content}
      </div>
      
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
        <div className="flex gap-4">
          {index > 0 && (
            <button {...cleanProps(backProps)} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              Back
            </button>
          )}
          <button {...cleanProps(skipProps)} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">
            Skip
          </button>
        </div>
        
        <button {...cleanProps(primaryProps)} className="bg-brand-gold hover:bg-yellow-500 text-black px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-gold/20">
          {continuous ? 'Continue' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

const TutorialOverlay = ({ run, steps, onCallback }) => {
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onCallback && onCallback(data);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={false}
      showSkipButton={true}
      tooltipComponent={CustomTooltip}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
};

export default TutorialOverlay;
