import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';

const StaffManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: staff = [], isLoading, error: queryError } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_super_staff_management')
        .select('*')
        .order('role', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
    }
  });

  const toggleBetaMutation = useMutation({
    mutationFn: async ({ userId, isBeta }) => {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ is_beta_tester: isBeta })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
    }
  });

  const error = queryError ? 'Could not load staff members. Please ensure you have Super Admin permissions.' : null;

  const handlePromote = (userId) => {
    updateRoleMutation.mutate({ userId, newRole: 'admin' });
  };

  const handleDemote = (userId) => {
    updateRoleMutation.mutate({ userId, newRole: 'student' });
  };

  const filteredStaff = staff.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch(role) {
      case 'super_admin':
        return <span className="bg-uni-500/20 text-uni-400 border border-uni-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Super Admin</span>;
      case 'admin':
        return <span className="bg-uni-500/20 text-uni-400 border border-uni-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Admin</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Student</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 pb-32">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Staff Management</h2>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Promote or revoke administrative privileges</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-slate-500"></i>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uni-500/50 focus:ring-1 focus:ring-uni-500/50 transition-all placeholder:text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((user_row) => (
          <div key={user_row.id} className="app-card p-6 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-white font-display font-bold text-xl">
                  {user_row.full_name?.charAt(0) || user_row.email.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getRoleBadge(user_row.role)}
                  {user_row.is_beta_tester && (
                    <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                      <i className="fa-solid fa-flask text-[8px]"></i> Beta Access
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1 truncate">{user_row.full_name || 'Guest User'}</h3>
              <p className="text-slate-500 text-xs mb-4 truncate"><i className="fa-regular fa-envelope mr-2"></i>{user_row.email}</p>
              
              {user_row.department && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      <i className="fa-solid fa-building-columns text-slate-500 mr-2"></i>
                      {user_row.department}
                  </p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              {user_row.id === user.id ? (
                <div className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest text-center">
                  This is You
                </div>
              ) : user_row.role === 'super_admin' ? (
                <div className="w-full py-2.5 rounded-xl border border-uni-500/20 bg-uni-500/5 text-uni-400 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <i className="fa-solid fa-crown text-uni-500"></i> Peer Super Admin
                </div>
              ) : user_row.role === 'admin' ? (
                <button 
                  onClick={() => handleDemote(user_row.id)}
                  disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user_row.id}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user_row.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-user-minus"></i>}
                  Revoke Admin
                </button>
              ) : (
                <button 
                  onClick={() => handlePromote(user_row.id)}
                  disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user_row.id}
                  className="w-full py-2.5 rounded-xl bg-uni-500/10 hover:bg-uni-500/20 border border-uni-500/20 text-uni-400 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user_row.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-crown"></i>}
                  Promote to Admin
                </button>
              )}
            </div>

            {/* Beta Tester Toggle */}
            <div className="mt-3">
               <button 
                  onClick={() => toggleBetaMutation.mutate({ userId: user_row.id, isBeta: !user_row.is_beta_tester })}
                  disabled={toggleBetaMutation.isPending && toggleBetaMutation.variables?.userId === user_row.id}
                  className={cn(
                    "w-full py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    user_row.is_beta_tester 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20" 
                      : "bg-slate-900 text-slate-500 border-white/5 hover:border-white/10"
                  )}
               >
                  {toggleBetaMutation.isPending && toggleBetaMutation.variables?.userId === user_row.id ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className={cn("fa-solid", user_row.is_beta_tester ? "fa-flask-vial" : "fa-flask")}></i>
                  )}
                  {user_row.is_beta_tester ? "Revoke Beta Access" : "Grant Beta Access"}
               </button>
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm font-black uppercase tracking-widest">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
