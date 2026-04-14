import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Send, Shield, ShieldOff, User, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

const WitnessReportModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `witnesses/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (error) {
      console.error('Upload to Supabase failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    if (!user && (!guestName.trim() || !guestEmail.trim())) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('witness_reports')
        .insert([{
          lost_item_id: report.id,
          reporter_id: user?.id || null,
          witness_description: description,
          witness_photo_url: photoUrl,
          is_anonymous: isAnonymous,
          guest_name: user ? null : guestName,
          guest_email: user ? null : guestEmail,
          status: 'pending'
        }]);

      if (error) throw error;

      onSuccess('Witness report logged. USG staff will verify this information.');
      onClose();
      setDescription('');
      setPhotoUrl('');
      setIsAnonymous(false);
      setGuestName('');
      setGuestEmail('');
    } catch (error) {
      console.error('Submission to Supabase failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Report as Witness</h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Item ID/Asset: {report.id}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Guest Info Section */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-[2rem] bg-white/5 border border-white/5">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Reporter Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="w-full h-14 pl-14 pr-6 rounded-xl bg-slate-950/50 border border-white/5 text-xs font-black italic uppercase tracking-widest focus:border-white/20 outline-none transition-all placeholder:text-slate-700"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Contact Email</label>
                  <div className="relative">
                    <Send className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="edu@email.com"
                      className="w-full h-14 pl-14 pr-6 rounded-xl bg-slate-950/50 border border-white/5 text-xs font-black italic uppercase tracking-widest focus:border-white/20 outline-none transition-all placeholder:text-slate-700"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                <Send size={12} className="text-sky-400" />
                Witness Statement
              </label>
              <textarea
                required
                className="w-full min-h-[140px] p-6 rounded-[2rem] bg-white/5 border border-white/5 text-xs font-black italic uppercase tracking-widest focus:border-white/10 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                placeholder="Where did you see the item? In whose possession? Please be as specific as possible regarding the location and time."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                <Camera size={12} className="text-sky-400" />
                Visual Evidence (Optional)
              </label>
              
              <div className="grid grid-cols-1 gap-4">
                {photoUrl ? (
                  <div className="relative group rounded-[2rem] overflow-hidden aspect-video border border-white/10">
                    <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-[2rem] hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Syncing evidence...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-500 mb-6 group-hover:scale-110 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-all border border-white/5">
                          <Camera size={32} />
                        </div>
                        <p className="text-white text-xs font-black uppercase tracking-[0.2em] italic">Upload Capture</p>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mt-3 italic">Max file size 5MB</p>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Anonymity Toggle */}
            <div 
              className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer transition-all hover:bg-white/10" 
              onClick={() => setIsAnonymous(!isAnonymous)}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isAnonymous ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-600'}`}>
                  {isAnonymous ? <Shield size={28} /> : <ShieldOff size={28} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-widest">Confidential Mode</h4>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Identity scrubbing protocols active</p>
                </div>
              </div>
              <div className={`w-14 h-7 rounded-full relative transition-all ${isAnonymous ? 'bg-sky-500' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xl ${isAnonymous ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {/* Points Benefit Notice */}
            {!isAnonymous && (
              <div className="p-6 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-sky-400/80 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-center gap-3">
                   <Star size={14} className="animate-pulse" />
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">Honor ranking eligible upon verification</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || uploading || !description.trim()}
              className="w-full h-20 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-xs md:text-sm uppercase tracking-[0.3em] italic transition-all disabled:opacity-50 flex items-center justify-center gap-6 group shadow-2xl"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit Protocol
                  <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WitnessReportModal;
