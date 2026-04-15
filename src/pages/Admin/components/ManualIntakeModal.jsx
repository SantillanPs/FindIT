import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  X, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ShieldCheck, 
  Save,
  AlertCircle,
  Archive,
  Camera,
  Plus
} from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';
import { ITEM_ATTRIBUTES } from '../../../constants/attributes';

/**
 * ManualIntakeModal - Premium Professional (Pro Max)
 * - Allows admins to archive physical lost/found reports.
 * - Bridges paper-trail with digital registry.
 * - Clean, high-impact form design.
 */
const ManualIntakeModal = ({ isOpen, onClose, onSubmit, actionLoading }) => {
  const [type, setType] = useState('found'); // 'found' or 'lost'
  const [showPulse, setShowPulse] = useState(false);
  const titleInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    reporter_name: '',
    assisted_by: '',
    photo_url: '',
  });

  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => setShowPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showPulse]);

  if (!isOpen) return null;

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      reporter_name: '',
      assisted_by: '',
      photo_url: '',
    });
  };

  const handleSubmit = (e, isNext = false) => {
    if (e) e.preventDefault();
    onSubmit({
      ...form,
      type,
      // Metadata for manual entry
      is_manual_entry: true,
      status: type === 'found' ? 'in_custody' : 'open',
      isNext
    });
    if (isNext) {
      resetForm();
      setShowPulse(true);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 isolate">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ 
          scale: showPulse ? [1, 1.02, 1] : 1,
          opacity: 1, 
          y: 0,
          boxShadow: showPulse ? [
            "0 0 0 0px rgba(59, 130, 246, 0)",
            "0 0 0 20px rgba(59, 130, 246, 0.4)",
            "0 0 0 40px rgba(59, 130, 246, 0)"
          ] : "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] relative z-10 shadow-3xl flex flex-col overflow-hidden max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center border border-uni-500/20 text-uni-400">
              <Archive size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Manual Archive Intake</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Physical Record Bridge</p>
            </div>
          </div>
          
          <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/10 w-fit">
            <button 
              onClick={() => setType('found')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${type === 'found' ? 'bg-uni-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Found
            </button>
            <button 
              onClick={() => setType('lost')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${type === 'lost' ? 'bg-uni-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Lost
            </button>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto no-scrollbar p-8 md:p-10 space-y-10">
          
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-uni-500"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reporter Identification</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{type === 'found' ? 'Found By' : 'Reported By'}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    required
                    type="text" 
                    placeholder="Physical form name..."
                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all shadow-inner"
                    value={form.reporter_name}
                    onChange={e => setForm({...form, reporter_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assisted By (Admin)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-uni-400" size={16} />
                  <input 
                    required
                    type="text" 
                    placeholder="Staff on paper..."
                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-bold text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all shadow-inner"
                    value={form.assisted_by}
                    onChange={e => setForm({...form, assisted_by: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-uni-500"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Item Title / Headline</label>
                <input 
                  ref={titleInputRef}
                  required
                  type="text" 
                  placeholder="e.g. Black Leather Wallet"
                  className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl px-6 text-sm font-bold text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all shadow-inner"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  required
                  className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:border-uni-500/50 outline-none appearance-none cursor-pointer [&>option]:text-slate-900"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="" className="text-slate-500">Select Category</option>
                  {Object.keys(ITEM_ATTRIBUTES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{type === 'found' ? 'Location Found' : 'Last Seen At'}</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input 
                    required
                    type="text" 
                    placeholder="Building / Room..."
                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all shadow-inner"
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea 
                required
                placeholder="Transcribe the physical description here..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none min-h-[120px] transition-all resize-none shadow-inner"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>

            {/* Visual Evidence Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full bg-uni-500"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Visual Evidence {type === 'found' && <span className="text-red-500 ml-1 italic">*Required</span>}
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                <ImageUpload
                  value={form.photo_url}
                  onUploadSuccess={(url) => setForm({ ...form, photo_url: url })}
                  description={type === 'found' ? "Upload actual photo of the found item" : "Reference photo (optional)"}
                />
              </div>
            </div>
          </div>

          {/* Temporal Data */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-uni-500"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historical Timing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Report Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-uni-400" size={16} />
                  <input 
                    required
                    type="date" 
                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-bold text-white focus:border-uni-500/50 outline-none transition-all [color-scheme:dark]"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Time Noted (Optional)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. 2:30 PM"
                    className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all"
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.1em]">Verification Notice</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                This record will bypass the standard review protocol and go straight to <span className="text-white font-bold uppercase">{type === 'found' ? 'IN CUSTODY' : 'ACTIVE LOST'}</span>. Ensure physical form data is transcribed accurately.
              </p>
            </div>
          </div>
        </form>

        {/* Footer - Optimized for High-Density Mobile (Pro Max) */}
        <div className="p-4 md:p-8 border-t border-white/5 bg-slate-900/80 backdrop-blur-sm flex flex-row items-center gap-2">
           <button 
            type="button"
            onClick={onClose} 
            className="px-4 h-12 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Discard
          </button>

          <div className="flex-1 flex items-center gap-2">
            <button 
              type="button"
              onClick={() => handleSubmit(null, true)}
              disabled={actionLoading || (type === 'found' && !form.photo_url)}
              className="flex-1 h-12 text-[10px] font-bold text-uni-400 bg-uni-500/10 hover:bg-uni-500/20 rounded-xl uppercase tracking-widest transition-all border border-uni-500/20 disabled:opacity-50"
            >
              Next
            </button>

            <button 
              onClick={handleSubmit}
              disabled={actionLoading || (type === 'found' && !form.photo_url)}
              className="flex-[1.5] h-12 bg-uni-500 hover:bg-uni-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-uni-500/20 transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Store
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManualIntakeModal;
