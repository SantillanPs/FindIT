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
  Info
} from "lucide-react";

/**
 * LostReportCard - Premium Professional (Pro Max)
 * - Refined cinematic glassmorphism.
 * - Human-centric labels (No more "Tactical Actions").
 * - High-legibility typography.
 */
const LostReportCard = ({ report, matches, navigate, setSearchTerm, onUpdate, isUpdating, onPreview }) => {
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
        </div>
      {/* 2. Main Content */}
      <CardContent className="p-4 sm:p-5 lg:p-8 flex flex-col flex-grow gap-5 sm:gap-6">
        
        {/* Title & Info Block */}
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-left min-w-0 flex-grow">
                 <div className="flex items-center gap-2 flex-wrap">
                     <Badge className="bg-uni-500/10 text-uni-400 border border-uni-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="text-xs">{categoryInfo.emoji}</span>
                        {report.category || 'General'}
                     </Badge>
                     <span className="text-[10px] font-bold text-slate-500 tracking-wider">#{report.id.toString().slice(-4)}</span>
                 </div>
                 <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors truncate">
                     {report.title}
                 </h3>
            </div>
            <Badge className={`px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border shrink-0 shadow-lg ${
                report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                report.status === 'dismissed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5'
            }`}>
               {report.status === 'reported' ? 'Awaiting Match' : report.status}
            </Badge>
        </div>

        {/* Data Grid */}
        <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="space-y-1.5 text-left">
                 <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Student Narrative</p>
                 <div 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className={`bg-white/5 p-3 rounded-lg border border-white/5 transition-all cursor-pointer group/desc hover:bg-white/10 ${isDescriptionExpanded ? 'ring-1 ring-uni-500/30' : ''}`}
                 >
                    <p className={`text-xs text-slate-200 leading-relaxed font-semibold transition-all ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                        "{report.description || 'No detailed description provided.'}"
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-uni-400/60 uppercase tracking-wide group-hover/desc:text-uni-400">
                        {isDescriptionExpanded ? <RotateCcw size={10} /> : <Info size={10} />}
                        {isDescriptionExpanded ? 'Collapse' : 'Show More'}
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Owner</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-uni-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
                        <p className="text-sm font-bold text-white truncate capitalize">{report.owner_name}</p>
                    </div>
                </div>

                <div className="space-y-1 text-left">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Reported On</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        <p className="text-sm font-bold text-white truncate">
                            {new Date(report.date_lost || report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>

                <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                         <PenLine size={12} className="text-uni-400" /> Internal Admin Notes
                     </div>
                    <div className="relative">
                        {isEditingNotes ? (
                           <Input 
                              autoFocus
                              className="h-12 bg-black border-uni-500/30 rounded-xl px-4 text-xs font-bold text-white focus-visible:ring-uni-500/20 transition-all"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              onBlur={handleNotesBlur}
                              onKeyDown={(e) => e.key === 'Enter' && handleNotesBlur()}
                              placeholder="Add internal notes..."
                           />
                        ) : (
                           <div 
                                onClick={() => setIsEditingNotes(true)}
                                className={`p-4 rounded-xl border border-white/5 transition-all min-h-[50px] flex items-center cursor-pointer hover:bg-white/5 ${notes ? 'bg-white/[0.02]' : 'border-dashed'}`}
                           >
                             <p className={`text-[11px] font-medium ${notes ? 'text-slate-300' : 'text-slate-600'}`}>
                                 {notes || "Click to document vetting notes..."}
                             </p>
                           </div>
                        )}
                    </div>
                </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto border-t border-white/5">
            <Button 
                onClick={() => {
                    navigate('/admin/matches');
                    setSearchTerm(`#${report.id.toString().slice(-4)}`);
                }}
                className={`flex-grow h-14 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl ${
                    bestScore > 0.8 && report.status === 'reported'
                    ? 'bg-uni-600 text-white hover:bg-uni-700' 
                    : 'bg-white text-slate-950 hover:bg-uni-600 hover:text-white'
                }`}
            >
                {reportMatches.length > 0 ? <ClipboardCheck size={18} /> : <Search size={18} />}
                {reportMatches.length > 0 ? `Analyze Matches` : 'Find Matches'}
                <ChevronRight size={14} className="ml-1 opacity-50" />
            </Button>

            {report.status === 'reported' ? (
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'resolved' })}
                        className="flex-grow sm:w-36 h-14 border-green-500/20 bg-green-500/5 text-green-500 font-bold text-[11px] uppercase tracking-widest hover:bg-green-600 hover:text-white rounded-xl"
                    >
                        {isUpdating ? <RotateCcw size={14} className="animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                        Resolve
                    </Button>
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'dismissed' })}
                        className="flex-grow sm:w-36 h-14 border-red-500/20 bg-red-500/5 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white rounded-xl"
                    >
                        {isUpdating ? <RotateCcw size={14} className="animate-spin" /> : <AlertCircle size={16} className="mr-2" />}
                        Dismiss
                    </Button>
                </div>
            ) : (
                <Button 
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={() => onUpdate(report.id, { status: 'reported' })}
                    className="flex-grow sm:w-auto px-6 h-14 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest border border-white/5"
                >
                    <RotateCcw size={14} className="mr-2" />
                    Reset Status
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LostReportCard;
