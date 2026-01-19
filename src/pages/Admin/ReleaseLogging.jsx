import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-6">
      <div className="w-12 h-12 border-2 border-slate-200 border-t-university-navy rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase animate-pulse">Pulling Handover Protocol...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <header className="relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-university-gold opacity-50 rounded-full"></div>
        <div className="space-y-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-university-navy transition-colors uppercase tracking-[0.2em] no-underline group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Administrative Portal
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-university-navy tracking-tight">Physical Asset Handover</h1>
          <p className="text-slate-500 text-lg font-medium">
            Authorized registry terminal for recording the final physical transfer of recovered assets to students.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="uni-card p-10 bg-slate-50/50 border-l-4 border-university-gold">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Asset Identification</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</span>
              <p className="text-xl font-bold text-university-navy tracking-tight">{item.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Registry ID</span>
              <p className="text-xl font-bold text-university-navy font-serif">#UNI-{item.id.toString().padStart(6, '0')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
              <p className="text-sm font-black text-university-gold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-university-gold rounded-full animate-pulse"></span>
                {item.status}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Original Reference</span>
              <p className="text-sm font-bold text-slate-500">Staff-Filer: {item.finder_id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="uni-card p-12 space-y-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-university-navy uppercase tracking-[0.2em] ml-1">
                Recipient Credential (User ID)
              </label>
              <input 
                type="number" 
                placeholder="Unique system ID of the student recipient"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-university-navy/5 outline-none transition-all placeholder:text-slate-300"
                value={formData.released_to_id}
                onChange={(e) => setFormData({...formData, released_to_id: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-university-navy uppercase tracking-[0.2em] ml-1">
                Authorizing Staff Personnel
              </label>
              <input 
                type="text" 
                placeholder="Full official name of staff member"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-university-navy/5 outline-none transition-all placeholder:text-slate-300"
                value={formData.released_by_name}
                onChange={(e) => setFormData({...formData, released_by_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center gap-6">
            <button 
              type="submit" 
              className="uni-button-primary w-full sm:w-auto px-12 py-5 text-sm" 
              disabled={submitting}
            >
              {submitting ? 'Updating Registry...' : 'Authorize Transaction'}
            </button>
            <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-university-crimson transition-colors uppercase tracking-[0.2em] no-underline">
              Void Transaction
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ReleaseLogging;
