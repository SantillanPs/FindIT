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
      alert('Failed to update verification status.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4 font-sans">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase underline decoration-slate-100 italic">Authenticating Secure Identity Registry...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-8 border-b-2 border-slate-200">
        <div className="space-y-2">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-blue-900 transition-colors uppercase tracking-[0.2em] flex items-center gap-1 no-underline">
            <span>←</span> Back to Staff Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Identity Portal</h1>
          <p className="text-slate-500 text-lg font-medium italic">
            Review academic enrollment and proof of identity to authorize system permissions.
          </p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
            ACTIVE STUDENT REGISTRY
          </h2>
          <span className="text-[10px] font-bold text-slate-400">Total Registered: {users.length}</span>
        </div>

        {users.length === 0 ? (
          <div className="p-24 text-center">
            <div className="text-6xl mb-6 opacity-10">🛡️</div>
            <p className="text-slate-400 font-medium font-sans italic">No student accounts awaiting review in the centralized database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Email Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Student #</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Proof of Enrollment</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Auth Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-slate-400 font-black text-xs">#{user.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700 text-sm group-hover:text-blue-900 transition-colors uppercase tracking-tight">{user.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs border border-slate-200">{user.student_id_number || 'N/A'}</code>
                    </td>
                    <td className="px-6 py-5">
                      {user.verification_proof_url ? (
                        <a 
                          href={user.verification_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-blue-50 text-blue-900 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-blue-100 hover:bg-blue-900 hover:text-white transition-all shadow-sm flex items-center gap-1 w-fit no-underline"
                        >
                          OPEN PROOF <span>↗</span>
                        </a>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                        user.is_verified ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-emerald-100' : 'bg-slate-50 text-slate-400 ring-slate-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${user.is_verified ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        {user.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => toggleVerification(user.id, user.is_verified)} 
                        className={`font-black text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded shadow-md group-hover:shadow-lg transition-all active:scale-95 ${
                          user.is_verified 
                            ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-900 hover:text-white' 
                            : 'bg-emerald-600 text-white hover:bg-black'
                        }`}
                      >
                        {user.is_verified ? 'Revoke Auth' : 'Approve Identity'}
                      </button>
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
