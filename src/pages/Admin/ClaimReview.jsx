import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const ClaimReview = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      const response = await apiClient.get('/admin/claims/pending');
      setClaims(response.data);
    } catch (error) {
      console.error('Failed to fetch claims', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId, status) => {
    const notes = window.prompt(`Finalize Decision: Provide internal notes for this ${status} verdict:`, '');
    if (notes === null) return;

    try {
      await apiClient.post(`/admin/claims/${claimId}/review`, {
        status: status,
        admin_notes: notes
      });
      fetchPendingClaims();
    } catch (err) {
      console.error('Review submission failed.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link to="/admin" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Review Claims</h1>
        <p className="text-slate-400 text-base font-medium max-w-2xl">
          Evaluate ownership proof submitted by students for recovered items.
        </p>
      </header>

      {claims.length === 0 ? (
        <div className="app-card p-24 text-center bg-slate-900/40 border-dashed">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending claims</p>
          <p className="text-slate-600 mt-2 text-sm italic">The verification queue is currently empty.</p>
        </div>
      ) : (
        <section className="app-card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-900/40">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Verification Queue
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {claims.length} Records Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-slate-500">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Ownership Case</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Internal Notes</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Student Proof</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-6 align-top">
                      <div className="space-y-2">
                        <div className="font-bold text-slate-100 text-sm">#C-{claim.id.toString().padStart(4, '0')}</div>
                        <div className="text-[10px] font-bold text-slate-500 tracking-wider">REF-{claim.found_item_id}</div>
                        {claim.similarity_score !== null && (
                          <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            claim.similarity_score >= 0.8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                          }`}>
                            {Math.round(claim.similarity_score * 100)}% Match
                          </div>
                        )}
                        <div className="text-[9px] font-medium text-slate-600">{new Date(claim.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="bg-slate-900 p-4 rounded-xl border border-brand-border text-slate-400 text-xs leading-relaxed italic shadow-inner">
                        "{claim.found_item_private_notes || 'No confidential notes provided.'}"
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="space-y-4">
                        <div className="text-xs text-slate-300 leading-relaxed font-medium">
                          {claim.proof_description}
                        </div>
                        {claim.proof_photo_url && (
                          <a 
                            href={claim.proof_photo_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border border-brand-primary/20 hover:bg-brand-primary/20 transition-all no-underline"
                          > 
                            <span>📎</span> View Attachment ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top text-right">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleReview(claim.id, 'approved')} 
                          className="btn-primary py-2 px-4 text-[10px] uppercase tracking-widest"
                        >
                          Approve Recovery
                        </button>
                        <button 
                          onClick={() => handleReview(claim.id, 'rejected')} 
                          className="bg-transparent text-rose-500 hover:text-rose-400 font-bold text-[10px] uppercase tracking-widest py-2 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default ClaimReview;
