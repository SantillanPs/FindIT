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
    const notes = window.prompt(`Finalize Audit: Provide staff justification for this ${status} decision:`, '');
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
    <div className="flex flex-col items-center justify-center p-24 space-y-6 text-center">
      <div className="w-12 h-12 border-2 border-slate-200 border-t-university-navy rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase animate-pulse">Compiling Evidence Dossiers...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 relative">
        <div className="absolute -left-4 top-0 w-1 h-3/4 bg-university-gold opacity-50 rounded-full"></div>
        <div className="space-y-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-university-navy transition-colors uppercase tracking-[0.2em] no-underline group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Command Center
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-university-navy tracking-tight">Ownership Verification Desk</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            Critical analysis of student-submitted evidence against internal staff logs for formalized property release authorization.
          </p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="uni-card p-32 text-center bg-slate-50/30">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <span className="text-5xl grayscale opacity-20">⚖️</span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Queue Cleared</p>
          <p className="text-slate-500 mt-2 text-sm italic">There are currently no property claims awaiting administrative adjudication.</p>
        </div>
      ) : (
        <section className="uni-card overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-university-crimson rounded-full animate-bounce"></div>
              <h2 className="text-xs font-black text-university-navy uppercase tracking-[0.2em]">
                Pending Adjudication Queue
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
              Staff Action Required: {claims.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest min-w-[180px]">Case Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest min-w-[280px]">Internal Staff Context</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest min-w-[320px]">Student Ownership Proof</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/30 transition-colors group/row">
                    <td className="px-8 py-8 align-top">
                      <div className="space-y-3">
                        <div className="font-bold text-university-navy text-sm font-serif italic">Case #C-{claim.id.toString().padStart(5, '0')}</div>
                        <div className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Ref: #REG-{claim.found_item_id}</div>
                        {claim.similarity_score !== null && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            claim.similarity_score >= 0.8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            claim.similarity_score >= 0.6 ? 'bg-amber-50 text-university-gold border-amber-100' : 
                            'bg-red-50 text-university-crimson border-red-100'
                          }`}>
                            AI Rank: {Math.round(claim.similarity_score * 100)}%
                          </div>
                        )}
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Filing: {new Date(claim.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-8 py-8 align-top">
                      <div className="bg-university-ivory p-6 rounded-2xl border border-slate-100 italic font-serif text-university-navy/70 leading-relaxed shadow-inner group-hover/row:border-university-navy/20 transition-colors">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 not-italic mb-3 opacity-60">Finder's Confidential Report</span>
                        "{claim.found_item_private_notes || 'No confidential staff annotations found for this record.'}"
                      </div>
                    </td>
                    <td className="px-8 py-8 align-top">
                      <div className="space-y-6">
                        <div className="text-sm text-slate-600 font-medium leading-relaxed font-sans px-2">
                          {claim.proof_description}
                        </div>
                        {claim.proof_photo_url && (
                          <div className="pt-2">
                            <a 
                              href={claim.proof_photo_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 bg-white text-university-navy px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase border border-slate-200 hover:border-university-navy hover:shadow-lg transition-all no-underline"
                            > 
                              <span>📎</span> View Attached Media <span className="text-xs">↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8 align-top text-right">
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => handleReview(claim.id, 'approved')} 
                          className="bg-university-navy text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
                        >
                          Authorize Release
                        </button>
                        <button 
                          onClick={() => handleReview(claim.id, 'rejected')} 
                          className="bg-white text-university-crimson border border-university-crimson/20 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-university-crimson hover:text-white transition-all active:scale-95 whitespace-nowrap"
                        >
                          Decline Claim
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
