import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';

const StudentDashboard = () => {
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [deptInput, setDeptInput] = useState("");

  useEffect(() => {
    if (user?.department) setDeptInput(user.department);
  }, [user]);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.allSettled([
        apiClient.get('/lost/my-reports'),
        apiClient.get('/found/my-reports')
      ]);
      
      if (lostRes.status === 'fulfilled') setLostReports(lostRes.value.data);
      if (foundRes.status === 'fulfilled') setFoundReports(foundRes.value.data);
    } catch (error) {
      console.error('Fatal dashboard sync error', error);
    } finally {
      setLoading(false);
    }
  };

  const statVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({ 
      y: 0, 
      opacity: 1,
      transition: { delay: i * 0.1, type: 'spring', damping: 20, stiffness: 100 }
    })
  };

  return (
    <div className="space-y-12">
      {/* Overview Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          index={0}
          icon="fa-search" 
          label="Your Lost Items" 
          value={lostReports.length} 
          color="blue"
          variants={statVariants}
        />
        <StatCard 
          index={1}
          icon="fa-hand-holding-heart" 
          label="Items You Found" 
          value={foundReports.length} 
          color="green" 
          variants={statVariants}
        />
        <StatCard 
          index={2}
          icon="fa-award" 
          label="Integrity Points" 
          value={user?.integrity_points || 0} 
          color="gold"
          variants={statVariants}
        />
        <StatCard 
          index={3}
          icon="fa-bolt" 
          label="Active Matches" 
          value={lostReports.filter(r => r.status === 'matched').length} 
          color="blue"
          variants={statVariants}
        />
      </section>

      {/* Account & Privacy Settings (Leaderboard Changes) */}
      <section className="glass-panel rounded-3xl p-8 border border-white/5 bg-white/[0.01]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-uni-500 shadow-[0_0_8px_rgba(var(--color-uni-500),0.5)]"></span>
              Leaderboard & Privacy Settings
            </h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Manage how you appear in the Hall of Integrity.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-2">
               <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">College Department</label>
               <input 
                 type="text"
                 readOnly={user?.role === 'student'}
                 placeholder="e.g. CEIT or Engineering"
                 value={deptInput}
                 onChange={(e) => user?.role !== 'student' && setDeptInput(e.target.value)}
                 onBlur={async () => {
                    if (user?.role === 'student') return;
                    try {
                      await apiClient.put('/auth/me/preference', { department: deptInput });
                      fetchUser(); 
                    } catch (err) { console.error(err); }
                 }}
                 className={`bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none w-48 md:w-56 ${user?.role === 'student' ? 'text-slate-500 cursor-not-allowed border-transparent' : 'text-white border-white/10 focus:border-uni-500'}`}
               />
               {user?.role === 'student' && (
                 <p className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.1em] mt-1 ml-1 opacity-50 italic">
                   Institutional Record (Read Only)
                 </p>
               )}
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Full Name?</span>
                <button 
                  onClick={async () => {
                    try {
                      await apiClient.put('/auth/me/preference', { show_full_name: !user?.show_full_name });
                      fetchUser(); // Sync global state without reload
                    } catch (err) { console.error(err); }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${user?.show_full_name ? 'bg-uni-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user?.show_full_name ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        {/* Recent Lost Reports */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              Recent Lost Reports
            </h2>
            <Link to="/report/lost" className="text-[9px] font-black text-blue-500 hover:text-white transition-all uppercase tracking-widest">+ New Report</Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <LoadingPulse count={3} />
            ) : lostReports.length === 0 ? (
              <EmptyState title="No active reports" message="Report something you lost to start searching." compact />
            ) : (
              lostReports.slice(0, 4).map((report) => (
                <ActivityItem 
                  key={report.id}
                  type="lost"
                  title={report.item_name}
                  subtitle={`FILE-${report.id.toString().padStart(4, '0')}`}
                  status={report.status}
                  actionLabel="Check Matches"
                  onClick={() => navigate(`/lost/${report.id}/matches`)}
                />
              ))
            )}
            {lostReports.length > 4 && (
               <button className="w-full py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                  View all lost reports ({lostReports.length})
               </button>
            )}
          </div>
        </section>

        {/* Recent Findings */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              Recent Findings
            </h2>
            <Link to="/report/found" className="text-[9px] font-black text-green-500 hover:text-white transition-all uppercase tracking-widest">+ Report Found</Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <LoadingPulse count={3} />
            ) : foundReports.length === 0 ? (
              <EmptyState title="No items logged" message="Found something? Help return it by logging it here." compact />
            ) : (
              foundReports.slice(0, 4).map((item) => (
                <ActivityItem 
                  key={item.id}
                  type="found"
                  title={item.item_name}
                  subtitle={`REF-${item.id.toString().padStart(4, '0')}`}
                  status={item.status}
                />
              ))
            )}
             {foundReports.length > 4 && (
               <button className="w-full py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                  View all findings ({foundReports.length})
               </button>
            )}
          </div>
        </section>
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, color, variants, index }) => {
  const colors = {
    blue: 'from-blue-600 to-blue-400 text-blue-400 shadow-blue-500/20',
    green: 'from-green-600 to-green-400 text-green-400 shadow-green-500/20',
    gold: 'from-brand-gold to-yellow-400 text-brand-gold shadow-brand-gold/20'
  };

  return (
    <motion.div 
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      className="glass-panel p-8 rounded-3xl border border-white/5 relative group overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color].split(' ').slice(0,2).join(' ')} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
      <div className={`w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-xl mb-6 border border-white/5 ${colors[color].split(' ')[2]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <h4 className="text-4xl font-black text-white tracking-tighter">{value.toString().padStart(2, '0')}</h4>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ type, title, subtitle, status, actionLabel, onClick }) => {
  const statusColors = {
    reported: 'text-amber-500',
    matched: 'text-blue-400',
    searching: 'text-slate-500',
    recovered: 'text-green-400',
    in_custody: 'text-uni-400'
  };

  return (
    <div className="glass-panel-simple p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/5 transition-all rounded-2xl border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4 md:gap-5 w-full">
        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-lg border border-white/5 shadow-inner shrink-0">
          {type === 'lost' ? '🔍' : '📁'}
        </div>
        <div className="text-left min-w-0 flex-grow">
          <p className="font-black text-white text-[11px] md:text-xs uppercase tracking-widest mb-1 truncate">{title}</p>
          <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="shrink-0">{subtitle}</span>
            <span className="hidden xs:inline opacity-20">|</span>
            <span className={`${statusColors[status] || 'text-slate-500'} shrink-0`}>
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
      {actionLabel && (
        <button 
          onClick={onClick}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase tracking-widest transition-all text-center"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

const LoadingPulse = ({ count }) => (
  <div className="space-y-4">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
    ))}
  </div>
);

export default StudentDashboard;
