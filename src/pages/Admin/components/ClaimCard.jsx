import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMasterData } from '../../../context/MasterDataContext';
import { imageCache } from '../../../lib/imageCache';
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Mail,
  Bot,
  ArrowRight,
  User as UserIcon,
  MapPin,
  Clock,
  Image as ImageIcon,
  MessageSquareText,
  Fingerprint,
} from "lucide-react";

/**
 * ClaimCard — Admin Verification Queue Card
 * Rich vertical layout matching the InventoryCard design language.
 * Dual-photo comparison, claimant identity, AI confidence, and statement preview.
 */
const ClaimCard = React.memo(({ claim, onReview }) => {
  const { categories: CATEGORIES } = useMasterData();
  const categoryData = CATEGORIES?.find(c => c.id === claim.item_category);
  const [itemImgLoaded, setItemImgLoaded] = useState(imageCache.isLoaded(claim.item_photo_url));

  const formattedDate = claim.created_at
    ? new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    : 'UNDATED';

  const itemFoundDate = claim.item_date_found
    ? new Date(claim.item_date_found).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    : null;

  const statementPreview = claim.proof_description
    ? claim.proof_description.length > 100
      ? claim.proof_description.substring(0, 100) + '…'
      : claim.proof_description
    : null;

  const aiScore = claim.similarity_score != null
    ? Math.round(claim.similarity_score * 100)
    : null;

  const statusConfig = {
    pending:  { label: 'Pending Review', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    approved: { label: 'Approved',       bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    rejected: { label: 'Rejected',       bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  };
  const status = statusConfig[claim.status] || statusConfig.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative border-white/5 bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[2rem] shadow-2xl p-0 flex flex-col">

        {/* ─── Photo Comparison Strip ─── */}
        <div className="relative h-36 sm:h-44 bg-slate-950 rounded-t-[2rem] overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2">
            {/* Left: Original Item */}
            <div className="relative overflow-hidden border-r border-white/10">
              {claim.item_photo_url ? (
                <>
                  <motion.img
                    initial={itemImgLoaded ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={claim.item_photo_url}
                    alt="Found item"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    onLoad={() => { imageCache.markLoaded(claim.item_photo_url); setItemImgLoaded(true); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950/60">
                  <ImageIcon size={28} className="text-slate-700" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  Found Item
                </span>
              </div>
            </div>

            {/* Right: Claimant Proof */}
            <div className="relative overflow-hidden">
              {claim.proof_photo_url ? (
                <>
                  <img
                    src={claim.proof_photo_url}
                    alt="Claimant proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/60 gap-2">
                  <Fingerprint size={24} className="text-slate-700" />
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">No photo proof</span>
                </div>
              )}
              <div className="absolute bottom-3 right-3 z-10">
                <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  Claimant Proof
                </span>
              </div>
            </div>
          </div>

          {/* VS divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-white/10 flex items-center justify-center shadow-2xl">
              <span className="text-[9px] font-black text-white/80 tracking-widest">VS</span>
            </div>
          </div>

          {/* Category badge — top left */}
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-black/70 backdrop-blur-2xl text-white border-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-1.5 shadow-2xl">
              <span className="text-xs">{categoryData?.emoji || '📦'}</span>
              {categoryData?.name || claim.item_category || 'Asset'}
            </Badge>
          </div>

          {/* AI Score badge — top right */}
          {aiScore != null && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className={`backdrop-blur-2xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-2xl border ${
                aiScore >= 70
                  ? 'bg-emerald-600/80 text-white border-emerald-400/30'
                  : aiScore >= 40
                  ? 'bg-amber-600/80 text-white border-amber-400/30'
                  : 'bg-red-600/80 text-white border-red-400/30'
              }`}>
                <Bot size={11} />
                {aiScore}% Match
              </Badge>
            </div>
          )}
        </div>

        {/* ─── Card Body ─── */}
        <CardContent className="p-4 sm:p-5 flex flex-col gap-3">

          {/* Meta Row: Case # + Date + Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.15em] px-2 py-0.5 border border-white/5 rounded">
                #{claim.id.toString().padStart(4, '0')}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 border-l border-white/10">
                <Clock size={10} />
                {formattedDate}
              </div>
            </div>
            <Badge className={`${status.bg} ${status.text} ${status.border} px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shadow-[0_0_6px_currentColor]`} />
              {status.label}
            </Badge>
          </div>

          {/* Item Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors duration-500 leading-tight">
            {claim.item_title || 'General Item'}
          </h3>

          {/* Claimant Identity Block */}
          <div className="flex items-center gap-3 py-2.5 px-3.5 bg-white/[0.03] border border-white/5 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-uni-500/10 border border-uni-500/20 flex items-center justify-center text-uni-400 shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-white tracking-tight truncate">
                {claim.owner_name || `Student ID: ${claim.student_id}`}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Mail size={10} className="text-slate-600 shrink-0" />
                <p className="text-[10px] font-medium text-slate-500 truncate">
                  {claim.owner_email || 'Verified Account'}
                </p>
              </div>
            </div>
          </div>

          {/* Statement Preview */}
          {statementPreview && (
            <div className="flex items-start gap-2.5 py-2.5 px-3.5 bg-white/[0.03] border border-white/5 rounded-xl">
              <MessageSquareText size={11} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2 italic">
                "{statementPreview}"
              </p>
            </div>
          )}

          {/* Location + Found Date row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={9} /> Location
              </p>
              <p className="text-[11px] font-bold text-white truncate">{claim.item_location || 'Not specified'}</p>
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={9} /> Item Found
              </p>
              <p className="text-[11px] font-bold text-white truncate">{itemFoundDate || 'Unknown'}</p>
            </div>
          </div>

          {/* Review Action */}
          <div className="pt-1">
            <Button
              onClick={() => onReview(claim)}
              className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} />
                Review Claim
                <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ClaimCard;
