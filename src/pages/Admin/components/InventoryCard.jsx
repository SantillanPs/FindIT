import React, { useState } from 'react';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Vault, RefreshCw, User, FileText } from "lucide-react";
import { imageCache } from '../../../lib/imageCache';

const InventoryCard = React.memo(({ 
  item, 
  navigate, 
  handleStatusUpdate, 
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading 
}) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgLoaded, setImgLoaded] = useState(imageCache.isLoaded(item.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  const formattedDate = new Date(item.created_at || item.date_found).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  const reporterFullName = item.guest_name || [item.guest_first_name, item.guest_last_name].filter(Boolean).join(' ');
  const displayReporter = reporterFullName || item.owner_name || 'Anonymous Finder';
  const isGuest = item.reporter_type === 'guest';

  // Extract only filled attribute values
  const filledAttributes = item.attributes
    ? Object.entries(item.attributes).filter(([, v]) => v && String(v).trim())
    : [];

  const hasDescription = item.description && item.description.trim().length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative border-white/5 bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[2rem] shadow-2xl p-0 flex flex-col">

        {/* Photo Header */}
        <div className={`relative overflow-hidden bg-slate-950 transition-all duration-700 rounded-t-[2rem] ${
          item.photo_url ? 'aspect-[21/9]' : 'h-16 sm:h-20'
        }`}>
          {item.photo_url ? (
            <>
              <motion.img
                initial={imgLoaded ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                src={item.photo_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                onLoad={() => { imageCache.markLoaded(item.photo_url); setImgLoaded(true); }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-between px-6 opacity-60 group-hover:opacity-80 transition-opacity">
              <div className="text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{categoryData?.emoji || '📦'}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">No Photo</div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-black/70 backdrop-blur-2xl text-white border-white/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-2 shadow-2xl">
              <span className="text-sm">{categoryData?.emoji || '📦'}</span>
              {categoryData?.name || item.category || 'Asset'}
            </Badge>
          </div>

          {/* Reporter type badge — top right */}
          <div className="absolute top-4 right-4 z-20">
            <Badge className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-2xl ${
              isGuest
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-black/60 text-slate-300 border-white/10'
            }`}>
              {isGuest ? '👤 Guest' : '🎓 Student'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 flex flex-col gap-3">

          {/* Meta row: ID + date + status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.15em] px-2 py-0.5 border border-white/5 rounded">
                #{item.id.toString().slice(-4).toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 border-l border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                {formattedDate}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.claim_count > 0 && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={10} />
                  {item.claim_count} Claims
                </Badge>
              )}
              <Badge className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                item.status === 'released'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-uni-500/10 text-uni-400 border-white/5 shadow-inner'
              }`}>
                {item.status === 'in_custody' ? 'REPOSITORY' : ['reported', 'available'].includes(item.status) ? 'INTAKE' : 'RELEASED'}
              </Badge>
            </div>
          </div>

          {/* Item title — primary identifier */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors duration-500 leading-tight">
              {item.title || categoryData?.name || 'Unnamed Item'}
            </h3>
          </div>

          {/* Description — if student filled it in */}
          {hasDescription && (
            <div className="flex items-start gap-2.5 py-2.5 px-3.5 bg-white/[0.03] border border-white/5 rounded-xl">
              <FileText size={11} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2 italic">
                "{item.description}"
              </p>
            </div>
          )}

          {/* Attributes — only filled ones */}
          {filledAttributes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filledAttributes.map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{key}</span>
                  <span className="text-[10px] font-black text-slate-300">{String(val)}</span>
                </div>
              ))}
            </div>
          )}

          {/* No data warning — helps admin know the report is thin */}
          {!hasDescription && filledAttributes.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <span className="text-amber-500 text-xs">⚠</span>
              <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">No details submitted — verify physically</p>
            </div>
          )}

          {/* Location + Reporter row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={9} /> Location
              </p>
              <p className="text-[11px] font-bold text-white truncate">{item.location || 'Not specified'}</p>
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <User size={9} /> Reporter
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isGuest ? 'bg-amber-400' : 'bg-uni-400'} shadow-[0_0_6px_rgba(56,189,248,0.4)]`} />
                <p className="text-[11px] font-bold text-white truncate capitalize">{displayReporter}</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-1">
            {item.status === 'reported' ? (
              <Button
                onClick={() => handleStatusUpdate(item, 'in_custody')}
                disabled={actionLoading === item.id}
                className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                {actionLoading === item.id
                  ? <RefreshCw size={18} className="animate-spin" />
                  : <div className="flex items-center gap-3"><Vault size={18} /> Secure Item</div>
                }
              </Button>
            ) : (
              <Button
                disabled={item.status === 'claimed'}
                onClick={() => {
                  setShowReleaseModal(item);
                  setReleaseForm({ name: item.identified_name || '', id_number: item.identified_student_id || '', photo_url: '' });
                }}
                className={`w-full h-14 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                  item.status === 'claimed'
                    ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                    : 'border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white'
                }`}
              >
                <BadgeCheck size={18} className="mr-3" />
                {item.status === 'claimed' ? 'Released' : 'Release Item'}
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
});

export default InventoryCard;
