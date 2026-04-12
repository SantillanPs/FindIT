import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-text-muted transition-all group overflow-hidden relative"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className={`flex flex-col transition-transform duration-300 ${theme === 'dark' ? 'translate-y-5 md:translate-y-6' : '-translate-y-5 md:-translate-y-6'}`}>
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-moon text-base md:text-lg group-hover:rotate-12 transition-transform"></i>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-sun text-base md:text-lg group-hover:rotate-12 text-amber-500 transition-transform"></i>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
