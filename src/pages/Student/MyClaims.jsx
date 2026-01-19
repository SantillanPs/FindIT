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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="pb-6 border-b-2 border-blue-900">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/" className="text-xs font-black text-slate-400 hover:text-blue-900 transition-colors uppercase tracking-[0.2em] flex items-center gap-1 no-underline">
            <span>←</span> Back to student Portal
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ownership Claim History</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Formal record of submitted property claims and their current administrative status.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <p className="text-slate-400 font-medium font-sans">You haven't submitted any ownership claims yet. History will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:border-slate-300 transition-colors relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2 ${
                claim.status === 'approved' ? 'bg-emerald-600' : 
                claim.status === 'rejected' ? 'bg-red-600' : 
                'bg-amber-500'
              }`}></div>
              
              <div className="flex-grow w-full md:w-auto">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Case #CLAIM-{claim.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                    claim.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 
                    claim.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-200' : 
                    'bg-amber-50 text-amber-700 ring-amber-200'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 italic font-serif text-sm text-slate-600 shadow-inner">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 not-italic mb-1 opacity-60">Submitted Evidence Log</span>
                    "{claim.evidence_description}"
                  </div>
                  
                  {claim.admin_notes && (
                    <div className="p-3 bg-blue-50/30 rounded border border-blue-100/50 text-sm text-blue-900 font-sans shadow-inner">
                      <span className="block text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1 opacity-60">Registrar Notes</span>
                      {claim.admin_notes}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right w-full md:w-48 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Filing Timestamp</div>
                <div className="text-xs font-bold text-slate-500 font-sans">{new Date(claim.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
