import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AchievementBadge from '../../components/AchievementBadge';

const StudentDashboard = () => {
  const [personalLost, setPersonalLost] = useState([]);
  const [personalFound, setPersonalFound] = useState([]);
  const [publicFound, setPublicFound] = useState([]);
  const [publicLost, setPublicLost] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deptRank, setDeptRank] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      const [pLostRes, pFoundRes, pubFoundRes, pubLostRes, deptRes, assetRes] = await Promise.allSettled([
        apiClient.get('/lost/my-reports'),
        apiClient.get('/found/my-reports'),
        apiClient.get('/found/public'),
        apiClient.get('/lost/public'),
        apiClient.get('/admin/leaderboard/departments'),
        apiClient.get('/assets/')
      ]);
      
      if (pLostRes.status === 'fulfilled') setPersonalLost(pLostRes.value.data);
      if (pFoundRes.status === 'fulfilled') setPersonalFound(pFoundRes.value.data);
      if (pubFoundRes.status === 'fulfilled') setPublicFound(pubFoundRes.value.data.slice(0, 3));
      if (pubLostRes.status === 'fulfilled') setPublicLost(pubLostRes.value.data.slice(0, 3));
      if (assetRes.status === 'fulfilled') setAssets(assetRes.value.data);
      if (deptRes.status === 'fulfilled' && user?.department) {
        const rankings = deptRes.value.data;
        const index = rankings.findIndex(r => r.department === user.department);
        if (index !== -1) setDeptRank({ rank: index + 1, total: rankings.length, points: rankings[index].total_points });
      }

      // Fetch potential matches (notifications or direct check)
      const notifRes = await apiClient.get('/notifications');
      const matches = notifRes.data.filter(n => !n.is_read && n.title.includes("Direct Match"));
      setPendingMatches(matches);
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
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Mission <span className="gradient-text not-italic text-uni-400">Control</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional ID: {user?.student_id_number || 'UNRESOLVED'}</p>
        </div>
        <AchievementBadge points={user?.integrity_points || 0} />
      </header>

      {/* Action Alerts */}
      <AnimatePresence>
        {pendingMatches.map(match => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            onClick={() => navigate(`/match-review/${match.lost_item_id}/${match.found_item_id}`)}
            className="bg-uni-600/10 border border-uni-500/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-uni-600/20 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-uni-500/5 blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/5 group-hover:border-uni-500/30 transition-colors">🔍</div>
              <div className="text-left space-y-1">
                <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">Action Required: Potential Match</p>
                <p className="text-sm font-bold text-white leading-relaxed">Someone found an item that might be yours. Please verify it now.</p>
              </div>
            </div>
            <div className="px-8 py-3 bg-uni-600 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-uni-600/20 group-hover:bg-uni-500 transition-colors whitespace-nowrap">
              Verify Match →
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard index={0} icon="fa-search" label="Lost" value={personalLost.length} color="blue" variants={statVariants} />
        <StatCard index={1} icon="fa-hand-holding-heart" label="Found" value={personalFound.length} color="green" variants={statVariants} />
        <StatCard index={2} icon="fa-award" label="Points" value={user?.integrity_points || 0} color="gold" variants={statVariants} />
        <StatCard index={3} icon="fa-bolt" label="Active" value={personalLost.filter(r => r.status === 'matched').length} color="blue" variants={statVariants} />
        <StatCard index={4} icon="fa-box-archive" label="Vault" value={assets.length} color="purple" variants={statVariants} />
      </section>

      {/* Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Public Snapshot */}
        <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-uni-500 animate-pulse"></span>
                        Live Discovery Feed
                    </h2>
                    <Link to="/public-feed" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Full Inventory</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-44 bg-white/5 animate-pulse rounded-3xl"></div>)
                    ) : publicFound.length === 0 ? (
                        <div className="col-span-full py-12 glass-panel border-dashed border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Registry Empty</p>
                        </div>
                    ) : (
                        publicFound.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => navigate(`/submit-claim/${item.id}`)}
                                className="glass-panel p-4 border border-white/5 hover:border-uni-500/30 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="h-28 w-full bg-slate-900 rounded-2xl mb-3 overflow-hidden shadow-inner">
                                    {item.safe_photo_url ? (
                                        <img src={item.safe_photo_url} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📦</div>
                                    )}
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-1 line-clamp-1">{item.item_name}</h4>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-auto">{item.location_zone}</p>
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-uni-500 text-white text-[7px] font-black uppercase tracking-tighter shadow-lg shadow-uni-500/20">NEW</div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Community Searches
                    </h2>
                    <Link to="/lost-reports" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Registry View</Link>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl"></div>)
                    ) : publicLost.length === 0 ? (
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-6">Registry Empty</p>
                    ) : (
                        publicLost.map((report, i) => (
                            <motion.div 
                                key={report.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel-simple p-4 flex items-center justify-between gap-4 border border-transparent hover:border-white/5 group rounded-2xl hover:bg-white/[0.02]"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-lg border border-white/5 group-hover:border-amber-500/30 transition-colors">🔍</div>
                                    <div className="text-left min-w-0">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate">{report.item_name}</h4>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            {report.location_zone} <span className="text-slate-800">•</span> {report.guest_first_name ? `${report.guest_first_name[0]}***` : 'Student'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap">Witness Wanted</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Right Col: Personal Context */}
        <div className="space-y-8">
            {/* Honor Snapshot */}
            <div className="glass-panel p-6 rounded-[2rem] border border-brand-gold/30 bg-brand-gold/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <i className="fa-solid fa-ranking-star text-brand-gold"></i>
                    Honor Context
                </h3>
                <div className="space-y-6 text-left">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">College Standing</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none truncate max-w-[150px]">{user?.department || 'Unassigned'}</h4>
                            <p className="text-2xl font-black text-brand-gold tracking-tighter italic leading-none">#{deptRank?.rank || '??'}</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-brand-gold shadow-[0_0_8px_rgba(255,193,7,0.4)]" style={{ width: deptRank ? `${(1 - (deptRank.rank - 1) / deptRank.total) * 100}%` : '0%' }}></div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            {user?.integrity_points > 0 
                                ? `Contribution recognized at Institutional Level ${Math.ceil(user.integrity_points/10)}. Keep climbing.`
                                : 'Become a guardian of the university by surrendering found items.'}
                        </p>
                        <Link to="/hall-of-integrity" className="text-[8px] font-black text-brand-gold uppercase tracking-[0.2em] hover:text-white transition-colors block">Enter Hall of Integrity →</Link>
                    </div>
                </div>
            </div>

            {/* Case Queue */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/5">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2 font-display">
                    <i className="fa-solid fa-clock-rotate-left text-uni-400"></i>
                    Case Queue
                </h3>
                <div className="space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl"></div>)
                    ) : (personalLost.length + personalFound.length) === 0 ? (
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center py-6 italic border border-dashed border-white/5 rounded-2xl">No active cases.</p>
                    ) : (
                        [...personalLost, ...personalFound].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4).map((case_item, i) => (
                            <div key={i} className="flex items-center justify-between group p-2 hover:bg-white/[0.02] rounded-xl transition-all cursor-default">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest truncate max-w-[120px]">{case_item.item_name}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{case_item.status.replace('_', ' ')}</p>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${['matched', 'pending_owner'].includes(case_item.status) ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}></div>
                            </div>
                        ))
                    )}
                </div>
                <Link to="/my-claims" className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.3em] text-center block border border-white/5">
                    Open Case Hub
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, variants, index }) => {
  const colors = {
    blue: 'from-blue-600/20 to-blue-400/5 text-blue-400 border-blue-500/20 shadow-blue-500/10',
    green: 'from-green-600/20 to-green-400/5 text-green-400 border-green-500/20 shadow-green-500/10',
    gold: 'from-brand-gold/20 to-yellow-400/5 text-brand-gold border-brand-gold/20 shadow-brand-gold/10',
    purple: 'from-purple-600/20 to-purple-400/5 text-purple-400 border-purple-500/20 shadow-purple-500/10'
  };

  return (
    <motion.div 
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      className={`glass-panel p-4 md:p-6 rounded-2xl border relative group overflow-hidden transition-all hover:scale-[1.02] ${colors[color].split(' ')[3]}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].split(' ').slice(0,2).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-sm mb-4 border border-white/5 ${colors[color].split(' ')[2]} group-hover:border-current transition-colors`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="mt-auto space-y-0.5">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          <h4 className="text-2xl font-black text-white tracking-tighter">{value.toString().padStart(2, '0')}</h4>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
