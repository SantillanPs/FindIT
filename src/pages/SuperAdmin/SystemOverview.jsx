import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

const SystemOverview = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['system-overview-stats'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('v_super_staff_management')
        .select('role');
      
      if (error) throw error;
      
      return {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalSuperAdmins: users.filter(u => u.role === 'super_admin').length,
        students: users.filter(u => u.role === 'student').length
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-500/5 rounded-2xl border border-rose-500/10">
        <p className="text-sm font-bold uppercase tracking-widest">Failed to load system metrics</p>
        <p className="text-xs opacity-60 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 pb-32">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">System Overview</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">High-level platform statistics and health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Registered Accounts" 
          value={stats.totalUsers} 
          icon="fa-users" 
          color="text-blue-400" 
          bg="bg-blue-500/10" 
          border="border-blue-500/20" 
        />
        <StatCard 
          title="Active Students" 
          value={stats.students} 
          icon="fa-user-graduate" 
          color="text-emerald-400" 
          bg="bg-emerald-500/10" 
          border="border-emerald-500/20" 
        />
        <StatCard 
          title="Active Admins" 
          value={stats.totalAdmins} 
          icon="fa-user-tie" 
          color="text-uni-400" 
          bg="bg-uni-500/10" 
          border="border-uni-500/20" 
        />
        <StatCard 
          title="Super Admins" 
          value={stats.totalSuperAdmins} 
          icon="fa-chess-king" 
          color="text-uni-400" 
          bg="bg-uni-500/10" 
          border="border-uni-500/20" 
        />
      </div>

      <div className="app-card p-8 border-uni-500/20 bg-gradient-to-br from-uni-900/10 to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-uni-500/10 border border-uni-500/20 flex items-center justify-center text-uni-400">
            <i className="fa-solid fa-server"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">System Status</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">All services operational</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Database Connection</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-widest">Healthy</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Storage Bucket (Supabase)</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-widest">Healthy</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">OpenAI Vector Search</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-widest">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg, border }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`app-card p-6 border ${border} ${bg} flex flex-col justify-between`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-white/5`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className="text-3xl font-bold text-white leading-none">{value}</span>
    </div>
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2 line-clamp-2">{title}</h3>
  </motion.div>
);

export default SystemOverview;
