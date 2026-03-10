import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants/categories';

const LostReportCard = ({ report, onWitness }) => {
  const categoryData = CATEGORIES.find(c => c.id === report.category);
  
  const formattedDate = new Date(report.last_seen_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(report.last_seen_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative glass-panel rounded-[2.5rem] border border-border-main/50 hover:border-accent-default/30 transition-all duration-500 overflow-hidden flex flex-col shadow-2xl shadow-black/10 bg-bg-surface/50"
    >
      {/* Visual Anchor Area */}
      <div className="h-48 relative overflow-hidden bg-bg-elevated/50 border-b border-border-main/50 group-hover:bg-bg-elevated transition-colors">
        {report.safe_photo_url ? (
          <img 
            src={report.safe_photo_url} 
            alt={report.item_name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="text-7xl group-hover:scale-110 transition-transform duration-500">{categoryData?.emoji || '🔍'}</div>
             <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-40">Missing Item</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-6 left-6">
            <div className="flex items-center gap-2 bg-bg-main/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-border-main/20">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-default animate-pulse"></div>
                <span className="text-[9px] font-black text-text-header uppercase tracking-widest">Help Us Find</span>
            </div>
        </div>

        {/* Floating ID */}
        <div className="absolute top-6 right-6">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest bg-bg-surface/10 px-3 py-1 rounded-full border border-border-main/10">
                #{report.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-8 text-left flex-grow flex flex-col">
          <div className="flex-grow space-y-6">
              {/* Primary Identifier */}
              <div>
                  <h3 className="text-2xl font-black text-text-header uppercase tracking-tight leading-none group-hover:text-accent-light transition-colors">
                    {report.item_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                      {report.item_name?.toLowerCase() !== report.category?.toLowerCase() && (
                          <>
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{report.category}</span>
                              <div className="w-1 h-1 rounded-full bg-text-muted/10"></div>
                          </>
                      )}
                      <span className="text-[10px] font-black text-accent-default/60 uppercase tracking-widest italic">Reported Missing</span>
                  </div>
              </div>

              {/* Description Snippet */}
              <p className="text-text-muted text-sm italic font-bold leading-relaxed line-clamp-2 uppercase tracking-wide border-l-3 border-accent-default/20 pl-4 py-1">
                 "{report.description}"
              </p>

              {/* Scannable Meta Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 pt-2">
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Owner</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-user text-[11px] text-accent-default"></i>
                          <p className="text-[11px] font-black text-text-main uppercase truncate">{report.owner_name}</p>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Last Seen At</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-[11px] text-accent-default"></i>
                          <p className="text-[11px] font-black text-text-main uppercase truncate">{report.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Last Seen Time</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-clock text-[11px] text-accent-default"></i>
                          <p className="text-[11px] font-black text-text-main uppercase">{formattedTime}</p>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Date Lost</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar-day text-[11px] text-accent-default"></i>
                          <p className="text-[11px] font-black text-text-main uppercase">{formattedDate}</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border-main/10 flex gap-4">
              <div className="flex-grow bg-accent-default/10 text-accent-default py-4 rounded-[1.25rem] font-black text-[9px] uppercase tracking-[0.3em] border border-accent-default/20 text-center flex items-center justify-center">
                Contact Office if found
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onWitness(report);
                }}
                className="w-14 bg-accent-default hover:bg-accent-light text-black py-4 rounded-[1.25rem] flex items-center justify-center transition-all group/btn"
                title="I saw this item!"
              >
                <i className="fa-solid fa-eye text-sm group-hover/btn:scale-110 transition-transform"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default LostReportCard;
