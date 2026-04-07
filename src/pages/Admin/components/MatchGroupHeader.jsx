import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Camera } from "lucide-react";

const MatchGroupHeader = ({ foundItem, setPreviewImage }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900/50 border-l-[6px] border-uni-500 rounded-r-3xl border-y border-r border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Search size={120} className="text-uni-400 rotate-12" />
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-white/10 ring-4 ring-uni-500/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
           {foundItem.found_photo_url ? (
             <img src={foundItem.found_photo_url} className="w-full h-full object-cover rounded-2xl" alt="" />
           ) : (
             <Search className="text-uni-400" size={28} />
           )}
        </div>
        <div className="space-y-1.5 text-left">
          <p className="text-[13px] font-bold text-uni-400 uppercase tracking-wider">Investigation Anchor</p>
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {foundItem.title}
            </h3>
            <Badge className="bg-uni-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-[13px] shadow-lg shadow-uni-500/20">
              ID: #F-{foundItem.id}
            </Badge>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setPreviewImage(foundItem.found_photo_url || foundItem.photo_url)}
        className="relative z-10 px-8 h-14 bg-uni-600 hover:bg-uni-700 text-white rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-xl shadow-uni-600/10 active:scale-[0.98] group-hover:shadow-uni-600/20"
      >
        <Camera size={18} />
        Inspect Office Evidence
      </Button>
    </div>
  );
};

export default MatchGroupHeader;
