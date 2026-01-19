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
    <div className="flex flex-col items-center justify-center p-24">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Dashboard</h1>
        <p className="text-slate-500 mt-2 text-base font-medium">
          Manage identity verifications, review claims, and audit item matches.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Pending Matches" 
          count={stats.matches} 
          description="AI-identified matches waiting for your approval."
          color="indigo"
          link="/admin/discovery"
        />
        <StatCard 
          label="Verifications" 
          count={stats.verifications} 
          description="Students waiting for membership verification."
          color="amber"
          link="/admin/verify"
        />
        <StatCard 
          label="Claim Reviews" 
          count={stats.claims} 
          description="Submitted proof of ownership for found items."
          color="red"
          link="/admin/claims"
        />
      </div>

      <section className="app-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Item Registry</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
            Total: {stats.totalItems} Items
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Item ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No registry entries found.
                  </td>
                </tr>
              ) : (
                items.slice(0, 10).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 text-xs">#REG-{item.id.toString().padStart(5, '0')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        item.status === 'released' ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                        item.status === 'claimed' ? 'bg-amber-50 text-brand-accent border-amber-100' : 
                        'bg-indigo-50 text-brand-primary border-indigo-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, count, description, color, link }) => {
  const themes = {
    indigo: 'border-brand-primary bg-indigo-50/10 hover:bg-indigo-50/20',
    amber: 'border-brand-accent bg-amber-50/10 hover:bg-amber-50/20',
    red: 'border-red-500 bg-red-50/10 hover:bg-red-50/20'
  };

  const btnThemes = {
    indigo: 'btn-primary w-full',
    amber: 'btn-accent w-full',
    red: 'bg-red-500 text-white w-full py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition-all'
  };

  return (
    <div className={`app-card p-6 border-t-4 transition-all ${themes[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-900 leading-none">{label}</h3>
        <span className="text-xl font-extrabold text-slate-800">{count}</span>
      </div>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
        {description}
      </p>
      <Link to={link} className={btnThemes[color]}>
        Manage Queue
      </Link>
    </div>
  );
};



export default AdminDashboard;
