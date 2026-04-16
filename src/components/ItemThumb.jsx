import React from 'react';
import { imageCache } from '../lib/imageCache';
import { useMasterData } from '../context/MasterDataContext';
import { Package, IdCard } from 'lucide-react';

const ItemThumb = ({ item, onClick }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgError, setImgError] = React.useState(imageCache.isFailed(item.photo_thumbnail_url || item.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  const hasIdentity = item.identified_name || item.identified_student_id;

  return (
    <div 
      onClick={onClick}
      className="lt-thumb group relative aspect-square rounded-2xl border border-white/10 hover:border-sky-500/40 cursor-pointer overflow-hidden bg-slate-900/40 active:scale-[0.97] transition-transform"
    >
      {/* Image or Placeholder */}
      {item.photo_url && !imgError ? (
        <img 
          src={item.photo_thumbnail_url || item.photo_url} 
          alt={item.title} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={() => { imageCache.markFailed(item.photo_thumbnail_url || item.photo_url); setImgError(true); }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 gap-2">
          <span className="text-4xl">{categoryData?.emoji || '📦'}</span>
        </div>
      )}

      {/* Category Badge (top-left) */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
          <span className="text-[8px] font-bold text-white uppercase tracking-wider">
            {categoryData?.label || 'General'}
          </span>
        </div>
      </div>

      {/* Identity Linked Badge (top-right) */}
      {hasIdentity && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-sky-500/20 backdrop-blur-md p-1.5 rounded-full border border-sky-500/30">
            <IdCard className="h-3 w-3 text-sky-400" />
          </div>
        </div>
      )}

      {/* Bottom Title Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-2.5 px-2.5">
        <p className="text-[11px] font-bold text-white leading-tight line-clamp-1">{item.title}</p>
        <p className="text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1 uppercase tracking-wider">{item.location}</p>
      </div>
    </div>
  );
};

export default ItemThumb;
