import React, { useState } from 'react';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Vault, RefreshCw, User, FileText, Activity, Settings } from "lucide-react";
import { imageCache } from '../../../lib/imageCache';

const InventoryCard = React.memo(({ 
  item, 
  navigate, 
  handleStatusUpdate, 
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading,
  onReviewItem
}) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgLoaded, setImgLoaded] = useState(imageCache.isLoaded(item.photo_url));
  const [imgError, setImgError] = useState(imageCache.isFailed(item.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  const formattedDate = new Date(item.created_at || item.date_found).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  const reporterFullName = item.guest_name || [item.guest_first_name, item.guest_last_name].filter(Boolean).join(' ');
  const displayReporter = reporterFullName || item.owner_name || 'Anonymous Finder';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative border-white/5 bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[2.5rem] shadow-2xl p-0 flex flex-col">

        {/* 1. Primary Image */}
        <div className={`relative overflow-hidden bg-slate-950 transition-all duration-700 rounded-t-[2.5rem] ${
          item.photo_url ? 'aspect-[16/9]' : 'h-16'
        }`}>
          {item.photo_url && !imgError ? (
            <>
              <motion.img
                initial={imgLoaded ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                src={item.photo_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                onLoad={() => { imageCache.markLoaded(item.photo_url); setImgLoaded(true); }}
                onError={() => { imageCache.markFailed(item.photo_url); setImgError(true); }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center opacity-60">
              <div className="text-2xl">{categoryData?.emoji || '📦'}</div>
            </div>
          )}

          {/* 2. Category */}
          <div className="absolute top-6 left-6 z-20">
            <Badge className="bg-black/60 backdrop-blur-xl text-white border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
              <span className="text-sm">{categoryData?.emoji || '📦'}</span>
              {categoryData?.name || item.category || 'Asset'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Title */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors duration-500 truncate capitalize">
              {item.title || categoryData?.name || 'Unnamed Item'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-4 pt-1">
            {/* 3. Location */}
            <div className="space-y-1.5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={10} className="text-uni-400" /> Location
              </p>
              <p className="text-[11px] font-extrabold text-slate-200 truncate pr-2">{item.location || 'Not specified'}</p>
            </div>

            {/* 4. Date */}
            <div className="space-y-1.5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={10} className="text-uni-400" /> Reported on
              </p>
              <p className="text-[11px] font-extrabold text-slate-200">{formattedDate}</p>
            </div>

            {/* 5. Reporter */}
            <div className="col-span-2 space-y-1.5 pt-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <User size={10} className="text-uni-400" /> Reporter Full Name
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.reporter_type === 'guest' ? 'bg-amber-400' : 'bg-uni-400'} shadow-[0_0_8px_rgba(56,189,248,0.5)]`} />
                <p className="text-[12px] font-black text-white truncate capitalize tracking-tight">{displayReporter}</p>
              </div>
            </div>
          </div>

          {/* Action Button (Functional requirement) */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onReviewItem(item)}
              variant="outline"
              className="flex-grow h-14 rounded-2xl bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              <Settings size={18} className="mr-2" />
              Edit
            </Button>

            {item.status === 'reported' ? (
              <Button
                onClick={() => handleStatusUpdate(item, 'in_custody')}
                disabled={actionLoading === item.id}
                className="flex-[2] h-14 rounded-2xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                {actionLoading === item.id
                  ? <RefreshCw size={18} className="animate-spin" />
                  : <div className="flex items-center gap-3"><Vault size={18} /> Secure Item</div>
                }
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setShowReleaseModal(item);
                  setReleaseForm({ name: item.identified_name || '', id_number: item.identified_student_id || '', photo_url: '' });
                }}
                className={`flex-[2] h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 border ${
                  item.status === 'claimed'
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-600 hover:text-white'
                    : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white'
                }`}
              >
                <BadgeCheck size={18} className="mr-3" />
                {item.status === 'claimed' ? 'Process Return' : 'Release Item'}
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
});

export default InventoryCard;
