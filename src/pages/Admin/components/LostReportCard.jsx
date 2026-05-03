import { useState } from 'react';
import { imageCache } from '../../../lib/imageCache';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Maximize2,
  AlertCircle,
  PenLine,
  ChevronRight,
  ClipboardCheck,
  Zap,
  Clock,
  Info,
  Archive,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";

/**
 * LostReportCard - Premium Professional (Pro Max)
 * - Refined cinematic glassmorphism.
 * - Human-centric labels (No more "Tactical Actions").
 * - High-legibility typography.
 */
const LostReportCard = ({ report, matches, navigate, setSearchTerm, onUpdate, onReview, onToggleVisibility, isUpdating, isTogglingVisibility, onPreview }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [notes, setNotes] = useState(report.admin_notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imgError, setImgError] = useState(imageCache.isFailed(report.photo_url));

  const reportMatches = matches.filter(m => m.top_matches.some(tm => tm.item.id === report.id));
  const bestScore = reportMatches.length > 0 
    ? Math.max(...reportMatches.map(m => m.top_matches.find(tm => tm.item.id === report.id).similarity_score))
    : 0;

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    if (notes !== report.admin_notes) {
      onUpdate(report.id, { admin_notes: notes });
    }
  };

  const categoryInfo = CATEGORIES.find(c => c.id === report.category) || { label: 'General', emoji: '🔍' };

  return (
    <Card className={`group bg-slate-900/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] border-white/5 overflow-hidden flex flex-col transition-all duration-500 hover:bg-slate-900/60 ${
        bestScore > 0.8 && report.status === 'reported' ? 'ring-1 ring-uni-500/30' : ''
    }`}>
      {/* 1. Visual Header Section */}
      <div className={`relative overflow-hidden bg-black transition-all duration-700 ${
        report.photo_url ? 'aspect-[21/9]' : 'h-16 sm:h-20'
      }`}>
        {report.photo_url ? (
          <div className="relative w-full h-full">
            {report.photo_url && !imgError ? (
              <img 
                src={report.photo_url} 
                alt={report.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                onError={() => { imageCache.markFailed(report.photo_url); setImgError(true); }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-between px-5 sm:px-8 bg-gradient-to-br from-slate-900 to-black">
                <div className="text-2xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                    {categoryInfo.emoji}
                </div>
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    IMAGE UNAVAILABLE
                </div>
              </div>
            )}
            <button 
                onClick={() => onPreview(report.photo_url)}
                className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Maximize2 className="text-white" size={18} />
                </div>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-between px-5 sm:px-8 bg-gradient-to-br from-slate-900 to-black">
             <div className="text-2xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                {categoryInfo.emoji}
             </div>
             <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                PROFILE ASSET
             </div>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2">
             <Badge className="bg-slate-950/60 backdrop-blur-md text-white border-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                 <span className="text-sm">{categoryInfo.emoji}</span>
                 {report.category || 'General'}
             </Badge>
            {reportMatches.length > 0 && (
                <Badge className="bg-uni-600 text-white border-none px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                   <Zap size={11} className="fill-current" />
                   {reportMatches.length} Matches
                </Badge>
            )}
        </div>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(report);
                }}
                disabled={isTogglingVisibility}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-lg ${
                    report.is_public 
                        ? 'bg-uni-500/20 text-uni-400 border-uni-500/20 hover:bg-uni-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30'
                }`}
                title={report.is_public ? "Public: Visible on Landing" : "Private: Hidden from Landing"}
            >
                {isTogglingVisibility ? (
                    <RefreshCw size={16} className="animate-spin opacity-50" />
                ) : (
                    report.is_public ? <Eye size={18} /> : <EyeOff size={18} />
                )}
            </button>
        </div>
        </div>
      {/* 2. Main Content */}
      <CardContent className="p-3 sm:p-4 flex flex-col flex-grow gap-4 sm:gap-5">
        
        {/* Title & Info Block */}
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 text-left min-w-0 flex-grow">
                 <div className="flex items-center gap-1.5 flex-wrap">
                     <Badge className="bg-uni-500/10 text-uni-400 border-none px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1">
                        <span>{categoryInfo.emoji}</span>
                        {report.category || 'General'}
                     </Badge>
                     {report.is_manual_entry && (
                        <Badge className="bg-uni-500/20 text-uni-400 border-none px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
                           <Archive size={10} />
                           Archive
                        </Badge>
                     )}
                 </div>
                 <div className="flex items-center gap-2">
                     <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors truncate">
                         {report.title}
                     </h3>
                     <span className="text-[10px] font-medium text-slate-500 shrink-0">#{report.id.toString().slice(-4)}</span>
                 </div>
            </div>
            <Badge className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border-none shrink-0 ${
                report.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 
                report.status === 'dismissed' ? 'bg-red-500/10 text-red-400' : 
                'bg-amber-500/10 text-amber-500'
            }`}>
               {report.status === 'reported' ? 'Awaiting Match' : 
                report.status === 'pending_review' ? 'Needs Vetting' : 
                report.status}
            </Badge>
        </div>

        {/* Data Grid */}
        <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="space-y-1 text-left">
                 <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        {report.synthesized_description ? <><span className="text-uni-400">✨</span> AI Synthesized</> : <><FileText size={10} /> Student Narrative</>}
                    </p>
                 </div>
                 <div 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="cursor-pointer group/desc"
                 >
                    <p className={`text-[12px] text-slate-300 leading-snug transition-all ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                        {report.synthesized_description || report.description || 'No detailed description provided.'}
                    </p>
                 </div>
            </div>

            {/* AI Attributes Quick Look */}
            {report.attributes && Object.keys(report.attributes).length > 0 && (
                <div className="flex flex-wrap gap-1.5 py-0.5">
                    {[
                        ...(report.brand ? [['brand', report.brand]] : []),
                        ...(report.model ? [['model', report.model]] : []),
                        ...Object.entries(report.attributes).filter(([k, v]) => !['brand', 'model'].includes(k) && v && v !== 'Unknown')
                    ].map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded text-[9px]">
                            <span className="text-slate-500 uppercase font-bold">{key}:</span>
                            <span className="text-slate-200 font-bold">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                    <User size={12} className="text-uni-400" />
                    <span className="font-medium text-white capitalize truncate max-w-[100px]">{report.owner_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-emerald-400" />
                    <span className="font-medium text-white">
                        {new Date(report.date_lost || report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>

        {/* Admin Notes Inline */}
        <div className="group/notes pt-3 border-t border-white/5">
            {isEditingNotes ? (
                <Input 
                    autoFocus
                    className="h-8 bg-black/50 border-uni-500/30 rounded px-2 text-[11px] text-white focus-visible:ring-uni-500/20 transition-all"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotesBlur()}
                    placeholder="Add internal notes..."
                />
            ) : (
                <div 
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300 transition-colors"
                >
                    <PenLine size={10} className={notes ? 'text-uni-400' : ''} />
                    <p className={`text-[10px] font-medium truncate ${notes ? 'text-slate-300' : ''}`}>
                        {notes || "Add internal note..."}
                    </p>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-2 pt-3 mt-auto">
            <Button 
                onClick={() => onReview(report)}
                className="w-full h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-xl bg-uni-600 text-white hover:bg-uni-500"
            >
                <PenLine size={14} />
                {report.status === 'pending_review' ? 'Review & Publish' : 'Edit Report'}
            </Button>

            {report.status === 'reported' && (
                <div className="flex gap-2 w-full">
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'resolved' })}
                        className="flex-1 h-9 border-green-500/20 bg-green-500/5 text-green-500 font-bold text-[9px] uppercase tracking-widest hover:bg-green-600 hover:text-white rounded-lg"
                    >
                        {isUpdating ? <RotateCcw size={12} className="animate-spin" /> : <CheckCircle2 size={12} className="mr-1.5" />}
                        Resolve
                    </Button>
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'dismissed' })}
                        className="flex-1 h-9 border-red-500/20 bg-red-500/5 text-red-500 font-bold text-[9px] uppercase tracking-widest hover:bg-red-600 hover:text-white rounded-lg"
                    >
                        {isUpdating ? <RotateCcw size={12} className="animate-spin" /> : <AlertCircle size={12} className="mr-1.5" />}
                        Dismiss
                    </Button>
                </div>
            )}
            
            {report.status !== 'reported' && report.status !== 'pending_review' && (
                <Button 
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={() => onUpdate(report.id, { status: 'reported' })}
                    className="w-full h-9 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/5"
                >
                    <RotateCcw size={12} className="mr-1.5" />
                    Reset Status
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LostReportCard;
