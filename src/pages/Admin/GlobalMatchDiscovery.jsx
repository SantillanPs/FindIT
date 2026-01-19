import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const GlobalMatchDiscovery = () => {
  const [matchGroups, setMatchGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);

  const fetchGlobalMatches = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/matches/all');
      setMatchGroups(resp.data);
    } catch (err) {
      console.error('Failed to fetch global matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalMatches();
  }, []);

  const handleConnectMatch = async (foundItemId, lostItemId) => {
    if (!window.confirm("Authorize this connection? Official notifications will be dispatched to both registries.")) return;
    setConnectingId(`${foundItemId}-${lostItemId}`);
    try {
      await apiClient.post('/admin/matches/connect', { found_item_id: foundItemId, lost_item_id: lostItemId });
      fetchGlobalMatches();
    } catch (err) {
      console.error("Failed to connect match");
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-6 text-center">
      <div className="w-12 h-12 border-2 border-slate-200 border-t-university-navy rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase animate-pulse">Running Neural Cross-Reference Analysis...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 relative">
        <div className="absolute -left-4 top-0 w-1 h-3/4 bg-university-gold opacity-50 rounded-full"></div>
        <div className="space-y-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-university-navy transition-colors uppercase tracking-[0.2em] no-underline group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Command Center Hub
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-university-navy tracking-tight">Global Match Audit</h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">
            AI-prioritized potential reunions across the entire registry. Review similarity rankings and evidence before authorization.
          </p>
        </div>
        <button 
          onClick={fetchGlobalMatches} 
          className="uni-button-primary flex items-center gap-2 scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
          Refresh Discovery
        </button>
      </div>

      {matchGroups.length === 0 ? (
        <div className="uni-card p-32 text-center bg-slate-50/30">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <span className="text-5xl grayscale opacity-20 italic font-serif">A</span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active discovery findings</p>
          <p className="text-slate-500 mt-2 text-sm italic">The matching engine automatically scans all new reports for potential reunions.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {matchGroups.map(group => (
            <div key={group.found_item.id} className="uni-card group overflow-hidden hover:-translate-y-2">
              <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-university-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Registry: #REG-{group.found_item.id.toString().padStart(6, '0')}
                  </div>
                  <div className="text-3xl font-bold text-university-navy tracking-tighter">
                    {group.found_item.category}
                  </div>
                </div>
                <div className="text-center sm:text-right border-l border-slate-200 pl-8">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Confidence</div>
                  <div className={`text-4xl font-bold tracking-tighter leading-none ${group.max_score >= 0.8 ? 'text-emerald-600' : 'text-university-gold'}`}>
                    {Math.round(group.max_score * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="bg-university-ivory border-l-4 border-university-navy rounded-r-2xl p-6 italic font-serif text-university-navy/80 text-lg leading-relaxed shadow-inner">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 not-italic mb-3 opacity-60">Staff Registry Log</span>
                  "{group.found_item.description}"
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h5 className="text-[12px] font-black text-university-navy/40 uppercase tracking-[0.3em]">Potential Matching Registry Filings</h5>
                    <div className="h-px bg-slate-100 flex-grow"></div>
                  </div>
                  
                  <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Similarity</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student Report Context</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Confidential Proof</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Audit Decision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.top_matches.map(m => (
                          <tr key={m.item.id} className="hover:bg-slate-50/50 transition-colors group/row">
                            <td className="px-8 py-6">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                                m.similarity_score >= 0.8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-university-gold border-amber-100'
                              }`}>
                                {Math.round(m.similarity_score * 100)}% Identity
                              </span>
                            </td>
                            <td className="px-8 py-6 text-university-navy/70 text-sm font-medium italic font-serif leading-relaxed italic">
                              "{m.item.description}"
                            </td>
                            <td className="px-8 py-6">
                              <div className="bg-slate-50/80 px-5 py-4 rounded-xl border border-slate-100 text-slate-500 text-xs font-medium leading-relaxed shadow-inner font-sans">
                                {m.item.private_proof_details}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                disabled={connectingId === `${group.found_item.id}-${m.item.id}`}
                                onClick={() => handleConnectMatch(group.found_item.id, m.item.id)}
                                className="uni-button-primary scale-75 origin-right translate-x-2 whitespace-nowrap group-hover/row:translate-x-0 transition-transform disabled:opacity-30"
                              >
                                {connectingId === `${group.found_item.id}-${m.item.id}` ? 'Authorizing...' : '🔗 Authorize Reunion'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default GlobalMatchDiscovery;
