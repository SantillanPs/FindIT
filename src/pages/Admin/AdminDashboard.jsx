import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    matches: 0,
    verifications: 0,
    claims: 0,
    totalItems: 0
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      const [foundRes, userRes, claimRes, matchRes] = await Promise.all([
        apiClient.get('/admin/found'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/claims/pending'),
        apiClient.get('/admin/matches/all')
      ]);

      setItems(foundRes.data);
      setStats({
        matches: matchRes.data.length,
        verifications: userRes.data.filter(u => !u.is_verified).length,
        claims: claimRes.data.length,
        totalItems: foundRes.data.length
      });
    } catch (error) {
      console.error('Dash fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold tracking-widest text-xs uppercase underline decoration-slate-200">Initializing Coordination Center...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="pb-6 border-b-2 border-blue-900">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Coordination Center</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Centralized administrative portal for campus property recovery and identity verification.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Match Analysis Queue */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 transition-all group-hover:w-3"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Queue A: Discovery</span>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">{stats.matches} Matches</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Automated Analysis</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Review potential matches identified by the AI system between lost and found registries.
          </p>
          <Link to="/admin/discovery" className="block w-full text-center bg-indigo-600 text-white py-3 rounded font-bold text-sm shadow-md hover:bg-black transition-all hover:-translate-y-1">
            Analyze Results
          </Link>
        </div>

        {/* Verification Queue */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-600 transition-all group-hover:w-3"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Queue B: Verification</span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">{stats.verifications} Pending</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Identity Services</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Review student identity proof and academic enrollment details for account authorization.
          </p>
          <Link to="/admin/verify" className="block w-full text-center bg-emerald-600 text-white py-3 rounded font-bold text-sm shadow-md hover:bg-black transition-all hover:-translate-y-1">
            Open Registry
          </Link>
        </div>

        {/* Claims Queue */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-900 transition-all group-hover:w-3"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Queue C: Ownership</span>
            <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-sans">{stats.claims} Unreviewed</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Property Release</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Validate ownership evidence provided by students against staff notes for property release.
          </p>
          <Link to="/admin/claims" className="block w-full text-center bg-blue-900 text-white py-3 rounded font-bold text-sm shadow-md hover:bg-black transition-all hover:-translate-y-1">
            Manage Queue
          </Link>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-900 rounded-full animate-pulse"></span>
            Recent Registry Activity
          </h2>
          <span className="text-[10px] font-bold text-slate-400">Total Entries: {stats.totalItems}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-sans">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest underline decoration-slate-200 decoration-2">Registry ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest underline decoration-slate-200 decoration-2">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest underline decoration-slate-200 decoration-2">Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest underline decoration-slate-200 decoration-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">No active registry entries found.</td>
                </tr>
              ) : (
                items.slice(0, 10).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-sm italic group-hover:not-italic group-hover:text-blue-900 transition-all">#L&F-{item.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black inline-block uppercase tracking-tighter ring-1 ring-slate-200 shadow-sm">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-500 text-sm font-medium">{item.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                        item.status === 'released' ? 'bg-slate-50 text-slate-400 ring-slate-200' : 
                        item.status === 'claimed' ? 'bg-amber-50 text-amber-600 ring-amber-200 shadow-amber-100' : 
                        'bg-blue-50 text-blue-700 ring-blue-200 shadow-blue-100'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          item.status === 'released' ? 'bg-slate-300' : 
                          item.status === 'claimed' ? 'bg-amber-500' : 
                          'bg-blue-500'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {items.length > 10 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Detailed registry pagination coming soon
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
