import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';

const HallOfIntegrity = () => {
  const [leaderboardType, setLeaderboardType] = useState('students');
  const [topColleges, setTopColleges] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const [collegesResp, studentsResp] = await Promise.all([
        apiClient.get('/admin/leaderboard/departments'),
        apiClient.get('/auth/leaderboard')
      ]);
      setTopColleges(collegesResp.data);
      setTopStudents(studentsResp.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">
          Hall of <span className="gradient-text not-italic">Integrity</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Recognizing the heroes of our community. Join the ranks of those who prioritize institutional trust.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest">Select Ranking</p>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => setLeaderboardType('students')}
                            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-between group ${
                                leaderboardType === 'students' ? 'bg-uni-600 text-white shadow-xl shadow-uni-600/20' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <i className="fa-solid fa-user-graduate"></i>
                                Individual Keepers
                            </span>
                            <i className={`fa-solid fa-chevron-right text-[8px] transition-transform ${leaderboardType === 'students' ? 'translate-x-1' : 'opacity-0'}`}></i>
                        </button>
                        <button 
                            onClick={() => setLeaderboardType('colleges')}
                            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-between group ${
                                leaderboardType === 'colleges' ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <i className="fa-solid fa-building-columns"></i>
                                College Honor Roll
                            </span>
                            <i className={`fa-solid fa-chevron-right text-[8px] transition-transform ${leaderboardType === 'colleges' ? 'translate-x-1' : 'opacity-0'}`}></i>
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-uni-500/10 border border-uni-500/20 flex items-center justify-center text-xl">🎖️</div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Integrity Points</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Earned by Surrendering Items</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                        Points are awarded automatically once a surrendered item is verified by the USG office.
                    </p>
                </div>
            </div>
        </div>

        <div className="md:w-2/3 glass-panel p-8 rounded-[2.5rem] border border-white/5 min-h-[500px]">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                    <div className="w-10 h-10 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Fetching Registry...</p>
                </div>
            ) : leaderboardType === 'students' ? (
                <div className="space-y-4">
                    {topStudents.map((student, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-uni-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${
                                    i === 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-lg shadow-amber-500/20' : 
                                    i === 1 ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                                    i === 2 ? 'bg-orange-800/20 text-orange-800 border-orange-800/30' :
                                    'bg-bg-elevated/50 text-slate-500 border-white/5'
                                }`}>
                                    {i + 1}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-white tracking-widest uppercase group-hover:text-uni-400 transition-colors">
                                        {student.full_name_masked}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{student.department || 'General Education'}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                        <span className="text-[9px] font-black text-uni-400 uppercase tracking-[0.2em]">{student.rank === 1 ? 'High Guardian' : 'Reliable Contributor'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-white italic">{student.integrity_points} <span className="text-[10px] text-uni-400 not-italic uppercase tracking-widest ml-1">IP</span></p>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-uni-500" style={{ width: `${(student.integrity_points / (topStudents[0]?.integrity_points || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {topColleges.map((col, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black bg-bg-elevated/50 text-slate-500 border border-white/5 group-hover:border-amber-500/30 transition-all">
                                    {i + 1}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-white tracking-widest uppercase group-hover:text-amber-500 transition-colors">
                                        {col.department}
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Contribution from {col.student_count} Students</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-white italic">{col.total_points} <span className="text-[10px] text-amber-500 not-italic uppercase tracking-widest ml-1">IP</span></p>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-amber-500" style={{ width: `${(col.total_points / (topColleges[0]?.total_points || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default HallOfIntegrity;
