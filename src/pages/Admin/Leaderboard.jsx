import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Shield, AlertTriangle, UserX, UserCheck, 
  ArrowUpCircle, ArrowDownCircle, Search, BadgeCheck,
  Award, Users, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const Leaderboard = ({ refreshTrigger }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const { data: users = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin_leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles_v1')
        .select('*')
        .order('integrity_points', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData
  });

  const adjustReputation = async (userId, points, strikes) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.rpc('adjust_user_reputation', {
        user_id: userId,
        points_mod: points,
        strikes_mod: strikes
      });
      
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_leaderboard'] });
    } catch (err) {
      console.error('Failed to adjust reputation', err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    setActionLoading(`verify-${userId}`);
    try {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_leaderboard'] });
    } catch (err) {
      console.error('Failed to update verification status');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleCertificate = async (userId, currentStatus) => {
    setActionLoading(`cert-${userId}`);
    try {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ is_certificate_eligible: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_leaderboard'] });
    } catch (err) {
      console.error('Failed to toggle certificate eligibility');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_id_number?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankStyle = (index) => {
    if (index === 0) return "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
    if (index === 1) return "bg-slate-300/10 border-slate-300/30 text-slate-300";
    if (index === 2) return "bg-orange-500/10 border-orange-500/30 text-orange-500";
    return "bg-slate-900 border-white/5 text-slate-500";
  };

  if (isLoading && users.length === 0) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-2">
        <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
                <Trophy className="text-amber-500" size={28} />
                Community Trust Registry
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
               Monitoring member contributions and institutional reliability scores.
            </p>
        </div>

        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-uni-400 transition-colors" size={18} />
            <input 
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-slate-900/60 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-semibold text-white focus:outline-none focus:border-uni-500/50 transition-all placeholder:text-slate-700 shadow-xl"
            />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Shield size={24} className="text-uni-400" />} 
            label="Verified Members" 
            value={users.filter(u => u.is_verified).length} 
            sub="Active institutional profiles"
          />
          <StatCard 
            icon={<Award size={24} className="text-amber-500" />} 
            label="System Integrity" 
            value={users.reduce((acc, u) => acc + (u.integrity_points || 0), 0)} 
            sub="Global community trust score"
          />
          <StatCard 
            icon={<AlertTriangle size={24} className="text-red-500" />} 
            label="Flagged Activity" 
            value={users.filter(u => u.fraud_strikes > 0).length} 
            sub="Members with active strikes"
          />
      </div>

      <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-10 py-6">Member Identity</th>
                <th className="px-10 py-6 text-center">Milestones</th>
                <th className="px-10 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredUsers.map((user, index) => {
                const progress = Math.min((user.integrity_points / 1000) * 100, 100);
                const isTopThree = index < 3;
                
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-10 text-left">
                      <div className="flex items-center gap-7">
                          <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border font-bold text-sm shadow-inner transition-all ${getRankStyle(index)}`}>
                             {isTopThree ? <Trophy size={20} /> : index + 1}
                          </div>
                          <div className="space-y-1.5">
                              <div className="font-bold text-white text-[14px] tracking-tight flex items-center gap-2">
                                  {user.first_name} {user.last_name}
                                  {user.is_verified && <BadgeCheck size={16} className="text-emerald-400" />}
                                  {user.is_certificate_eligible && (
                                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-bold tracking-widest px-2 py-0.5 ml-2">
                                          CERTIFIED
                                      </Badge>
                                  )}
                              </div>
                              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-3">
                                  <span>{user.student_id_number || 'OFF-MEMBER'}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                                  <span className="lowercase font-medium text-slate-700">{user.email}</span>
                              </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                        <div className="max-w-[200px] mx-auto space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${progress === 100 ? 'text-amber-500' : 'text-slate-600'}`}>
                                    {progress === 100 ? 'Level Master' : 'Next Milestone'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 tracking-widest">1,000</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-uni-600 shadow-[0_0_10px_rgba(var(--uni-500-rgb),0.3)]'}`}
                                />
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                       <div className="flex flex-col items-center">
                          <span className={`text-2xl font-bold tracking-tight ${isTopThree ? 'text-white' : 'text-slate-400'}`}>
                            {user.integrity_points?.toLocaleString() || 0}
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-10 text-left">
                      <div className="flex justify-end items-center">
                          <Badge variant="outline" className="bg-slate-900 border-white/10 text-slate-500 text-[8px] font-bold tracking-[0.2em] px-3 py-1 uppercase italic">
                              Member Profile
                          </Badge>
                      </div>
                    </td>
                </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan="4" className="py-32 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                            <Users size={48} className="mx-auto text-slate-800" />
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">No matching records</p>
                              <p className="text-[10px] text-slate-700">Try adjusting your search criteria</p>
                            </div>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
    <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-xl hover:shadow-2xl transition-all space-y-6">
        <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                {icon}
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <h4 className="text-3xl font-bold text-white tracking-tight">{value?.toLocaleString() || 0}</h4>
            <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1">{sub}</p>
        </div>
    </div>
);

export default Leaderboard;
