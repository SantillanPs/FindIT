import { motion } from 'framer-motion';
import { useMasterData } from '../context/MasterDataContext';

const LostReportCard = ({ report, onWitness }) => {
  const { categories: CATEGORIES } = useMasterData();
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
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, transition: { duration: 0.3 } }}
      className="group relative glass-panel rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 hover:border-accent-default/40 transition-all duration-500 overflow-hidden flex flex-col shadow-2xl shadow-black/20 bg-bg-surface/30"
    >
      {/* Premium Discovery Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated/20 group-hover:bg-bg-elevated/40 transition-colors shrink-0">
        {report.safe_photo_url ? (
          <div className="relative w-full h-full">
            <img 
              src={report.safe_photo_url} 
              alt={report.item_name} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" 
            />
            {/* Ambient Lost Pulse Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent opacity-60"></div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="text-8xl group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl opacity-40">
                {categoryData?.emoji || '🔍'}
             </div>
             <div className="text-[9px] font-black text-accent-default/40 uppercase tracking-[0.5em] mt-4 leading-relaxed text-center px-10">
                Active Missing Record <br/> Search Area
             </div>
          </div>
        )}
        
        {/* Urgent Status System */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-1.5 md:gap-2.5 bg-accent-default/20 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-accent-default/30 shadow-lg">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-accent-default shadow-[0_0_8px_rgba(255,107,0,0.6)] animate-pulse"></div>
                <span className="text-[7px] md:text-[10px] font-black text-accent-default uppercase tracking-widest">Active Search</span>
            </div>
        </div>

        {/* Case ID */}
        <div className="absolute top-3 right-3 md:top-6 md:right-6 z-20">
            <span className="text-[7px] md:text-[9px] font-black text-white/50 uppercase tracking-widest bg-black/30 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/5">
                Case: #{report.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-4 md:p-8 text-left relative flex-grow flex flex-col">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none"></div>

          <div className="space-y-3 md:space-y-6 relative z-10 flex-grow">
              <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[8px] md:text-[10px] font-black text-accent-default/60 uppercase tracking-[0.2em] md:tracking-[0.3em]">{report.category || 'Legacy Report'}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  <h3 className="text-sm md:text-2xl font-black text-text-header uppercase tracking-tighter leading-tight md:leading-none group-hover:text-accent-default transition-colors line-clamp-1 italic">
                    {report.item_name}
                  </h3>
              </div>

              {/* Loss Context */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-4 pt-1">
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Last Seen</p>
                      <div className="flex items-center gap-1.5 md:gap-2">
                          <i className="fa-solid fa-location-arrow text-[8px] md:text-[10px] text-accent-default"></i>
                          <p className="text-[9px] md:text-[11px] font-medium text-text-main truncate tracking-wide">{report.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Missing Since</p>
                      <div className="flex items-center gap-1.5 md:gap-2">
                          <i className="fa-solid fa-clock-rotate-left text-[8px] md:text-[10px] text-accent-default"></i>
                          <p className="text-[9px] md:text-[11px] font-medium text-text-main truncate tracking-wide">{formattedDate}</p>
                      </div>
                  </div>
              </div>

              {/* Victim's Note */}
              <div className="relative group/desc">
                <p className="text-text-muted text-[12px] font-medium leading-relaxed line-clamp-3 tracking-wide opacity-70 group-hover:opacity-100 transition-opacity">
                  {report.description}
                </p>
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-default/0 via-accent-default/40 to-accent-default/0 rounded-full scale-y-75 group-hover/desc:scale-y-100 transition-transform"></div>
              </div>
          </div>

          <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex gap-2 md:gap-4 relative z-10">
              <div className="flex-grow bg-white/5 border border-white/10 text-text-muted py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[7px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.3em] text-center flex items-center justify-center gap-1.5 md:gap-3 leading-none md:leading-normal">
                <i className="fa-solid fa-building-shield text-accent-default/50 text-[9px] md:text-base"></i>
                <span>Surrender to Office</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onWitness(report);
                }}
                className="w-10 h-10 md:w-14 md:h-14 bg-transparent border border-white/10 text-accent-default rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-accent-default hover:text-white active:scale-90 group/btn shrink-0"
                title="I've seen this item!"
              >
                <i className="fa-solid fa-eye text-xs md:text-sm group-hover/btn:scale-110 transition-transform"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default LostReportCard;
