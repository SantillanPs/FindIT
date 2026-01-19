import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';

const MatchResults = () => {
  const { reportId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [reportId]);

  const fetchMatches = async () => {
    try {
      const response = await apiClient.get(`/lost/${reportId}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Analyzing registry...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link to="/student" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Match Recommendations</h1>
        <p className="text-slate-400 text-base font-medium max-w-2xl">
          Based on your report, we've identified these items that share similar characteristics.
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="app-card p-24 text-center bg-slate-900/40 border-dashed">
          <p className="text-slate-500 font-medium">No direct matches found yet.</p>
          <p className="text-xs text-slate-600 mt-1 italic">Our system continuously scans the registry. You'll be notified if a match appears.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map(({ item, similarity_score }) => (
            <div key={item.id} className="app-card overflow-hidden flex flex-col sm:flex-row items-stretch min-h-[160px] group transition-all">
              <div className="w-full sm:w-48 bg-slate-900 flex items-center justify-center relative shrink-0">
                {item.safe_photo_url ? (
                  <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-20">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-brand-primary text-slate-950 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="flex-grow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.category}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest tabular-nums border ${
                        similarity_score >= 0.8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      }`}>
                        {Math.round(similarity_score * 100)}% Match
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    "{item.description}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-sm">📍</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.location_zone}</span>
                  </div>

                  <Link 
                    to={`/submit-claim/${item.id}`} 
                    className="btn-primary py-2 px-6 text-xs w-full sm:w-auto text-center"
                  >
                    File Ownership Claim
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchResults;
