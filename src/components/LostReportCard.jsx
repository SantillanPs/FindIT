import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMasterData } from '../context/MasterDataContext';
import { useAuth } from '../context/AuthContext';

const LostReportCard = ({ report, onWitness }) => {
  const navigate = useNavigate();
  const { categories: CATEGORIES } = useMasterData();
  const { user } = useAuth();
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
      {/* Premium Visual Anchor Area - Compact for text-only reports */}
      <div className={`relative overflow-hidden bg-bg-elevated/20 group-hover:bg-bg-elevated/40 transition-all duration-500 shrink-0 ${
        report.safe_photo_url ? 'aspect-square' : 'h-32 md:h-48'
      }`}>
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
          <div className="w-full h-full flex items-center justify-between px-6 md:px-12">
             <div className="text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl opacity-40">
                {categoryData?.emoji || '🔍'}
             </div>
             <div className="text-right">
                <div className="text-[8px] md:text-[10px] font-black text-accent-default/40 uppercase tracking-[0.4em] leading-tight">
                  Institutional <br/> Record
                </div>
             </div>
          </div>
        )}
        
        {/* Urgent Status System */}
        <div className={`absolute flex flex-col gap-2 z-20 ${
          report.safe_photo_url ? 'top-3 left-3 md:top-6 md:left-6' : 'top-3 left-3 md:top-4 md:left-6 scale-90 md:scale-100'
        }`}>
            <div className="flex items-center gap-1.5 md:gap-2.5 bg-accent-default/20 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-accent-default/30 shadow-lg">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-accent-default shadow-[0_0_8px_rgba(255,107,0,0.6)] animate-pulse"></div>
                <span className="text-[7px] md:text-[10px] font-black text-accent-default uppercase tracking-widest">Active Search</span>
            </div>
            
            {report.is_recent && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-1.5 md:gap-2.5 bg-accent-default px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg"
              >
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                  <span className="text-[7px] md:text-[10px] font-black text-white uppercase tracking-widest">New</span>
              </motion.div>
            )}
        </div>

        {/* Case ID */}
        <div className={`absolute z-20 ${
          report.safe_photo_url ? 'top-3 right-3 md:top-6 md:right-6' : 'top-3 right-3 md:top-4 md:right-6 scale-90 md:scale-100'
        }`}>
            <span className="text-[7px] md:text-[9px] font-black text-white/50 uppercase tracking-widest bg-black/30 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/5">
                Case: #{report.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-4 md:p-6 text-left relative flex-grow flex flex-col bg-bg-surface/40">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none"></div>

          <div className="space-y-2 md:space-y-4 relative z-10 flex-grow">
                  <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight italic group-hover:text-accent-default transition-colors line-clamp-2">
                    {report.item_name}
                  </h3>

              {/* Loss Context */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 py-2 border-y border-white/5">
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Loss Zone</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-map-pin text-[10px] text-accent-default"></i>
                          <p className="text-[11px] md:text-sm font-bold text-slate-100 truncate">{report.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Incident Date</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-[10px] text-accent-default"></i>
                          <p className="text-[11px] md:text-sm font-bold text-slate-100 truncate">{formattedDate}</p>
                      </div>
                  </div>
              </div>

              {/* Official Description */}
              <div className="relative group/desc bg-black/20 p-3 rounded-xl border border-white/5">
                <p className="text-slate-200 text-[12px] font-medium leading-relaxed line-clamp-2 tracking-wide">
                  {report.description}
                </p>
              </div>
          </div>

          <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex gap-2 md:gap-4 relative z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    navigate(`/report/found?match=${report.id}`);
                  } else {
                    navigate(`/report-found-guest?match=${report.id}`);
                  }
                }}
                className="flex-grow bg-transparent hover:bg-accent-default border border-accent-default/50 hover:border-accent-default text-accent-default hover:text-white py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[7px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.3em] text-center flex items-center justify-center gap-1.5 md:gap-3 leading-none md:leading-normal transition-all duration-300 shadow-[0_0_15px_rgba(255,107,0,0.1)] hover:shadow-[0_0_25px_rgba(255,107,0,0.3)] active:scale-95"
              >
                <i className="fa-solid fa-hand-holding-heart text-[9px] md:text-base"></i>
                <span>I Found This!</span>
              </button>
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
