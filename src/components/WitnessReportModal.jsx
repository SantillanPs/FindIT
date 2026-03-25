import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Send, Shield, ShieldOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoUrl(response.data.url);
    } catch (error) {
      console.error('Upload failed', error);
      // Removed alert
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    // Guest validation
    if (!user) {
      if (!guestName.trim() || !guestEmail.trim()) {
        // Silent validation - the button is already disabled or fields are required
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        witness_description: description,
        witness_photo_url: photoUrl,
        is_anonymous: isAnonymous,
        guest_name: user ? null : guestName,
        guest_email: user ? null : guestEmail,
      };

      await apiClient.post(`/lost/${report.id}/witness`, payload);
      onSuccess('Your witness report has been submitted to the USG office for review.');
      onClose();
      // Reset form
      setDescription('');
      setPhotoUrl('');
      setIsAnonymous(false);
      setGuestName('');
      setGuestEmail('');
    } catch (error) {
      console.error('Submission failed', error);
      // Removed alert
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
          className="absolute inset-0 bg-bg-main/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl glass-panel rounded-[2.5rem] border border-border-main/20 overflow-hidden bg-bg-surface"
        >
          {/* Header */}
          <div className="p-8 border-b border-border-main/10 flex items-center justify-between bg-bg-elevated/10">
            <div>
              <h2 className="text-2xl font-black text-text-header uppercase tracking-tight">Report as Witness</h2>
              <p className="text-accent-default text-[10px] font-black uppercase tracking-widest mt-1">Item: {report.item_name}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-bg-elevated/50 flex items-center justify-center text-text-muted hover:bg-bg-elevated hover:text-text-header transition-all border border-border-main/10"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Guest Info Section */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-bg-elevated/5 border border-border-main/10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="input-field pl-12"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="yourname@email.com"
                      className="input-field pl-12"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                <Send size={12} className="text-accent-default" />
                Witness Statement
              </label>
              <textarea
                required
                className="input-field min-h-[120px] py-4 resize-none"
                placeholder="Where did you see the item? In whose possession? Please be as specific as possible (e.g., 'Saw it with a student in Blue shirt at Canteen')."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                <Camera size={12} className="text-accent-default" />
                Visual Evidence (Optional)
              </label>
              
              <div className="grid grid-cols-1 gap-4">
                {photoUrl ? (
                  <div className="relative group rounded-3xl overflow-hidden aspect-video border-2 border-accent-default/30">
                    <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center py-10 border-2 border-dashed border-border-main/20 rounded-[2rem] hover:border-accent-default/30 hover:bg-bg-elevated/5 transition-all cursor-pointer group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-10 h-10 border-4 border-accent-default/30 border-t-accent-default rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black text-accent-default uppercase tracking-widest">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-bg-elevated/50 flex items-center justify-center text-text-muted mb-4 group-hover:scale-110 group-hover:bg-accent-default/10 group-hover:text-accent-default transition-all">
                          <Camera size={32} />
                        </div>
                        <p className="text-text-header text-xs font-black uppercase tracking-widest">Tap to upload photo</p>
                        <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em] mt-2">Secret snapshots or evidence</p>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Anonymity Toggle */}
            <div className="p-6 rounded-3xl bg-bg-elevated/5 border border-border-main/10 flex items-center justify-between group cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAnonymous ? 'bg-accent-default/10 text-accent-default' : 'bg-bg-elevated/50 text-text-muted'}`}>
                  {isAnonymous ? <Shield size={24} /> : <ShieldOff size={24} />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-text-header uppercase tracking-widest">Submit Anonymously</h4>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Your identity won't be shown to anyone.</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${isAnonymous ? 'bg-accent-default' : 'bg-bg-elevated'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnonymous ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {/* Points Benefit Notice */}
            {!isAnonymous && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-uni-500/10 border border-uni-500/20 text-uni-400 text-center"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                  <i className="fa-solid fa-star mr-2"></i>
                  Earn Integrity Points after verification
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-6 rounded-[1.5rem] bg-accent-default hover:bg-accent-light text-black font-black text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 border border-black/5 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                  Submit Witness Report
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WitnessReportModal;
