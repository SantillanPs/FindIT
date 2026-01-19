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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, foundRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/found/public')
      ]);
      setStats(statsRes.data);
      setRecentFound(foundRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Staff Dashboard</h1>
        <p className="text-slate-400 mt-2 text-base font-medium">
          Comprehensive overview of lost items, recovered assets, and active recovery claims.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Active Lost Reports"
          count={stats.total_lost}
          description="Pending reports filed by students currently unmatched in the registry."
          color="indigo"
          link="/admin/discovery"
        />
        <StatCard 
          label="Recovered Assets"
          count={stats.total_found}
          description="Items successfully cataloged and currently held in the central storage."
          color="sky"
          link="/admin/discovery"
        />
        <StatCard 
          label="Pending Claims"
          count={stats.total_claims}
          description="Verification requests submitted by students for recovered items."
          color="rose"
          link="/admin/claims"
        />
      </div>

      <section className="app-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-900/40">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Item Registry
          </h2>
          <Link to="/admin/discovery" className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors">
            View full log &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-slate-500">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Location Found</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date Logged</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {recentFound.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-100 text-sm">{item.category}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">REF-{item.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <span>📍</span> {item.location_zone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                    {new Date(item.found_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Cataloged
                    </span>
                  </td>
                </tr>
              ))}
              {recentFound.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic text-sm">
                    No recent items in the registry.
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
