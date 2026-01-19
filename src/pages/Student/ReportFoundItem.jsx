import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location_zone: '',
    safe_photo_url: '',
    private_admin_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('Staff verification required to access this feature.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/found/report', formData);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Handover report failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="space-y-4">
        <Link to="/student" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Register Found Item</h1>
        <p className="text-slate-400 text-base font-medium">
          Help return property by providing detailed information for our registry.
        </p>
      </header>
      
      {error && (
        <div className="app-card p-4 bg-rose-500/10 border-rose-500/20 text-rose-400 text-sm font-bold animate-fade-in text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="app-card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Primary Category
            </label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-field font-semibold"
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Wallets & Keys">Wallets & Keys</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              General Location
            </label>
            <input 
              type="text"
              placeholder="e.g. Science Wing Basement"
              className="input-field"
              value={formData.location_zone}
              onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            General Description (Visible to Public)
          </label>
          <textarea 
            rows="3"
            placeholder="Provide basic visible traits (color, brand, type)..."
            className="input-field min-h-[100px]"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
             Staff View - Identified Marks
          </label>
          <textarea 
            rows="2"
            placeholder="Details only the owner would know (serial numbers, internal IDs)..."
            className="input-field bg-slate-900/40"
            value={formData.private_admin_notes}
            onChange={(e) => setFormData({...formData, private_admin_notes: e.target.value})}
            required
          />
          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider px-1">
            Careful: These notes will only be visible to staff for verification.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Public Photo (URL)
          </label>
          <input 
            type="text"
            placeholder="Link to external photo of item"
            className="input-field"
            value={formData.safe_photo_url}
            onChange={(e) => setFormData({...formData, safe_photo_url: e.target.value})}
          />
        </div>

        <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-4">
           <Link to="/student" className="btn-ghost">Discard</Link>
           <button 
            type="submit" 
            className="btn-primary px-10" 
            disabled={loading || !user?.is_verified}
          >
            {loading ? 'Registering...' : !user?.is_verified ? 'Access Restricted' : 'Register Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFoundItem;
