import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

const GuestReportItem = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location_zone: '',
    private_proof_details: '',
    contact_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/lost/report/guest', formData);
      setSuccess(true);
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

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/30">
          <i className="fa-solid fa-check text-4xl text-green-400"></i>
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Report Received</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-md mx-auto">
          We've registered your lost item. Our AI is already scanning the registry for matches.
        </p>
        <div className="p-8 glass-panel rounded-3xl border border-white/5 space-y-4">
          <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest text-left">What happens next?</p>
          <ul className="text-left space-y-4">
            <li className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
              <p className="text-xs text-slate-300 font-bold leading-relaxed">Check your email for a confirmation link.</p>
            </li>
            <li className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
              <p className="text-xs text-slate-300 font-bold leading-relaxed">Create an account to track matches and claim items.</p>
            </li>
          </ul>
        </div>
        <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/register')}
            className="bg-uni-600 hover:bg-uni-500 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-uni-500/20"
          >
            Create Account
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-white/5"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-10 py-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uni-500/10 text-uni-400 text-[8px] font-black uppercase tracking-widest border border-uni-500/20 mb-4">
          <i className="fa-solid fa-bolt"></i> Guest Rapid Report
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">Emergency Loss Report</h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Don't waste time on registration. Tell us what you lost, and we'll start matching it immediately.
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
              Your Email Address
            </label>
            <input 
              type="email"
              placeholder="Where should we contact you?"
              className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Where did you last see it?
          </label>
          <input 
            type="text"
            placeholder="e.g. Science Library, Student Union..."
            className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest"
            value={formData.location_zone}
            onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Item Description
          </label>
          <textarea 
            rows="4"
            placeholder="Describe the color, brand, model, and any unique scratches or stickers..."
            className="input-field bg-white/5 border-white/10 text-white font-bold text-[11px] tracking-widest min-h-[120px] resize-none pt-4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="space-y-3 p-5 sm:p-8 bg-uni-500/5 rounded-[1.5rem] md:rounded-3xl border border-uni-500/10">
          <label className="block text-[10px] font-black text-uni-400 uppercase tracking-widest ml-1">
             Private Ownership Proof
          </label>
          <textarea 
            rows="3"
            placeholder="Tell us something only the owner would know..."
            className="input-field bg-black/20 border-white/5 text-white font-bold text-[11px] tracking-widest resize-none pt-4"
            value={formData.private_proof_details}
            onChange={(e) => setFormData({...formData, private_proof_details: e.target.value})}
            required
          />
          <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <i className="fa-solid fa-lock text-uni-500/50"></i>
            This information is private and only used to verify your claim.
          </p>
        </div>

        <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <Link to="/" className="order-2 md:order-1 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">
              Cancel
           </Link>
           <div className="order-1 md:order-2 flex gap-4 w-full md:w-auto">
              <button 
                type="submit" 
                className="w-full md:w-auto bg-uni-600 hover:bg-uni-500 text-white px-12 py-4 rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-uni-500/20 hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100" 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Rapid Report'}
              </button>
           </div>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default GuestReportItem;
