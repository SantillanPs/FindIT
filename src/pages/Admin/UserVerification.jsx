import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    try {
      await apiClient.put(`/admin/users/${userId}/verify`, { is_verified: !currentStatus });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Failed to update verification status.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link to="/admin" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Identity Management</h1>
        <p className="text-slate-400 text-base font-medium max-w-2xl">
          Review documentation and authorize accounts for campus recovery services.
        </p>
      </header>

      <section className="app-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-900/40">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Directory
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {users.length} Active Records
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-slate-500 font-medium italic">No accounts requiring attention.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-slate-500">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">User Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Documentation</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-100 text-sm">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</span>
                        {user.student_id_number && (
                          <>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <code className="text-[9px] font-bold text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                              {user.student_id_number}
                            </code>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {user.verification_proof_url ? (
                          <a 
                            href={user.verification_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-accent py-1.5 px-3 text-[9px] whitespace-nowrap"
                          >
                            View Docs ↗
                          </a>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600 italic">None provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                        user.is_verified 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-inner'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      {user.is_verified ? (
                        <button 
                          onClick={() => toggleVerification(user.id, user.is_verified)} 
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-400 hover:underline px-2 transition-all"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleVerification(user.id, user.is_verified)} 
                          className="btn-primary py-1.5 px-4 text-[10px]"
                        >
                          Authorize
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserVerification;
