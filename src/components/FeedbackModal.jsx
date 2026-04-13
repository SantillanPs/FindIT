import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Sparkles, 
  Upload, 
  Trash2, 
  X, 
  Send,
  Loader2,
  AlertCircle,
  ImagePlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FeedbackModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const types = [
    { id: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400', activeBg: 'bg-red-500/15', activeBorder: 'border-red-500/40', activeRing: 'ring-red-500/20' },
    { id: 'feature', label: 'Feature', icon: Lightbulb, color: 'text-amber-400', activeBg: 'bg-amber-500/15', activeBorder: 'border-amber-500/40', activeRing: 'ring-amber-500/20' },
    { id: 'ux', label: 'UX', icon: Sparkles, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15', activeBorder: 'border-cyan-500/40', activeRing: 'ring-cyan-500/20' },
    { id: 'general', label: 'General', icon: MessageSquare, color: 'text-uni-400', activeBg: 'bg-uni-500/15', activeBorder: 'border-uni-500/40', activeRing: 'ring-uni-500/20' },
  ];



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `feedback/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        screenshotUrl = publicUrl;
      }

      const { error } = await supabase
        .from('feedbacks')
        .insert([{
          ...formData,
          screenshot_url: screenshotUrl,
          page_url: window.location.href,
          browser_info: navigator.userAgent,
          user_id: user?.id || null,
          status: 'pending'
        }]);

      if (error) throw error;

      setFormData({ type: 'general', subject: '', message: '' });
      setScreenshot(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback to Supabase', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "w-[calc(100%-40px)] mx-auto max-w-md bg-slate-900 border border-slate-700/50 shadow-2xl",
          "overflow-hidden flex flex-col rounded-[24px]",
          "data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-[48%]",
          "duration-300"
        )}
      >
        {/* Compact Header */}
        <div className="px-5 pt-5 pb-3 flex items-center gap-3 shrink-0 border-b border-slate-700/40">
          <div className="w-10 h-10 bg-uni-500/10 rounded-xl flex items-center justify-center text-uni-400 ring-1 ring-uni-500/25 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-[15px] font-bold text-white tracking-tight italic uppercase leading-tight">
              Institutional Feedback
            </DialogTitle>
            <DialogDescription className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">
              Direct channel to Super Admin
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="px-5 pt-4 pb-4 space-y-4 overflow-y-auto flex-grow custom-scrollbar overscroll-contain">

            {/* Type Selector — Horizontal scrollable pills for thumb-reach */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide mask-horizontal-fade">
              {types.map((t) => {
                const Icon = t.icon;
                const isActive = formData.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap transition-all duration-200 shrink-0",
                      "active:scale-[0.96] touch-manipulation",
                      isActive
                        ? `${t.activeBg} ${t.activeBorder} ring-1 ${t.activeRing}`
                        : "bg-slate-800/60 border-slate-700/40 opacity-75 active:opacity-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? t.color : "text-slate-400")} />
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wide",
                      isActive ? "text-white" : "text-slate-400"
                    )}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</Label>
              <Input
                required
                placeholder="What's this about?"
                className="h-12 bg-slate-800 border-slate-700/60 rounded-xl focus:ring-uni-500/30 focus:border-uni-500/40 text-[15px] text-slate-100 font-medium placeholder:text-slate-500 transition-all"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</Label>
              <Textarea
                required
                rows={4}
                placeholder="Describe your feedback. For bugs, include steps to reproduce..."
                className="bg-slate-800 border-slate-700/60 rounded-xl focus:ring-uni-500/30 focus:border-uni-500/40 text-[15px] text-slate-100 leading-relaxed placeholder:text-slate-500 transition-all resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            {/* Visual Evidence — compact */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Screenshot <span className="text-slate-500 normal-case font-medium">(optional)</span>
              </Label>
              
              {previewUrl ? (
                <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                    className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 active:scale-90 transition-transform touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-dashed bg-slate-800/40 border-slate-600/40 active:bg-slate-700/60 active:scale-[0.98] touch-manipulation transition-all"
                  >
                    <ImagePlus className="w-5 h-5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Upload Screenshot</span>
                  </button>
              )}
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Sticky Footer — full-width primary CTA */}
          <div className="px-5 py-4 border-t border-slate-700/40 bg-slate-900/80 backdrop-blur-xl shrink-0 safe-area-bottom">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="h-12 px-5 rounded-xl text-slate-400 active:text-white active:bg-slate-700/50 text-[11px] font-bold uppercase tracking-wider transition-all touch-manipulation shrink-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.subject || !formData.message}
                className={cn(
                  "flex-1 h-12 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.15em]",
                  "bg-gradient-to-r from-uni-600 to-uni-500 active:from-uni-500 active:to-uni-400",
                  "shadow-[0_4px_24px_rgba(var(--uni-primary-rgb),0.25)]",
                  "disabled:opacity-40 disabled:shadow-none",
                  "transition-all flex items-center justify-center gap-2.5 border-none",
                  "active:scale-[0.98] touch-manipulation"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              <AlertCircle className="w-3 h-3 text-slate-700" />
              <p className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">
                Page URL & device info auto-attached
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
