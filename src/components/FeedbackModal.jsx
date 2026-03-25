import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { domToPng } from 'modern-screenshot';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

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
    { id: 'bug', label: 'Report a Bug', icon: 'fa-bug', color: 'text-red-400' },
    { id: 'feature', label: 'New Feature', icon: 'fa-lightbulb', color: 'text-yellow-400' },
    { id: 'ux', label: 'User Experience', icon: 'fa-wand-magic-sparkles', color: 'text-blue-400' },
    { id: 'general', label: 'General Feedback', icon: 'fa-message', color: 'text-green-400' },
  ];

  const handleCapture = async () => {
    setIsCapturing(true);
    
    // Hide the modal root temporarily for a clean capture
    const modalElement = document.querySelector('.feedback-modal-root')?.parentElement;
    if (modalElement) modalElement.style.visibility = 'hidden';

    try {
      // modern-screenshot uses SVG foreignObject, which is a lot more accurate than html2canvas
      const dataUrl = await domToPng(document.body, {
        features: {
          // Disable filters if they cause issues, but generally it's better to keep them
        },
        scale: window.devicePixelRatio || 1,
        backgroundColor: '#0f172a',
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      
      setScreenshot(file);
      setPreviewUrl(dataUrl);

      if (modalElement) modalElement.style.visibility = 'visible';
    } catch (error) {
      console.error('Screenshot failed:', error);
      if (modalElement) modalElement.style.visibility = 'visible';
      // Removed alert
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
        const uploadData = new FormData();
        uploadData.append('file', screenshot);
        const uploadRes = await apiClient.post('/upload', uploadData);
        screenshotUrl = uploadRes.data.url;
      }

      await apiClient.post('/feedbacks', {
        ...formData,
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        browser_info: navigator.userAgent,
      });

      setFormData({ type: 'general', subject: '', message: '' });
      setScreenshot(null);
      setPreviewUrl(null);
      onClose();
      // Optional: replace with a nice toast icon in future
    } catch (error) {
      console.error('Failed to submit feedback', error);
      // Removed alert
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="feedback-modal-root relative w-full max-w-2xl bg-bg-surface border border-border-main rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-border-main flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-uni-500/10 rounded-2xl flex items-center justify-center text-uni-400">
                <i className="fa-solid fa-comment-dots text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-header">Institutional Feedback</h3>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">Direct line to the University Super Admin</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    formData.type === t.id
                      ? 'bg-uni-500/10 border-uni-500/30 ring-1 ring-uni-500/20'
                      : 'bg-white/5 border-white/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <i className={`fa-solid ${t.icon} text-lg ${t.color}`}></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your feedback in a few words..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-uni-500/50 transition-all outline-none"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please provide details. If this is a bug, mention the steps you took..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-uni-500/50 transition-all outline-none resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>

            {/* Screenshot Section */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Visual Attachments (Optional)</label>
              <div className="flex flex-wrap gap-4">
                {previewUrl ? (
                  <div className="relative group w-full h-48 rounded-2xl overflow-hidden border border-white/10">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        type="button" 
                        onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                        className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center border border-black/10 transform scale-75 group-hover:scale-100 transition-transform"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 w-full gap-4">
                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={handleCapture}
                      className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl bg-white/5 border border-dashed border-white/10 hover:border-uni-500/50 hover:bg-uni-500/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-uni-500 group-hover:text-white transition-all">
                        {isCapturing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1">Capture Screen</p>
                        <p className="text-[7px] text-slate-500 uppercase tracking-widest">Auto-Snapshot Current View</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl bg-white/5 border border-dashed border-white/10 hover:border-uni-500/50 hover:bg-uni-500/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-uni-500 group-hover:text-white transition-all">
                        <i className="fa-solid fa-upload"></i>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1">Upload Manual</p>
                        <p className="text-[7px] text-slate-500 uppercase tracking-widest">Image from storage</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleFileChange}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-border-main bg-white/[0.02] flex items-center justify-between">
            <div className="hidden sm:block">
               <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Archival Metadata Included</p>
               <p className="text-[7px] text-slate-600 uppercase tracking-widest mt-1">Browser version & full Page URL</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.subject || !formData.message}
                className="flex-grow sm:flex-grow-0 px-8 py-3 rounded-xl bg-gradient-to-r from-uni-600 to-uni-500 hover:from-uni-500 hover:to-uni-400 disabled:opacity-50 disabled:grayscale text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-black/5"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Sending Archive...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Seal and Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
