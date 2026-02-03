import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location_zone: '',
    safe_photo_url: '',
    private_admin_notes: '',
    identified_student_id: '',
    identified_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('Institutional verification required for asset registration.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/found/report', formData);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Handover report failed. Protocol error.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Report a Found Item</h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Thank you for helping our community! Provide as much detail as possible so the owner can recognize their belonging.
        </p>
      </motion.header>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl"
          >
             <i className="fa-solid fa-triangle-exclamation mr-2"></i>
             {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.form 
        onSubmit={handleSubmit} 
        variants={itemVariants}
        className="glass-panel rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 space-y-8 md:space-y-10 border border-white/5 relative overflow-hidden text-left"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Category
            </label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-field bg-white/5 border-white/10 text-white font-bold uppercase text-[11px] tracking-widest"
              required
            >
              <option value="" className="bg-slate-900">Select category...</option>
              <option value="Electronics" className="bg-slate-900">Electronics</option>
              <option value="Books" className="bg-slate-900">Books</option>
              <option value="Personal Effects" className="bg-slate-900">Personal Effects</option>
              <option value="Keys" className="bg-slate-900">Keys</option>
              <option value="Accessories" className="bg-slate-900">Accessories</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Where did you find it?
            </label>
            <input 
              type="text"
              placeholder="e.g. Science Wing, Library 2nd Floor..."
              className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest"
              value={formData.location_zone}
              onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            General Description
          </label>
          <textarea 
            rows="4"
            placeholder="What does it look like? (e.g. Blue Nike backpack, broken zipper)"
            className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest min-h-[120px] resize-none pt-4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="space-y-6 p-6 sm:p-8 bg-uni-500/5 rounded-[1.5rem] md:rounded-3xl border border-uni-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-uni-500/20 flex items-center justify-center text-uni-400">
              <i className="fa-solid fa-id-card-clip"></i>
            </div>
            <label className="block text-[10px] font-black text-uni-400 uppercase tracking-widest">
               Direct Identification (Optional)
            </label>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-4">
            If the item has a name or ID number visible, enter it here to help us notify the owner instantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visible Student ID</label>
              <input 
                type="text"
                placeholder="e.g. 2021-10042"
                className="input-field bg-black/20 border-white/5 text-white font-bold text-[11px] tracking-widest"
                value={formData.identified_student_id}
                onChange={(e) => setFormData({...formData, identified_student_id: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visible Name</label>
              <input 
                type="text"
                placeholder="e.g. Juan De La Cruz"
                className="input-field bg-black/20 border-white/5 text-white font-bold text-[11px] tracking-widest"
                value={formData.identified_name}
                onChange={(e) => setFormData({...formData, identified_name: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-8 bg-brand-gold/5 rounded-[1.5rem] md:rounded-3xl border border-brand-gold/10">
          <label className="block text-[10px] font-black text-brand-gold uppercase tracking-widest ml-1">
             Identifying Details (Private)
          </label>
          <textarea 
            rows="2"
            placeholder="Internal details for staff..."
            className="input-field bg-black/20 border-white/5 text-white font-bold text-[11px] tracking-widest resize-none pt-4"
            value={formData.private_admin_notes}
            onChange={(e) => setFormData({...formData, private_admin_notes: e.target.value})}
            required
          />
          <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-brand-gold/50"></i>
            Hidden from public. Only shown to verified staff.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Photo URL (Optional)
          </label>
          <input 
            type="text"
            placeholder="Link to an image of the item (Imgur, etc.)"
            className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest"
            value={formData.safe_photo_url}
            onChange={(e) => setFormData({...formData, safe_photo_url: e.target.value})}
          />
        </div>

        <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <Link to="/student" className="order-2 md:order-1 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">
              Cancel
           </Link>
           <button 
             type="submit" 
             className="order-1 md:order-2 w-full md:w-auto bg-brand-gold text-slate-950 px-12 py-4 rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-brand-gold/20 hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100" 
             disabled={loading || !user?.is_verified}
           >
             {loading ? 'Submitting...' : 'Submit Report'}
           </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default ReportFoundItem;
