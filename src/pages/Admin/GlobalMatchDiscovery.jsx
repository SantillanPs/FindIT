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
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-brand-secondary/20 flex items-center justify-center text-[10px] text-brand-secondary font-black">1</div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Record: The Finding</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border-l-4 border-brand-primary rounded-r-xl p-5 text-slate-300 text-sm leading-relaxed shadow-inner">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 not-italic mb-2 opacity-60">Public Finding Description</span>
                    <div className="italic mb-3">"{group.found_item.description}"</div>
                    <div className="flex flex-wrap gap-3 mt-4 border-t border-brand-border/20 pt-3">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-brand-primary">📍</span> {group.found_item.location_zone}
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-brand-primary">📅</span> {new Date(group.found_item.found_time).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 border-l-4 border-brand-secondary rounded-r-xl p-5 text-slate-400 text-sm leading-relaxed shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary not-italic opacity-60">Finder's Secret Proof</span>
                      <span className="text-[8px] bg-brand-secondary/10 text-brand-secondary px-1.5 py-0.5 rounded-full font-black border border-brand-secondary/20">STAFF ONLY</span>
                    </div>
                    <div className="font-semibold text-slate-200">
                      <span className="text-brand-secondary/50 mr-2">[INTERNAL NOTE]:</span>
                      {group.found_item.private_admin_notes || "No additional notes provided by finder."}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-brand-border/30">
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] text-brand-primary font-black">2</div>
                     <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidates: Potential Owners</h5>
                  </div>
                  
                  <div className="overflow-hidden border border-brand-border rounded-xl bg-slate-900/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border-b border-brand-border/50">
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Match</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em]">Lost Report Details</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em]">Confidential Verification</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-right">Operation</th>
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
                            <td className="px-6 py-4">
                              <div className="text-slate-300 text-[11px] font-medium leading-relaxed italic mb-2">
                                "{m.item.description}"
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/50 border border-brand-border/20 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  <span>📍</span> {m.item.location_zone}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/50 border border-brand-border/20 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  <span>📅</span> {new Date(m.item.last_seen_time).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-slate-950/40 border border-brand-border/30 rounded-lg p-2.5 shadow-inner">
                                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 opacity-50">Student Claim Evidence</div>
                                <div className="text-slate-200 text-xs font-medium leading-relaxed italic">
                                  "{m.item.private_proof_details || "No proof provided."}"
                                </div>
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
