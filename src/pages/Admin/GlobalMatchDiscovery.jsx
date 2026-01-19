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
    if (!window.confirm("Authorize this match? Notifications will be sent to both parties.")) return;
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
      <div className="w-12 h-12 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase animate-pulse">Scanning registry for matches...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-3">
          <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors uppercase tracking-wider no-underline group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Staff Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pending Matches</h1>
          <p className="text-slate-400 text-base font-medium max-w-2xl">
            Review items that potentially match existing loss reports.
          </p>
        </div>
        <button 
          onClick={fetchGlobalMatches} 
          className="btn-accent flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
          Refresh Feed
        </button>
      </header>

      {matchGroups.length === 0 ? (
        <div className="app-card p-24 text-center bg-slate-900/40 border-dashed">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending matches discovered</p>
          <p className="text-slate-600 mt-2 text-sm">The system will notify you when new potential matches are found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {matchGroups.map(group => (
            <div key={group.found_item.id} className="app-card overflow-hidden group">
              <div className="bg-slate-900 px-6 py-5 border-b border-brand-border flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-primary text-slate-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    REF-{group.found_item.id.toString().padStart(4, '0')}
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    {group.found_item.category}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confidence Score</div>
                    <div className={`text-2xl font-black tabular-nums ${group.max_score >= 0.8 ? 'text-emerald-400' : 'text-brand-primary'}`}>
                      {Math.round(group.max_score * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <div className="bg-slate-900 border-l-4 border-brand-primary rounded-r-xl p-5 italic text-slate-300 text-sm leading-relaxed shadow-inner">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 not-italic mb-2 opacity-60">Found Item Description</span>
                  "{group.found_item.description}"
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Matching Loss Reports</h5>
                  
                  <div className="overflow-hidden border border-brand-border rounded-xl bg-slate-900/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-500 border-b border-brand-border">
                          <th className="px-6 py-3 text-[10px] font-bold uppercase">Similarity</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase">Report Details</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase">Confidential Proof</th>
                          <th className="px-6 py-3 text-[10px] font-bold uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/50">
                        {group.top_matches.map(m => (
                          <tr key={m.item.id} className="hover:bg-white/5 transition-colors group/row">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tabular-nums border ${
                                m.similarity_score >= 0.8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                              }`}>
                                {Math.round(m.similarity_score * 100)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300 text-xs italic leading-relaxed">
                              "{m.item.description}"
                              <div className="text-[8px] text-slate-500 uppercase font-bold mt-1">📍 {m.item.location_zone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-500 text-[10px] leading-relaxed">
                                {m.item.private_proof_details}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                disabled={connectingId === `${group.found_item.id}-${m.item.id}`}
                                onClick={() => handleConnectMatch(group.found_item.id, m.item.id)}
                                className="btn-primary py-1.5 px-3 text-[9px] whitespace-nowrap disabled:opacity-30"
                              >
                                {connectingId === `${group.found_item.id}-${m.item.id}` ? 'Processing...' : 'Confirm Match'}
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
