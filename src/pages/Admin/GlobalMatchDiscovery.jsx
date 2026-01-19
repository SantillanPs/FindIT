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
    if (!window.confirm("Connect these items? Both students will be notified to proceed with the return.")) return;
    setConnectingId(`${foundItemId}-${lostItemId}`);
    try {
      await apiClient.post('/admin/matches/connect', { found_item_id: foundItemId, lost_item_id: lostItemId });
      alert("Match connected! Students have been notified via the system.");
      fetchGlobalMatches();
    } catch (err) {
      alert("Failed to connect match");
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-widest text-xs uppercase italic">Executing AI Cross-Reference Analysis...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-200">
        <div className="space-y-2">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-blue-900 transition-colors uppercase tracking-[0.2em] flex items-center gap-1 no-underline">
            <span>←</span> Back to Staff Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Match Discovery</h1>
          <p className="text-slate-500 text-lg font-medium italic">AI-prioritized potential reunions across the entire registry.</p>
        </div>
        <button 
          onClick={fetchGlobalMatches} 
          className="bg-slate-900 text-white px-6 py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-black flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <span>🔄</span> Refresh Intelligence
        </button>
      </div>

      {matchGroups.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-24 text-center shadow-inner">
          <div className="text-6xl mb-6 opacity-10">🧠</div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">No active matches found</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">The system will automatically rank items as new student reports are submitted to the registry.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {matchGroups.map(group => (
            <div key={group.found_item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ring-1 ring-slate-100">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-900 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm underline decoration-blue-700">FOUND ID #{group.found_item.id}</span>
                  <div className="text-xl font-black text-slate-800 tracking-tight uppercase border-b-2 border-blue-900 leading-none pb-1">{group.found_item.category}</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Confidence</div>
                  <div className={`text-3xl font-black tracking-tighter ${group.max_score >= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.round(group.max_score * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8 font-sans">
                <div className="bg-blue-50/30 border border-blue-100 rounded-lg p-5 italic font-serif text-blue-900 shadow-inner">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-blue-400 not-italic mb-2 opacity-60">Found Registry Description Log</span>
                  "{group.found_item.description}"
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1 py-1 border-l-2 border-slate-200">Potential Student Reports ({group.top_matches.length})</h5>
                  
                  <div className="overflow-hidden border border-slate-100 rounded-lg">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Similarity</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Student Report Context</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Verification Proof</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.top_matches.map(m => (
                          <tr key={m.item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                                m.similarity_score >= 0.8 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                              }`}>
                                {Math.round(m.similarity_score * 100)}% Match
                              </span>
                            </td>
                            <td className="px-6 py-5 text-slate-600 text-sm italic font-serif leading-relaxed line-clamp-2">
                              "{m.item.description}"
                            </td>
                            <td className="px-6 py-5">
                              <div className="bg-amber-50 px-4 py-2 rounded border border-amber-100/50 text-amber-900 text-xs font-bold leading-relaxed shadow-inner">
                                {m.item.private_proof_details}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button 
                                disabled={connectingId === `${group.found_item.id}-${m.item.id}`}
                                onClick={() => handleConnectMatch(group.found_item.id, m.item.id)}
                                className="bg-blue-900 text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-[0.2em] shadow hover:bg-black transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                              >
                                {connectingId === `${group.found_item.id}-${m.item.id}` ? 'Connecting...' : '🔗 Connect Match'}
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
