import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center bg-bg-surface border border-border-main rounded-xl text-text-muted hover:text-text-header transition-all hover:bg-bg-elevated group overflow-hidden relative"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className={`flex flex-col transition-transform duration-300 ${theme === 'dark' ? 'translate-y-5' : '-translate-y-5'}`}>
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-moon text-base group-hover:rotate-12"></i>
        </div>
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-sun text-base group-hover:rotate-12 text-amber-500"></i>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
