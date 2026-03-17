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
      className="group relative glass-panel rounded-[2.5rem] border border-white/10 hover:border-uni-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col shadow-2xl shadow-black/20 bg-bg-surface/30 backdrop-blur-2xl"
    >
      {/* Premium Visual Anchor Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated/20 group-hover:bg-bg-elevated/40 transition-colors shrink-0">
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
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">In Custody</span>
            </div>
            
            {item.is_recent && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2.5 bg-uni-500/30 backdrop-blur-xl px-4 py-2 rounded-xl border border-uni-500/40 shadow-xl"
              >
                  <div className="w-1.5 h-1.5 rounded-full bg-uni-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
                  <span className="text-[10px] font-black text-uni-100 uppercase tracking-widest">New Intel</span>
              </motion.div>
            )}
        </div>

        {/* Archival Tracking ID */}
        <div className="absolute top-6 right-6 z-20">
            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                Ref: #{item.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-8 text-left relative flex-grow flex flex-col">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none"></div>

          <div className="space-y-6 relative z-10 flex-grow">
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em]">{item.category || 'Legacy Item'}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  <h3 className="text-2xl font-black text-text-header uppercase tracking-tighter leading-none group-hover:text-uni-400 transition-colors line-clamp-1 italic">
                    {item.item_name}
                  </h3>
              </div>

              {/* Discovery Context */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Located at</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-map-pin text-[10px] text-uni-500"></i>
                          <p className="text-[11px] font-medium text-text-main truncate tracking-wide">{item.location_zone}</p>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Archived On</p>
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-[10px] text-uni-500"></i>
                          <p className="text-[11px] font-medium text-text-main truncate tracking-wide">{formattedDate}</p>
                      </div>
                  </div>
              </div>

              {/* Official Description */}
              <div className="relative group/desc">
                <p className="text-text-muted text-[12px] font-medium leading-relaxed line-clamp-3 tracking-wide opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-uni-500/0 via-uni-500/40 to-uni-500/0 rounded-full scale-y-75 group-hover/desc:scale-y-100 transition-transform"></div>
              </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 relative z-10">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex-grow bg-transparent text-white border border-white/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 group/btn"
              >
                <span>Process Claim</span>
                <i className="fa-solid fa-shield-halved text-[11px] opacity-40 group-hover/btn:opacity-100 transition-opacity"></i>
              </button>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-text-main hover:bg-white/10 hover:border-white/20 transition-all shadow-lg group/share"
                title="Share Archival Record"
              >
                <i className="fa-solid fa-share-nodes text-text-muted group-hover/share:text-uni-400 transition-colors"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
