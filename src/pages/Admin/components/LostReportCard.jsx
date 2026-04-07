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
  Zap
} from "lucide-react";

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
    <Card className={`group bg-slate-900/40 backdrop-blur-md rounded-[2rem] border-white/5 overflow-hidden flex flex-col transition-all duration-500 hover:bg-slate-900/60 hover:border-uni-500/30 ${
        bestScore > 0.8 && report.status === 'reported' ? 'ring-2 ring-uni-500/20' : ''
    }`}>
      {/* 1. Visual Header */}
      <div className={`relative overflow-hidden bg-slate-950/20 transition-all duration-700 ${
        report.photo_url ? 'aspect-[21/9]' : 'h-32'
      }`}>
        {report.photo_url ? (
          <div className="relative w-full h-full">
            <img 
              src={report.photo_url} 
              alt={report.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
            <button 
                onClick={() => onPreview(report.photo_url)}
                className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Maximize2 className="text-white" size={20} />
                </div>
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-between px-10 bg-gradient-to-br from-slate-900 to-slate-950">
             <div className="text-5xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                {categoryInfo.emoji}
             </div>
             <div className="text-right">
                 <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                   Registry <br/> Metadata
                 </div>
             </div>
          </div>
        )}

        <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
             <Badge className="bg-slate-950/60 backdrop-blur-md text-white border-white/10 px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider">
                 {report.category || 'General'}
             </Badge>
            {reportMatches.length > 0 && (
                <Badge className="bg-uni-600 text-white border-none px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-uni-600/20">
                   <Zap size={12} className="fill-current" />
                   {reportMatches.length} Matches Found
                </Badge>
            )}
        </div>

        <div className="absolute top-5 right-5 z-20">
             <Badge variant="outline" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider bg-slate-950/20 border-white/10 py-1 px-3">
                 Case: #{report.id.toString().padStart(4, '0')}
             </Badge>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
      </div>

      {/* 2. Content */}
      <CardContent className="p-8 pb-10 relative flex flex-col flex-grow">
        <div className="absolute -top-7 left-10 w-14 h-14 bg-slate-900 rounded-2xl border-4 border-slate-950 flex items-center justify-center z-30 shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-uni-500/20 to-transparent"></div>
            <span className="text-2xl relative z-10">{categoryInfo.emoji}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="text-left">
                 <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors">
                     {report.location}
                 </h3>
                 <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mt-1">Case Registry Record & Intelligence</p>
            </div>
            <div className="flex items-center gap-3">
                 <Badge className={`px-4 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border transition-all ${
                    report.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/5' : 
                    report.status === 'dismissed' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5' : 
                    'bg-uni-600/10 text-uni-400 border-uni-500/20 shadow-uni-600/5'
                 }`}>
                    {report.status}
                 </Badge>
            </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 border-t border-white/5 pt-8">
            <div className="space-y-6 text-left">
                <div className="space-y-3">
                     <div className="flex items-center gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                         <FileText size={14} className="text-uni-400" /> Incident Description
                     </div>
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 min-h-[80px]">
                        <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                            "{report.description || 'No detailed student narrative recorded.'}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5">
                        <User size={18} className="text-slate-600" />
                    </div>
                     <div>
                         <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Reporter</p>
                         <p className="text-[13px] font-bold text-white tracking-wider mt-0.5">{report.owner_name}</p>
                     </div>
                </div>
            </div>

            <div className="space-y-6 text-left">
                <div className="flex items-center gap-4 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5">
                        <Calendar size={18} className="text-slate-600" />
                    </div>
                     <div>
                         <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Temporal Marker</p>
                         <p className="text-[13px] font-bold text-white tracking-wider mt-0.5">
                             {new Date(report.date_lost).toLocaleDateString()} <span className="text-slate-500 mx-2">•</span> {new Date(report.date_lost).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                     </div>
                </div>

                <div className="space-y-3">
                     <div className="flex items-center gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                         <PenLine size={14} className="text-uni-400" /> Internal Vetting Notes
                     </div>
                    <div className="relative">
                        {isEditingNotes ? (
                           <Input 
                              autoFocus
                              className="h-14 bg-slate-950 border-uni-500/30 rounded-xl px-4 text-[13px] font-bold text-white focus-visible:ring-uni-500/30 transition-all font-sans"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              onBlur={handleNotesBlur}
                              onKeyDown={(e) => e.key === 'Enter' && handleNotesBlur()}
                              placeholder="ENCRYPTED INTERNAL NOTES..."
                           />
                        ) : (
                           <div 
                               onClick={() => setIsEditingNotes(true)}
                               className={`p-5 rounded-2xl border border-white/5 transition-all min-h-[60px] flex items-center cursor-pointer hover:bg-slate-900/50 group/notes ${notes ? 'bg-slate-950/30' : 'bg-transparent border-dashed'}`}
                           >
                             <p className={`text-[13px] font-medium leading-relaxed ${notes ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                                 {notes || "Click to add administrative documentation..."}
                             </p>
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Tactical Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-auto border-t border-white/5">
            <Button 
                onClick={() => {
                    navigate('/admin/matches');
                    setSearchTerm(`#${report.id.toString().padStart(4, '0')}`);
                }}
                className={`flex-grow h-14 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                    bestScore > 0.8 && report.status === 'reported'
                    ? 'bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20' 
                    : 'bg-slate-900/50 text-slate-300 border border-white/10 hover:bg-slate-900 hover:text-white'
                }`}
            >
                {reportMatches.length > 0 ? <ClipboardCheck size={18} /> : <Search size={18} />}
                <span>{reportMatches.length > 0 ? `Analyze ${reportMatches.length} Match Candidates` : 'Cross-Reference Registry'}</span>
                <ChevronRight size={16} className="ml-1 opacity-50" />
            </Button>

            {report.status === 'reported' ? (
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'resolved' })}
                        className="flex-grow sm:w-40 h-14 bg-green-500/5 hover:bg-green-500 hover:text-white text-green-400 border-green-500/20 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                        {isUpdating ? <RotateCcw size={16} className="animate-spin" /> : <CheckCircle2 size={18} className="mr-2" />}
                        Resolve
                    </Button>
                    <Button 
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onUpdate(report.id, { status: 'dismissed' })}
                        className="flex-grow sm:w-40 h-14 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 border-red-500/20 rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                        {isUpdating ? <RotateCcw size={16} className="animate-spin" /> : <AlertCircle size={18} className="mr-2" />}
                        Dismiss
                    </Button>
                </div>
            ) : (
                <Button 
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={() => onUpdate(report.id, { status: 'reported' })}
                    className="flex-grow sm:w-auto px-8 h-14 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-2xl text-[13px] font-bold uppercase tracking-wider transition-all border border-white/10"
                >
                    <RotateCcw size={16} className="mr-2" />
                    Revert to Active Registry
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LostReportCard;
