import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  User, 
  Globe, 
  Monitor, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
  StickyNote,
  XIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const FeedbackDetailDialog = ({ 
  feedback, 
  isOpen, 
  onClose, 
  notes, 
  setNotes, 
  onStatusUpdate,
  isPending 
}) => {
  if (!feedback) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-400 bg-orange-400/10';
      case 'under_review': return 'text-blue-400 bg-blue-400/10';
      case 'resolved': return 'text-emerald-400 bg-emerald-400/10';
      case 'dismissed': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const handleAction = (status) => {
    onStatusUpdate(feedback.id, status);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-sm bg-[#0B0F1A] border-white/10 p-0 overflow-hidden flex flex-col shadow-2xl rounded-3xl"
      >
        {/* Compact Header */}
        <DialogHeader className="p-4 border-b border-white/5 space-y-0.5 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${getStatusStyle(feedback.status)}`}>
               <Info size={14} />
            </div>
            <div>
               <DialogTitle className="text-xs font-bold text-white line-clamp-1 truncate max-w-[150px]">{feedback.subject}</DialogTitle>
               <DialogDescription className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                  #{feedback.id.toString().slice(-4)} • {format(new Date(feedback.created_at), 'MMM d, yy')}
               </DialogDescription>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-white/10 ${getStatusStyle(feedback.status)}`}>
             {feedback.status.replace('_', ' ')}
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/[0.02] rounded-xl border border-white/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-uni-500/10 flex items-center justify-center text-uni-400">
                    <User size={12} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white truncate">{feedback.user_name}</p>
                    <p className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter">Advocate</p>
                </div>
            </div>
            
            <div className="p-2 bg-white/[0.02] rounded-xl border border-white/5 flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Globe size={12} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold text-white truncate">
                        {feedback.page_url?.replace(window.location.origin, '') || '/home'}
                    </p>
                    <p className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter">{feedback.type}</p>
                </div>
            </div>
          </div>

          {/* Message Body */}
          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed italic">
             "{feedback.message}"
          </div>

          {/* Large Ledger Input (Focus area) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 px-1 opacity-70">
               <StickyNote size={8} className="text-uni-400" />
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Internal Ledger</p>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 focus:border-uni-500/30 outline-none transition-all resize-none font-medium placeholder:text-slate-800"
              placeholder="Record investigation findings..."
            />
          </div>
        </div>

        {/* Action Row - 3 Buttons with Auto-Save */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('under_review')}
              disabled={isPending}
              className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10"
            >
              Review
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleAction('resolved')}
              disabled={isPending}
              className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest bg-uni-500 text-white hover:bg-uni-600"
            >
              Resolve
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('dismissed')}
              disabled={isPending}
              className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
            >
              Dismiss
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDetailDialog;
