import { motion } from 'framer-motion';
import { useMasterData } from '../context/MasterDataContext';

const ItemCard = ({ item, onClick, onShare }) => {
  const { categories: CATEGORIES } = useMasterData();
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  
  const formattedDate = new Date(item.found_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(item.found_time).toLocaleTimeString('en-US', {
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
      onClick={onClick}
      className="group relative glass-panel rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 hover:border-uni-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col shadow-2xl shadow-black/20 bg-bg-surface/30"
    >
      {/* Premium Visual Anchor Area */}
      <div className="relative aspect-square overflow-hidden bg-bg-elevated/20 group-hover:bg-bg-elevated/40 transition-colors shrink-0">
        {item.safe_photo_url ? (
          <div className="relative w-full h-full">
            <img 
              src={item.safe_photo_url} 
              alt={item.item_name} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" 
            />
            {/* Gradient Mask for Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent opacity-60"></div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="text-8xl group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">
                {categoryData?.emoji || '📦'}
             </div>
             <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.5em] opacity-30 mt-4 leading-relaxed text-center px-10">
                Visual Archival Archive <br/> Placeholder
             </div>
          </div>
        )}
        
        {/* Superior Status System */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-1.5 md:gap-2.5 bg-black/40 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-white/10 shadow-lg">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></div>
                <span className="text-[7px] md:text-[10px] font-black text-white uppercase tracking-widest">In Custody</span>
            </div>
            
            {item.is_recent && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-1.5 md:gap-2.5 bg-uni-500/30 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-uni-500/40 shadow-xl"
              >
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-uni-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
                  <span className="text-[7px] md:text-[10px] font-black text-uni-100 uppercase tracking-widest">New</span>
              </motion.div>
            )}
        </div>

        {/* Archival Tracking ID */}
        <div className="absolute top-3 right-3 md:top-6 md:right-6 z-20">
            <span className="text-[7px] md:text-[9px] font-black text-white/50 uppercase tracking-widest bg-black/30 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/5">
                Ref: #{item.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-4 md:p-6 text-left relative flex-grow flex flex-col bg-bg-surface/40">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none"></div>

          <div className="space-y-2 md:space-y-4 relative z-10 flex-grow">
                  <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight italic group-hover:text-uni-400 transition-colors line-clamp-2">
                    {item.item_name}
                  </h3>

              {/* Discovery Context */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 py-2 border-y border-white/5">
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Archival Spot</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-map-pin text-[10px] text-uni-500"></i>
                          <p className="text-[11px] md:text-sm font-bold text-slate-100 truncate">{item.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Entry Date</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-[10px] text-uni-500"></i>
                          <p className="text-[11px] md:text-sm font-bold text-slate-100 truncate">{formattedDate}</p>
                      </div>
                  </div>
              </div>

              {/* Official Description */}
              <div className="relative group/desc bg-black/20 p-3 rounded-xl border border-white/5">
                <p className="text-slate-200 text-[12px] font-medium leading-relaxed line-clamp-2 tracking-wide">
                  {item.description}
                </p>
              </div>
          </div>

          <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex gap-2 md:gap-4 relative z-10">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex-grow bg-transparent text-white border border-white/20 py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 md:gap-3 group/btn"
              >
                <span>Process</span>
                <i className="fa-solid fa-shield-halved text-[9px] md:text-[11px] opacity-40 group-hover/btn:opacity-100 transition-opacity"></i>
              </button>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-10 h-10 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-text-main hover:bg-white/10 hover:border-white/20 transition-all shadow-lg group/share shrink-0"
                title="Share Archival Record"
              >
                <i className="fa-solid fa-share-nodes text-[10px] md:text-base text-text-muted group-hover/share:text-uni-400 transition-colors"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
