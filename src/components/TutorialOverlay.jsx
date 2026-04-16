import React from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTheme } from '../context/ThemeContext';

const TutorialOverlay = ({ run, steps, onCallback }) => {
  const { theme } = useTheme();

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
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: theme === 'dark' ? '#1e293b' : '#fff',
          backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#0ea5e9', // sky-500
          textColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
          zIndex: 1000,
        },
        tooltip: {
          'borderRadius': '1.25rem',
          padding: '1.5rem',
          'backgroundColor': theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          'backdropFilter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          'boxshadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        tooltipContainer: {
          'textAlign': 'left',
          'fontFamily': 'inherit',
        },
        tooltipTitle: {
          'fontSize': '1rem',
          'fontWeight': '800',
          'textTransform': 'uppercase',
          'letterSpacing': '0.05em',
          'marginBottom': '0.5rem',
          color: '#fff',
        },
        tooltipContent: {
          'fontSize': '0.875rem',
          'lineHeight': '1.5',
          color: theme === 'dark' ? '#94a3b8' : '#475569',
        },
        buttonNext: {
          'backgroundColor': '#0ea5e9',
          'borderRadius': '0.75rem',
          'fontSize': '0.75rem',
          'fontWeight': 'bold',
          'textTransform': 'uppercase',
          'letterSpacing': '0.1em',
          padding: '0.625rem 1.25rem',
          transition: 'all 0.2s ease',
        },
        buttonBack: {
          color: '#64748b',
          'fontSize': '0.75rem',
          'fontWeight': 'bold',
          'textTransform': 'uppercase',
          'letterSpacing': '0.1em',
          'marginRight': '1rem',
        },
        buttonSkip: {
          color: '#94a3b8',
          'fontSize': '0.75rem',
          'fontWeight': 'bold',
          'textTransform': 'uppercase',
          'letterSpacing': '0.1em',
        },
        spotlight: {
          'borderRadius': '1.25rem',
          'backgroundColor': 'transparent',
          'boxshadow': '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(14, 165, 233, 0.3)',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
};

export default TutorialOverlay;
