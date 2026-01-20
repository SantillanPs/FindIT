import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const response = await apiClient.get('/claims/my-claims');
      setClaims(response.data);
    } catch (error) {
      console.error('Failed to fetch my claims', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link to="/" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Claim History</h1>
        <p className="text-slate-400 text-base font-medium max-w-2xl">
          Track the status of your submitted property claims.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="app-card p-16 text-center bg-slate-900/40 border-dashed">
          <p className="text-slate-500 font-medium">No claims found in your record.</p>
          <p className="text-xs text-slate-600 mt-1">If you find a lost item in the feed, you can submit a claim there.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="app-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 app-card-hover relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5 ${
                claim.status === 'approved' ? 'bg-emerald-500' : 
                claim.status === 'rejected' ? 'bg-rose-500' : 
                'bg-brand-primary'
              }`}></div>
              
              <div className="flex-grow w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-widest">Case #C-{claim.id.toString().padStart(4, '0')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                    claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    claim.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                    'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl border border-brand-border text-xs text-slate-400 leading-relaxed shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 not-italic opacity-60">Your Evidence</span>
                       {claim.found_item_category && <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded font-bold uppercase">{claim.found_item_category}</span>}
                    </div>
                    <div className="mb-2 text-white font-medium italic">"{claim.proof_description}"</div>
                    {claim.found_item_description && (
                      <div className="text-[10px] text-slate-500 border-t border-brand-border/30 pt-2 mt-2">
                        <span className="font-bold uppercase tracking-tighter">Registry Item:</span> {claim.found_item_description}
                      </div>
                    )}
                  </div>
                  
                  {claim.admin_notes && (
                    <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-xs text-brand-primary/80 font-medium leading-relaxed shadow-inner">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-brand-primary mb-2 opacity-60">Staff Response</span>
                      {claim.admin_notes}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right w-full md:w-32 shrink-0 border-t md:border-t-0 border-brand-border pt-4 md:pt-0">
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Filed On</div>
                <div className="text-[11px] font-bold text-slate-400 tabular-nums">{new Date(claim.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
