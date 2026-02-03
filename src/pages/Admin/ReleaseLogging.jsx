import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

const ReleaseLogging = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({
    released_to_id: '',
    released_by_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await apiClient.get(`/admin/found/${itemId}`);
      setItem(response.data);
    } catch (err) {
      console.error('Could not fetch item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(`/admin/found/${itemId}/release`, formData);
      navigate('/admin');
    } catch (err) {
      console.error('Failed to log release. Ensure item is in "claimed" status.');
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
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Log Item Return</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Record the return of an item to its owner. This and will mark the item as successfully returned.
        </p>
      </motion.header>

      <motion.div className="space-y-12" variants={containerVariants}>
        {/* Item Summary Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden text-left"
        >
          <div className="absolute -top-4 -right-4 w-64 h-64 bg-uni-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl">
                   📦
                </div>
                <div>
                   <span className="text-uni-400 text-[9px] font-black uppercase tracking-widest block mb-1">Item to Return</span>
                   <p className="text-3xl font-black text-white uppercase tracking-tight">{item.category}</p>
                </div>
             </div>
             <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-white/10 pl-6 md:pl-0 md:pr-6">
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-1">Database ID</span>
                <p className="text-3xl font-black text-uni-400 tabular-nums tracking-tighter shadow-sm">#{item.id}</p>
             </div>
          </div>
        </motion.div>

        {/* Action Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          variants={itemVariants}
          className="glass-panel p-10 space-y-10 rounded-[2.5rem] bg-white/5 border border-white/5 text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Returning to (Student ID)
              </label>
              <input 
                type="number" 
                placeholder="Enter the recipient's student ID"
                className="input-field font-bold text-[11px] tracking-widest"
                value={formData.released_to_id}
                onChange={(e) => setFormData({...formData, released_to_id: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Handed over by (Staff)
              </label>
              <input 
                type="text" 
                placeholder="Name of the staff releasing the item"
                className="input-field font-bold text-[11px] tracking-widest"
                value={formData.released_by_name}
                onChange={(e) => setFormData({...formData, released_by_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center gap-8 justify-between">
            <Link to="/admin" className="text-[10px] font-black text-slate-700 hover:text-white transition-colors uppercase tracking-widest">
                Cancel
            </Link>
            <button 
              type="submit" 
              className="bg-uni-600 hover:bg-uni-500 text-white w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-uni-500/20" 
              disabled={submitting}
            >
              {submitting ? 'Logging...' : 'Confirm Return'}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default ReleaseLogging;
