import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proof, setProof] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await apiClient.get('/found/public');
      const foundItem = response.data.find(i => i.id === parseInt(itemId));
      if (foundItem) {
        setItem(foundItem);
      } else {
        setError('Registry entry not found or no longer available.');
      }
    } catch (err) {
      setError('System error retrieving item context.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('Authorized institutional verification required for this action.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/claims/submit', {
        found_item_id: parseInt(itemId),
        proof_description: proof,
        proof_photo_url: proofPhotoUrl
      });
      navigate('/my-claims');
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failure. Protocol violation.');
    } finally {
      setSubmitting(false);
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

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Claim This Item</h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed">
          If you believe this item belongs to you, please provide proof of ownership. A staff member will review your claim.
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {error && !item ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-20 bg-red-500/5 border-red-500/20 text-red-500 text-center font-black uppercase tracking-widest text-[11px] rounded-[2rem]"
          >
            <i className="fa-solid fa-triangle-exclamation text-2xl mb-4 block"></i>
            {error}
          </motion.div>
        ) : (
          <motion.div className="space-y-10" variants={containerVariants}>
            {/* Item Preview */}
            <motion.div 
              variants={itemVariants}
              className="glass-panel p-6 sm:p-8 bg-uni-500/5 border-uni-500/20 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row gap-6 md:gap-8 items-center text-left"
            >
               <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <span className="text-3xl md:text-5xl">📦</span>
               </div>
               <div className="text-center sm:text-left">
                 <div className="text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2">Item Details</div>
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2 font-displayLeading-tight">{item.category} recovered</h3>
                 <p className="text-[10px] md:text-[11px] text-slate-500 font-black uppercase tracking-widest">
                   Found near <span className="text-white italic">{item.location_zone}</span> on {new Date(item.found_time).toLocaleDateString()}
                 </p>
               </div>
            </motion.div>

            {/* Claim Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              variants={itemVariants}
              className="glass-panel p-6 sm:p-8 md:p-10 space-y-6 md:space-y-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border border-white/5 text-left"
            >
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  How do we know it's yours?
                </label>
                <textarea 
                  rows="4"
                  placeholder="Unique features, contents, or serial number..."
                  className="input-field min-h-[140px] text-[11px] font-bold tracking-widest pt-4 resize-none"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  required
                />
                <p className="text-[8px] md:text-[9px] text-slate-600 font-black uppercase tracking-widest px-1 leading-relaxed italic">
                  Example: Cracked screen, specific stickers, or contents inside.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Supporting Document Link (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="Link to a photo of your receipt, ID, or the item in your possession..."
                  className="input-field font-bold text-[11px] tracking-widest"
                  value={proofPhotoUrl}
                  onChange={(e) => setProofPhotoUrl(e.target.value)}
                />
              </div>

              <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <Link to="/public-feed" className="order-2 md:order-1 text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-all">
                    Cancel
                </Link>
                <div className="order-1 md:order-2 flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                    <p className="hidden md:block text-[9px] text-slate-600 font-black uppercase tracking-widest max-w-[200px] text-right leading-relaxed italic">
                        Staff will review this claim. You'll be notified of the decision.
                    </p>
                    <button 
                        type="submit" 
                        disabled={submitting || !user?.is_verified} 
                        className="bg-uni-600 hover:bg-uni-500 text-white w-full md:w-auto px-12 py-4 rounded-xl md:rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-uni-500/20 hover:scale-[1.02] disabled:opacity-30"
                    >
                        {submitting ? 'Submitting...' : 'Submit Claim'}
                    </button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubmitClaim;
