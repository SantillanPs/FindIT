import React, { useState } from 'react';
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
  Archive
} from 'lucide-react';
import { ITEM_ATTRIBUTES } from '../../../constants/attributes';

/**
 * ManualIntakeModal - Premium Professional (Pro Max)
 * - Allows admins to archive physical lost/found reports.
 * - Bridges paper-trail with digital registry.
 * - Clean, high-impact form design.
 */
const ManualIntakeModal = ({ isOpen, onClose, onSubmit, actionLoading }) => {
  const [type, setType] = useState('found'); // 'found' or 'lost'
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    reporter_name: '',
    assisted_by: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      type,
      // Metadata for manual entry
      is_manual_entry: true,
      status: type === 'found' ? 'in_custody' : 'open'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] relative z-10 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
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

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-slate-900/80 backdrop-blur-sm flex flex-row items-center gap-4">
           <button 
            type="button"
            onClick={onClose} 
            className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all bg-white/5 rounded-2xl hover:bg-white/10"
           >
            Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={actionLoading}
             className="flex-1 bg-white hover:bg-uni-600 hover:text-white text-slate-950 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-3 active:scale-[0.98]"
           >
             {actionLoading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
             {actionLoading ? 'Archiving...' : `Store Physical ${type === 'found' ? 'Found' : 'Lost'} Record`}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManualIntakeModal;
