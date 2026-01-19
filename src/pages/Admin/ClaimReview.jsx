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
    const notes = window.prompt(`Add staff notes for this ${status} decision:`, '');
    if (notes === null) return;

    try {
      await apiClient.post(`/admin/claims/${claimId}/review`, {
        status: status,
        admin_notes: notes
      });
      alert(`Claim ${status} successfully.`);
      fetchPendingClaims();
    } catch (err) {
      alert('Review submission failed.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4 font-sans">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase underline decoration-slate-100 italic">Compiling Evidence Review Queue...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-8 border-b-2 border-slate-200">
        <div className="space-y-2">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-blue-900 transition-colors uppercase tracking-[0.2em] flex items-center gap-1 no-underline">
            <span>←</span> Back to Staff Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ownership Proof Desk</h1>
          <p className="text-slate-500 text-lg font-medium italic">
            Analyze student evidence against confidential staff recovery notes to validate property claims.
          </p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-24 text-center shadow-inner">
          <div className="text-6xl mb-6 opacity-10">⚖️</div>
          <p className="text-slate-400 font-medium font-sans italic max-w-sm mx-auto">No pending property claims awaiting administrative adjudication.</p>
        </div>
      ) : (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ring-1 ring-slate-100">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
              ADJUDICATION QUEUE
            </h2>
            <span className="text-[10px] font-bold text-slate-400">Claims in Review: {claims.length}</span>
          </div>

          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest min-w-[200px]">Item & Context</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest min-w-[250px]">Confidential Staff Notes</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest min-w-[300px]">Student Submitted Proof</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-black text-slate-400 tracking-widest uppercase">REG-ID: #{claim.found_item_id}</div>
                        {claim.similarity_score !== null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset w-fit ${
                            claim.similarity_score >= 0.8 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 
                            claim.similarity_score >= 0.6 ? 'bg-amber-50 text-amber-700 ring-amber-200' : 
                            'bg-red-50 text-red-700 ring-red-200'
                          }`}>
                            {claim.similarity_score >= 0.8 ? 'High' : claim.similarity_score >= 0.6 ? 'Medium' : 'Low'} AI Rank
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic opacity-50">Direct Claim</span>
                        )}
                        <div className="text-[9px] font-bold text-slate-400 mt-2 font-mono">{new Date(claim.created_at).toLocaleDateString()} Log</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded border border-slate-100 italic leading-relaxed shadow-inner">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 not-italic mb-2 opacity-60">Finder Confidential Log</span>
                        {claim.found_item_private_notes || 'No private staff notes available for this registry entry.'}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-4">
                        <div className="text-sm text-slate-800 font-medium leading-relaxed">
                          {claim.proof_description}
                        </div>
                        {claim.proof_photo_url && (
                          <div className="pt-2">
                            <a 
                              href={claim.proof_photo_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase border border-blue-100 hover:bg-blue-900 hover:text-white transition-all shadow-sm no-underline"
                            > 
                              <span>🖼️</span> VIEW ATTACHED MEDIA <span>↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleReview(claim.id, 'approved')} 
                          className="bg-emerald-600 text-white px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-black transition-all active:scale-95"
                        >
                          Authorize Release
                        </button>
                        <button 
                          onClick={() => handleReview(claim.id, 'rejected')} 
                          className="bg-white text-red-700 ring-1 ring-inset ring-red-200 px-5 py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-red-50 transition-all active:scale-95"
                        >
                          Decline Request
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
