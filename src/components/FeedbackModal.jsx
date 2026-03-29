import React, { useState, useRef } from 'react';
import { domToPng } from 'modern-screenshot';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Sparkles, 
  Camera, 
  Upload, 
  Trash2, 
  X, 
  Send,
  Loader2,
  AlertCircle
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const types = [
    { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 'feature', label: 'New Feature', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { id: 'ux', label: 'User Experience', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ];

  const handleCapture = async () => {
    setIsCapturing(true);
    
    const modalElement = document.querySelector('[role="dialog"]');
    if (modalElement) modalElement.style.visibility = 'hidden';

    try {
      const dataUrl = await domToPng(document.body, {
        scale: window.devicePixelRatio || 1,
        backgroundColor: '#020617', // Match dark theme
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      
      setScreenshot(file);
      setPreviewUrl(dataUrl);

      if (modalElement) modalElement.style.visibility = 'visible';
    } catch (error) {
      console.error('Screenshot failed:', error);
      if (modalElement) modalElement.style.visibility = 'visible';
    } finally {
      setIsCapturing(false);
    }
  };

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
      <DialogContent className="max-w-xl bg-slate-900/40 backdrop-blur-2xl border-white/10 shadow-2xl p-0 overflow-hidden rounded-[24px] max-h-[90vh] flex flex-col ring-1 ring-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.03] to-transparent shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uni-500/10 rounded-xl flex items-center justify-center text-uni-400 ring-1 ring-uni-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight italic uppercase">Institutional Feedback</DialogTitle>
              <DialogDescription className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Direct channel to University Super Admin</DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
            {/* Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {types.map((t) => {
                const Icon = t.icon;
                const isActive = formData.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-[16px] border transition-all duration-300",
                      isActive
                        ? "bg-uni-500/10 border-uni-500/40 ring-1 ring-uni-500/20 shadow-[0_0_20px_rgba(var(--uni-primary-rgb),0.1)]"
                        : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100 hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? t.color : "text-slate-400")} />
                    <span className={cn("text-[8px] font-black uppercase tracking-widest text-center", isActive ? "text-white" : "text-slate-500")}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subject Line</Label>
                <Input
                  required
                  placeholder="Summarize your feedback..."
                  className="h-10 bg-white/5 border-white/10 rounded-lg focus:ring-uni-500/30 transition-all italic font-medium"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Message Body</Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Provide detailed context. For bugs, include steps to reproduce..."
                  className="bg-white/5 border-white/10 rounded-xl focus:ring-uni-500/30 transition-all leading-relaxed"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>

            {/* Screenshot Section */}
            <div className="space-y-3">
              <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visual Evidence (Optional)</Label>
              {previewUrl ? (
                <div className="relative group w-full h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <Button 
                      type="button" 
                      variant="destructive"
                      size="icon"
                      onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                      className="w-10 h-10 rounded-full border border-white/10 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={handleCapture}
                    className="group/capture h-24 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-uni-500/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                  >
                    {isCapturing ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-500 group-hover/capture:text-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/capture:text-white group-hover/capture:bg-uni-500/20 transition-all">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-[10px] font-black text-slate-500 group-hover/capture:text-white uppercase tracking-widest italic relative z-10 transition-colors">Capture Screen</span>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group/upload h-24 rounded-2xl border border-dashed border-white/10 bg-slate-900/20 hover:bg-slate-900/40 hover:border-uni-500/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/upload:text-white group-hover/upload:bg-uni-500/20 transition-all">
                        <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 group-hover/upload:text-white uppercase tracking-widest italic transition-colors">Upload Evidence</span>
                  </div>
                </div>
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
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <div className="hidden sm:block space-y-1">
             <div className="flex items-center gap-2">
               <AlertCircle className="w-3 h-3 text-slate-600" />
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Metadata Encrypted</p>
             </div>
             <p className="text-[8px] text-slate-600 uppercase tracking-[0.15em] font-medium ml-5">Browser & Page URL included</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-grow sm:flex-grow-0 h-10 px-6 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit" // Changed to submit to trigger form onSubmit
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.subject || !formData.message}
              className="flex-grow sm:flex-grow-0 h-10 px-8 rounded-lg bg-gradient-to-br from-uni-600 to-uni-500 hover:from-uni-500 hover:to-uni-400 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(var(--uni-primary-rgb),0.3)] transition-all flex items-center justify-center gap-2 border-none group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transmitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Seal and Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
