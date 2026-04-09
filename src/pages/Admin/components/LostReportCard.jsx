import { useState } from 'react';
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
        report.photo_url ? 'aspect-[21/9]' : 'h-24 md:h-28'
      }`}>
        {report.photo_url ? (
          <div className="relative w-full h-full">
            <img 
              src={report.photo_url} 
              alt={report.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
            />
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
          <div className="w-full h-full flex items-center justify-between px-8 bg-gradient-to-br from-slate-900 to-black">
             <div className="text-4xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                {categoryInfo.emoji}
             </div>
             <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                Report Profile
             </div>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
             <Badge className="bg-slate-950/60 backdrop-blur-md text-white border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                 {report.category || 'General'}
             </Badge>
            {reportMatches.length > 0 && (
                <Badge className="bg-uni-600 text-white border-none px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-2">
                   <Zap size={11} className="fill-current" />
                   {reportMatches.length} Matches
                </Badge>
            )}
        </div>

        <div className="absolute top-4 right-4 z-20">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                 #{report.id.toString().slice(-4)}
             </span>
        </div>
      </div>

      {/* 2. Main Content */}
      <CardContent className="p-5 md:p-8 flex flex-col flex-grow gap-6">
        
        {/* Title & Info Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                 <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors">
                     {report.title}
                 </h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lost Report History & Vetting</p>
            </div>
            <div className="flex items-center gap-3">
                 <Badge className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                     report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                     report.status === 'dismissed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                     'bg-amber-500/10 text-amber-500 border-amber-500/20'
                 }`}>
                    {report.status === 'reported' ? 'Awaiting Match' : report.status}
                 </Badge>
            </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="space-y-4">
                <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                         <FileText size={12} className="text-uni-400" /> Student's Narrative
                     </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-h-[70px]">
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            "{report.description || 'No detailed description provided.'}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center border border-white/5">
                        <User size={16} className="text-slate-500" />
                    </div>
                     <div>
                         <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Owner</p>
                         <p className="text-xs font-bold text-slate-200">{report.owner_name}</p>
                     </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center border border-white/5">
                        <Calendar size={16} className="text-slate-500" />
                    </div>
                     <div>
                         <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Date Reported</p>
                         <p className="text-xs font-bold text-slate-200">
                             {new Date(report.date_lost || report.created_at).toLocaleDateString()}
                         </p>
                     </div>
                </div>

                <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
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
            </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto border-t border-white/5">
            <Button 
                onClick={() => {
                    navigate('/admin/matches');
                    setSearchTerm(`#${report.id.toString().slice(-4)}`);
                }}
                className={`flex-grow h-14 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl ${
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
                        className="flex-grow sm:w-36 h-14 border-green-500/20 bg-green-500/5 text-green-500 font-bold text-[9px] uppercase tracking-widest hover:bg-green-600 hover:text-white rounded-xl"
                    >
                        {isUpdating ? <RotateCcw size={14} className="animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                        Resolve
                    </Button>
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'dismissed' })}
                        className="flex-grow sm:w-36 h-14 border-red-500/20 bg-red-500/5 text-red-500 font-bold text-[9px] uppercase tracking-widest hover:bg-red-600 hover:text-white rounded-xl"
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
                    className="flex-grow sm:w-auto px-6 h-14 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/5"
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
