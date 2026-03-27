import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Shield, AlertTriangle, UserX, UserCheck, 
  ArrowUpCircle, ArrowDownCircle, Search, Filter 
} from 'lucide-react';
import apiClient from '../../api/client';

const Leaderboard = ({ refreshTrigger, setIsSyncing }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLeaderboard(refreshTrigger > 0);
  }, [refreshTrigger]);

  const fetchLeaderboard = async (isSync = false) => {
    if (isSync) setIsSyncing(true);
    try {
      const response = await apiClient.get('/admin/leaderboard');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const adjustReputation = async (userId, points, strikes) => {
    setActionLoading(userId);
    try {
      await apiClient.put(`/admin/users/${userId}/reputation`, {
        points_modifier: points,
        strikes_modifier: strikes
      });
      await fetchLeaderboard();
    } catch (err) {
      console.error('Failed to adjust reputation');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    setActionLoading(`verify-${userId}`);
    try {
      await apiClient.put(`/admin/users/${userId}/verify`, { is_verified: !currentStatus });
      await fetchLeaderboard();
    } catch (err) {
      console.error('Failed to update verification status.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleCertificate = async (userId, currentStatus) => {
    setActionLoading(`cert-${userId}`);
    try {
      await apiClient.put(`/admin/users/${userId}/certificate`, { is_eligible: !currentStatus });
      await fetchLeaderboard();
    } catch (err) {
      console.error('Failed to toggle certificate eligibility');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_id_number?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankStyle = (index) => {
    if (index === 0) return "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border-amber-400/50";
    if (index === 1) return "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 border-slate-300/50";
    if (index === 2) return "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 border-orange-400/50";
    return "bg-slate-900 border-white/5";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 100 } }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
      <motion.header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" variants={itemVariants}>
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
                <Trophy className="text-amber-500" size={28} />
                Integrity Leaderboard
            </h1>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
               Monitoring community contribution and institutional trustworthiness
            </p>
        </div>

        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
                type="text"
                placeholder="SEARCH MEMBERS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-uni-500 transition-all placeholder:text-slate-700"
            />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Shield className="text-uni-400" />} 
            label="Verified Members" 
            value={users.filter(u => u.is_verified).length} 
            sub="Active institutional profiles"
          />
          <StatCard 
            icon={<Trophy className="text-amber-500" />} 
            label="Total Integrity" 
            value={users.reduce((acc, u) => acc + (u.integrity_points || 0), 0)} 
            sub="System-wide trust score"
          />
          <StatCard 
            icon={<AlertTriangle className="text-red-500" />} 
            label="Flagged Users" 
            value={users.filter(u => u.fraud_strikes > 0).length} 
            sub="Members with active strikes"
          />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl overflow-hidden border border-white/5 bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Rank / Identity</th>
                <th className="px-8 py-6 text-center">Milestone Progress</th>
                <th className="px-8 py-6 text-center w-32">Score</th>
                <th className="px-8 py-6 text-right">Reputation Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user, index) => {
                const progress = Math.min((user.integrity_points / 1000) * 100, 100);
                const isTopThree = index < 3;
                
                return (
                  <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors group ${isTopThree ? 'relative' : ''}`}>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getRankStyle(index)}`}>
                             {isTopThree ? <Trophy size={16} className="text-white" /> : <span className="text-[11px] font-black text-slate-500">{index + 1}</span>}
                          </div>
                          <div>
                              <div className="font-black text-white text-[12px] uppercase tracking-widest group-hover:text-uni-400 transition-colors flex items-center gap-2">
                                  {user.first_name} {user.last_name}
                                  {user.is_verified && <UserCheck size={12} className="text-green-500" />}
                                  {user.is_certificate_eligible && (
                                      <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-300 text-black px-2 py-0.5 rounded text-[8px] font-black">
                                          <Shield size={8} /> CERTIFIED
                                      </span>
                                  )}
                              </div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
                                  <span className="text-slate-400">{user.student_id_number || 'STU-000'}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                  {user.email}
                              </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                        <div className="max-w-[200px] mx-auto space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${progress === 100 ? 'text-amber-500' : 'text-slate-600'}`}>
                                    {progress === 100 ? 'Goal Reached' : 'To Milestone'}
                                </span>
                                <span className="text-[8px] font-black text-slate-400 tracking-widest">1,000 PTS</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-uni-500'}`}
                                />
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-8 text-center text-center">
                       <div className="inline-flex flex-col items-center">
                          <span className={`text-xl font-black tracking-tighter ${isTopThree ? 'text-white' : 'text-slate-300'}`}>
                            {user.integrity_points || 0}
                          </span>
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Total Pts</span>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex justify-end items-center gap-4">
                          <div className="flex items-center gap-2 bg-slate-950 border border-white/5 rounded-2xl p-1.5">
                              <button 
                                  onClick={() => toggleCertificate(user.id, user.is_certificate_eligible)}
                                  disabled={actionLoading === `cert-${user.id}`}
                                  className={`p-2 rounded-xl transition-all ${user.is_certificate_eligible ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-slate-700 hover:text-slate-400 hover:bg-white/5'}`}
                                  title="Toggle Certificate Eligibility"
                              >
                                  <Trophy size={16} />
                              </button>
                              <button 
                                  onClick={() => toggleVerification(user.id, user.is_verified)}
                                  disabled={actionLoading === `verify-${user.id}`}
                                  className={`p-2 rounded-xl transition-all ${user.is_verified ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'text-slate-700 hover:text-slate-400 hover:bg-white/5'}`}
                                  title="Verify Identity"
                              >
                                  <UserCheck size={16} />
                              </button>
                          </div>

                          <div className="h-8 w-px bg-white/5 mx-2"></div>

                          <div className="flex items-center gap-1.5">
                              <button 
                                  onClick={() => adjustReputation(user.id, 10, 0)}
                                  disabled={actionLoading === user.id}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-white/5 text-slate-500 hover:text-green-500 hover:border-green-500/30 rounded-lg transition-all"
                              >
                                  <ArrowUpCircle size={16} />
                              </button>
                              <button 
                                  onClick={() => adjustReputation(user.id, -10, 0)}
                                  disabled={actionLoading === user.id}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-white/5 text-slate-500 hover:text-red-500 hover:border-red-500/30 rounded-lg transition-all"
                              >
                                  <ArrowDownCircle size={16} />
                              </button>
                          </div>

                          <button 
                              onClick={() => adjustReputation(user.id, 0, 1)}
                              disabled={actionLoading === user.id}
                              className={`ml-4 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] transition-all border ${user.fraud_strikes > 0 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-900 border-white/5 text-slate-600 hover:text-red-400 hover:border-red-500/20'}`}
                          >
                              {user.fraud_strikes > 0 ? `${user.fraud_strikes} STRIKES` : 'ADD STRIKE'}
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan="4" className="py-24 text-center">
                          <AlertTriangle className="mx-auto text-slate-800 mb-4" size={32} />
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No members found matching criteria</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-950 border border-white/5 rounded-2xl">
                {icon}
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
        </div>
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
            <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

export default Leaderboard;
