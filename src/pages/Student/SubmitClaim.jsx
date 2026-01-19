import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
      setError('Authorized verification required for this action.');
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
      setError(err.response?.data?.detail || 'Submission failure. Please verify record status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="space-y-4">
        <Link to="/public-feed" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Registry
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Ownership Claim</h1>
        <p className="text-slate-400 text-base font-medium">
          Provide identification evidence to initiate the property recovery process.
        </p>
      </header>

      {error && !item ? (
        <div className="app-card p-10 bg-rose-500/10 border-rose-500/20 text-rose-400 text-center font-bold">
          {error}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="app-card p-6 bg-brand-primary/5 border-brand-primary/20 flex flex-col sm:flex-row gap-6 items-center">
             <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-brand-border">
                <span className="text-4xl">📦</span>
             </div>
             <div>
               <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Authenticated Registry Context</div>
               <h3 className="text-xl font-bold text-white mb-1">{item.category}</h3>
               <p className="text-sm text-slate-400 italic">"Found near {item.location_zone}"</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="app-card p-8 space-y-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Proprietary description
              </label>
              <textarea 
                rows="4"
                placeholder="Describe specific markings, content, or settings only you would know..."
                className="input-field min-h-[120px]"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-500 font-medium px-1 leading-relaxed">
                Include details like serial numbers, distinctive wear, or internal contents.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Evidence Link (Optional)
              </label>
              <input 
                type="text"
                placeholder="URL to photo proof (e.g. proof of purchase, photo with item)"
                className="input-field"
                value={proofPhotoUrl}
                onChange={(e) => setProofPhotoUrl(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-[10px] text-slate-500 font-bold max-w-xs leading-relaxed uppercase tracking-wider">
                This claim will be reviewed by staff for verification.
              </p>
              <button 
                type="submit" 
                disabled={submitting || !user?.is_verified} 
                className="btn-primary w-full sm:w-auto px-10 py-3.5"
              >
                {submitting ? 'Submitting...' : !user?.is_verified ? 'Verification Required' : 'Formalize Claim'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubmitClaim;
