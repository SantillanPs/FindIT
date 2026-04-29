import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLostNarrative } from '../../../lib/lostItemAI';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Loader2, 
  CheckCircle2, 
  MessageSquare,
  History,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ITEM_ATTRIBUTES } from '../../../constants/attributes';

const LostReviewModal = ({ 
  report, 
  onClose, 
  onPublish, 
  isSubmitting 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: report.title || 'Lost Item Report',
    category: report.category || 'Miscellaneous',
    synthesized_description: report.synthesized_description || '',
    attributes: report.attributes || {}
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await analyzeLostNarrative(report.description);
      setFormData({
        title: results.suggested_title || formData.title,
        category: results.category,
        synthesized_description: results.synthesized_description,
        attributes: results.attributes || {}
      });
    } catch (err) {
      setError('AI Analysis failed. Please manually fill in the details.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    const payload = {
      ...formData,
      status: 'reported'
    };

    console.group('%c📋 [LostReview] APPROVE & PUBLISH', 'background: #065f46; color: #34d399; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.log('Report ID:', report.id);
    console.log('Payload:', payload);
    console.groupEnd();

    try {
      await onPublish(report.id, payload);
      // onClose is called by handleLostReportUpdate in AdminDashboard after success
    } catch (err) {
      console.error('[LostReview] Publish failed:', err);
      setError('Failed to publish. Please try again.');
    }
  };

  const attributeFields = ITEM_ATTRIBUTES[formData.category] || [];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/5 flex items-start justify-between shrink-0">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Review Lost Report</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-amber-500/5 text-amber-500 border-amber-500/20">Pending Review</Badge>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID #{report.id.toString().slice(-4)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Original Narrative Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Narrative</p>
              <Badge variant="ghost" className="text-[9px] text-slate-600 uppercase tracking-widest gap-1"><History size={10} /> Original Story</Badge>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 italic text-slate-300 text-sm leading-relaxed">
              "{report.description}"
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><MessageSquare size={12} /></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reported by: <span className="text-white">{report.owner_name}</span></p>
            </div>
          </div>

          {/* AI Trigger */}
          {!formData.synthesized_description && !isAnalyzing && (
            <button 
              onClick={handleAnalyze}
              className="w-full py-10 rounded-2xl border-2 border-dashed border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-white uppercase tracking-widest">Trigger AI Extraction</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Extract category, brand, and clean description</p>
                </div>
              </div>
            </button>
          )}

          {isAnalyzing && (
            <div className="py-20 flex flex-col items-center gap-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Running Forensic Analysis...</p>
            </div>
          )}

          {/* Forensic Results Panel */}
          {(formData.synthesized_description || isAnalyzing) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Forensic Extraction</p>
                <div className="h-[1px] flex-grow bg-blue-500/20"></div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] uppercase tracking-widest italic">AI Powered</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Proposed Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none appearance-none"
                  >
                    {Object.keys(ITEM_ATTRIBUTES).map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Synthesized Narrative</label>
                <textarea 
                  rows={4}
                  value={formData.synthesized_description} 
                  onChange={(e) => setFormData({...formData, synthesized_description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-medium text-slate-200 leading-relaxed focus:border-blue-500 outline-none resize-none"
                  placeholder="Clean version of the story for public matching..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Extracted Attributes</label>
                <div className="grid grid-cols-3 gap-3">
                  {['brand', 'color', 'model'].map(attr => (
                    <div key={attr} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{attr}</p>
                      <input 
                        type="text"
                        value={formData.attributes[attr] || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          attributes: { ...formData.attributes, [attr]: e.target.value }
                        })}
                        className="bg-transparent text-[10px] font-bold text-white w-full outline-none"
                        placeholder={`No ${attr}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="text-rose-500" />
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 shrink-0">
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handlePublish}
              disabled={isSubmitting || !formData.synthesized_description}
              className="flex-[2] py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-30"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Approve & Publish Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LostReviewModal;
