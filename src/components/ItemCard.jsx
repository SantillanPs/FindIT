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
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative glass-panel rounded-[2.5rem] border border-border-main/50 hover:border-uni-500/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/10 bg-bg-surface/50 min-h-[320px]"
    >
      {/* Visual Anchor Area */}
      <div className="w-full md:w-80 relative overflow-hidden bg-bg-elevated/50 border-b md:border-b-0 md:border-r border-border-main/50 group-hover:bg-bg-elevated transition-colors shrink-0 h-48 md:h-auto">
        {item.safe_photo_url ? (
          <img 
            src={item.safe_photo_url} 
            alt={item.item_name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
             <div className="text-7xl group-hover:scale-110 transition-transform duration-500">{categoryData?.emoji || '📦'}</div>
             <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-40">Visual Confirmation Required</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-6 left-6">
            <div className="flex items-center gap-2 bg-bg-main/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-border-main/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-text-header uppercase tracking-widest">In Registry</span>
            </div>
        </div>

        {/* Floating ID */}
        <div className="absolute top-6 right-6">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest bg-bg-surface/10 px-3 py-1 rounded-full border border-border-main/10">
                #{item.id.toString().padStart(4, '0')}
            </span>
        </div>
      </div>

      {/* Scannable Data Section */}
      <div className="p-10 text-left flex-grow flex flex-col justify-between">
          <div className="space-y-8">
              {/* Primary Identifier */}
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-3xl font-black text-text-header uppercase tracking-tight leading-none group-hover:text-uni-400 transition-colors">
                        {item.item_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-3">
                          {item.item_name?.toLowerCase() !== item.category?.toLowerCase() && (
                              <>
                                  <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{item.category}</span>
                                  <div className="w-1 h-1 rounded-full bg-text-muted/10"></div>
                              </>
                          )}
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{formattedDate}</span>
                      </div>
                  </div>

                  <div className="flex -space-x-2 hidden md:flex">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-border-main bg-bg-surface flex items-center justify-center text-[8px] font-black text-text-muted italic shadow-lg">
                              i{i}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Description Snippet */}
              <p className="text-text-muted text-sm italic font-bold leading-relaxed line-clamp-3 uppercase tracking-wide border-l-3 border-uni-500/20 pl-6 py-2 bg-white/[0.02] rounded-r-2xl">
                 "{item.description}"
              </p>

              {/* Scannable Meta Info - Horizontal Strip */}
              <div className="flex flex-wrap items-center gap-10 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Location</p>
                      <div className="flex items-center gap-3">
                          <i className="fa-solid fa-location-dot text-[14px] text-uni-400"></i>
                          <p className="text-xs font-black text-text-main uppercase">{item.location_zone}</p>
                      </div>
                  </div>
                  <div className="h-8 w-px bg-white/5 hidden sm:block"></div>
                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Discovery Time</p>
                      <div className="flex items-center gap-3">
                          <i className="fa-solid fa-clock text-[14px] text-uni-400"></i>
                          <p className="text-xs font-black text-text-main uppercase">{formattedTime}</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border-main/10 flex gap-6">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex-grow bg-white text-black py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group/btn"
              >
                <span>Initiate Claim</span>
                <i className="fa-solid fa-chevron-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                }}
                className="w-20 bg-bg-surface border-2 border-border-main/50 rounded-[1.5rem] flex items-center justify-center text-text-main hover:bg-bg-elevated hover:border-white/20 transition-all shadow-xl group/share"
                title="Share Item"
              >
                <i className="fa-solid fa-paper-plane text-text-muted group-hover/share:text-uni-400 transition-colors"></i>
              </button>
          </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
