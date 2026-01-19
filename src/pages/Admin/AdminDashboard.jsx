import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const StatCard = ({ label, count, description, color, link }) => {
  const themes = {
    indigo: 'border-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10',
    sky: 'border-sky-400 bg-sky-400/5 hover:bg-sky-400/10',
    rose: 'border-rose-500 bg-rose-500/5 hover:bg-rose-500/10'
  };

  const btnThemes = {
    indigo: 'btn-primary w-full',
    sky: 'bg-sky-400 text-slate-950 w-full py-2.5 rounded-xl font-bold text-sm hover:bg-sky-500 transition-all shadow-lg shadow-sky-400/10',
    rose: 'bg-rose-500 text-white w-full py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/10'
  };

  return (
    <div className={`app-card p-6 border-t-4 transition-all ${themes[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-4xl font-extrabold text-white mt-1">{count}</h3>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
        {description}
      </p>
      <Link to={link} className={btnThemes[color]}>
        Review Queue
      </Link>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_lost: 0, total_found: 0, total_claims: 0 });
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setErrorStatus(null);
      const [statsRes, foundRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/found')
      ]);
      setStats(statsRes.data);
      setRecentFound(foundRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setErrorStatus('Failed to sync with the central database. Please check your connection or admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustodyUpdate = async (item) => {
    setActionLoading(item.id);
    try {
      await apiClient.put(`/admin/found/${item.id}/custody`, { notes: 'Updated via dashboard quick action' });
      await fetchDashboardData(); // Refresh list and stats
    } catch (err) {
      console.error('Custody update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = recentFound.filter(item => 
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm) ||
    (item.private_admin_notes && item.private_admin_notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Staff Management Portal</h1>
          <p className="text-slate-400 mt-2 text-base font-medium">
            Centralized registry for all discovered assets and recovery operations.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/admin/discovery" className="btn-secondary py-2 text-xs">AI Discovery</Link>
           <Link to="/admin/claims" className="btn-primary py-2 text-xs">Review Claims</Link>
        </div>
      </header>
      
      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-medium">
          <span>⚠️</span> {errorStatus}
          <button onClick={fetchDashboardData} className="ml-auto bg-rose-500/20 px-3 py-1 rounded-lg hover:bg-rose-500/30 transition-colors">Retry Sync</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Unmatched Lost Items"
          count={stats.total_lost}
          description="Reports from students awaiting a matching found item."
          color="indigo"
          link="/admin/discovery"
        />
        <StatCard 
          label="Items in Repository"
          count={stats.total_found}
          description="Total found items currently cataloged in the system."
          color="sky"
          link="/admin/discovery"
        />
        <StatCard 
          label="Active Claims"
          count={stats.total_claims}
          description="Pending verification requests from students."
          color="rose"
          link="/admin/claims"
        />
      </div>

      <section className="app-card overflow-hidden border-brand-border/40">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Item Registry & Custody Log
            </h2>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Search & Management</p>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID, Category, Notes..." 
              className="w-full bg-slate-950/50 border border-brand-border rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Asset Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Found By</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Location & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-100 text-sm group-hover:text-brand-primary transition-colors">{item.category}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">REF-{item.id.toString().padStart(4, '0')}</div>
                    {item.private_admin_notes && (
                      <p className="text-[10px] text-slate-600 mt-1 max-w-xs truncate italic">"{item.private_admin_notes}"</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 font-medium">
                      {item.finder_id ? `Finder ID: ${item.finder_id}` : 'Official Report'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">
                      {item.finder_id ? 'External Report' : 'In-House Log'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                      <span className="text-brand-primary">📍</span> {item.location_zone}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                      {new Date(item.found_time).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === 'reported' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        item.status === 'in_custody' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        item.status === 'claimed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.status === 'reported' && (
                        <button 
                          onClick={() => handleCustodyUpdate(item)}
                          disabled={actionLoading === item.id}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === item.id ? 'Updating...' : 'In Custody'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="text-3xl mb-4">📜</div>
                    <p className="text-slate-500 italic text-sm">
                      {searchTerm ? `No matches found for "${searchTerm}"` : 'No items found in the registry.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
