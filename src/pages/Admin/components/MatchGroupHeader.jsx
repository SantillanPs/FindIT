import React from 'react';

const MatchGroupHeader = ({ foundItem, setPreviewImage }) => {
  return (
    <div className="flex items-center justify-between px-10 py-6 bg-gradient-to-r from-uni-600/20 to-transparent border-l-8 border-uni-500 rounded-r-[2.5rem] mb-10 shadow-2xl">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl border border-white/10 ring-4 ring-uni-500/10">🔍</div>
        <div>
          <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.4em] mb-1 text-left">Investigation Anchor</p>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
            {foundItem.item_name}
            <span className="text-[10px] bg-uni-500 text-white px-3 py-1 rounded-full font-black tracking-widest shadow-lg leading-none flex items-center h-6">ID: #F-{foundItem.id}</span>
          </h3>
        </div>
      </div>
      <button 
        onClick={() => setPreviewImage(foundItem.safe_photo_url)}
        className="px-8 py-4 bg-uni-600 hover:bg-uni-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-uni-600/20 flex items-center gap-3"
      >
        <i className="fa-solid fa-camera-viewfinder text-lg"></i>
        Inspect Office Evidence
      </button>
    </div>
  );
};

export default MatchGroupHeader;
