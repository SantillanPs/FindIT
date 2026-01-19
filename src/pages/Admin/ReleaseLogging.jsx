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
    <div className="flex flex-col items-center justify-center p-24">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="space-y-4">
        <Link to="/admin" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Final Handover</h1>
        <p className="text-slate-400 text-base font-medium">
          Record the final physical transfer of the item to its owner.
        </p>
      </header>

      <div className="space-y-6">
        <div className="app-card p-8 border-t-4 border-t-brand-primary bg-brand-primary/5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Item Information</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Category</span>
              <p className="text-xl font-bold text-white tracking-tight">{item.category}</p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Registry ID</span>
              <p className="text-xl font-bold text-brand-primary tabular-nums">#REG-{item.id.toString().padStart(4, '0')}</p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Current Status</span>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span>
                {item.status}
              </p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Authenticated By</span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">System ID: {item.finder_id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="app-card p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Recipient User ID
              </label>
              <input 
                type="number" 
                placeholder="Unique system ID of the student"
                className="input-field"
                value={formData.released_to_id}
                onChange={(e) => setFormData({...formData, released_to_id: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Staff Authorization Name
              </label>
              <input 
                type="text" 
                placeholder="Full official name of staff member"
                className="input-field"
                value={formData.released_by_name}
                onChange={(e) => setFormData({...formData, released_by_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center gap-6 justify-between">
            <button 
              type="submit" 
              className="btn-primary w-full sm:w-auto px-10 py-4" 
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Authorize Final Release'}
            </button>
            <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest">
              Void Transaction
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReleaseLogging;
