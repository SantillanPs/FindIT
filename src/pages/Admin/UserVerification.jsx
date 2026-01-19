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
      <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link to="/admin" className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify Students</h1>
        <p className="text-slate-500 text-base font-medium max-w-2xl">
          Review student ID documentation and authorize accounts for campus recovery services.
        </p>
      </header>

      <section className="app-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Student Directory
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {users.length} Users
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-slate-400 font-medium">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">ID Number</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Documentation</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700 text-sm">{user.email}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{user.role}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <code className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {user.student_id_number || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {user.verification_proof_url ? (
                          <a 
                            href={user.verification_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1"
                          >
                            View Document ↗
                          </a>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300">No Document</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          user.is_verified ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user.is_verified ? (
                        <button 
                          onClick={() => toggleVerification(user.id, user.is_verified)} 
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleVerification(user.id, user.is_verified)} 
                          className="btn-primary py-1.5 px-3 text-[10px]"
                        >
                          Verify Account
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
