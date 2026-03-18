import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import WitnessReportModal from '../components/WitnessReportModal';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import ItemDetailsPeek from '../components/ItemDetailsPeek';

const Landing = () => {
  const { categories: CATEGORIES } = useMasterData();
  const [items, setItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [lostLoading, setLostLoading] = useState(true);
  const [sharedId, setSharedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lostSearchQuery, setLostSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLostCategory, setSelectedLostCategory] = useState('all');
  const [activeItem, setActiveItem] = useState(null);
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [visibleItems, setVisibleItems] = useState(6);
  const [visibleLostReports, setVisibleLostReports] = useState(6);
  const [leaderboardType, setLeaderboardType] = useState('students'); // 'students' or 'colleges'
  const [topColleges, setTopColleges] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicFeed();
    fetchLostReports();
    fetchLeaderboardData();
    handleSharedItem();
  }, []);

  const handleSharedItem = () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('item');
    if (itemId) {
      // We will handle opening the modal after items are loaded
      setSharedId(itemId);
    }
  };

  const fetchPublicFeed = async () => {
    try {
      const response = await apiClient.get('/found/public');
      const data = response.data.map(item => {
        const foundDate = new Date(item.found_time);
        const now = new Date();
        const isRecent = (now - foundDate) < (48 * 60 * 60 * 1000);
        return { ...item, is_recent: isRecent };
      });
      setItems(data);
      
      // Auto-open if shared
      const params = new URLSearchParams(window.location.search);
      const sId = params.get('item');
      if (sId) {
        const sharedItem = data.find(i => i.id.toString() === sId);
        if (sharedItem) setActiveItem(sharedItem);
      }
    } catch (error) {
      console.error('Failed to fetch public feed', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchLostReports = async () => {
    try {
      const resp = await apiClient.get('/lost/public');
      const data = resp.data.map(report => {
        const lostDate = new Date(report.last_seen_time);
        const now = new Date();
        const isRecent = (now - lostDate) < (48 * 60 * 60 * 1000);
        return { ...report, is_recent: isRecent };
      });
      setLostReports(data);
    } catch (err) {
      console.error("Failed to fetch lost reports", err);
    } finally {
      setLostLoading(false);
    }
  };

  const fetchLeaderboardData = async () => {
    setLeaderboardLoading(true);
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
      setLeaderboardLoading(false);
    }
  };

  const handleShare = async (item) => {
    const shareUrl = `${window.location.origin}/?item=${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharedId(item.id);
      showToast('Link copied to clipboard!');
      setTimeout(() => setSharedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleWitness = (report) => {
    setSelectedLostReport(report);
    setShowWitnessModal(true);
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.location_zone?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.found_time) - new Date(a.found_time));

  const filteredLostReports = lostReports
    .filter(report => {
      const matchesSearch = (report.description?.toLowerCase().includes(lostSearchQuery.toLowerCase()) || 
                            report.item_name?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                            report.category?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                            report.location_zone?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                            report.owner_name?.toLowerCase().includes(lostSearchQuery.toLowerCase()));
      const matchesCategory = selectedLostCategory === 'all' || report.category === selectedLostCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.last_seen_time) - new Date(a.last_seen_time));

  return (
    <div className="space-y-10 md:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel border border-white/10 text-uni-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-12 shadow-xl shadow-uni-500/5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-default opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-default"></span>
            </span>
            Official Lost & Found Portal
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-7xl md:text-9xl font-black text-white mb-4 md:mb-10 tracking-tighter leading-[0.9] italic px-2"
          >
            Lost it? <br />
            <span className="gradient-text not-italic">Find it.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-2xl text-text-muted max-w-2xl mx-auto mb-8 md:mb-20 leading-relaxed font-medium px-8 md:px-4 opacity-80"
          >
            Official community registry for lost and found items. Report what you lost, list what you've found, and reconnect.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 px-8"
          >
            <button 
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="group relative px-6 md:px-14 py-4 md:py-6 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all overflow-hidden border-2 border-accent-default/50 hover:border-accent-default"
            >
                <div className="absolute inset-0 bg-accent-default/5 group-hover:bg-accent-default transition-all duration-300"></div>
                <span className="relative text-accent-default group-hover:text-white transition-colors">Report lost item</span>
            </button>
            <button 
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="group relative px-6 md:px-14 py-4 md:py-6 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all overflow-hidden border-2 border-uni-500/50"
            >
                <div className="absolute inset-0 bg-uni-500/5 group-hover:bg-uni-500 transition-all"></div>
                <span className="relative text-uni-400 group-hover:text-white transition-colors">I found something</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Reunion Alerts (Identified Items) */}
      {items.some(i => i.identified_name || i.identified_student_id) && (
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16">
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-uni-500 flex items-center justify-center text-white text-xl md:text-3xl shadow-2xl shadow-uni-500/30">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="text-left">
              <h2 className="text-xl md:text-3xl font-black text-text-header uppercase tracking-tight">Reunion Alerts</h2>
              <p className="text-text-muted text-[8px] md:text-sm font-black uppercase tracking-widest leading-none">Identified Items</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 no-scrollbar snap-x px-6 md:px-0">
            {items.filter(i => i.identified_name || i.identified_student_id).map(item => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -12, scale: 1.02 }}
                className="min-w-[280px] md:min-w-[420px] snap-start glass-panel rounded-[2rem] md:rounded-[2.5rem] border-2 border-uni-500/40 overflow-hidden flex flex-col relative group shadow-2xl shadow-uni-500/10"
              >
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                   <span className="px-4 py-2 md:px-5 md:py-2.5 bg-uni-500 text-white text-[9px] md:text-[11px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl shadow-uni-500/40 flex items-center gap-2">
                      <i className="fa-solid fa-id-card"></i>
                      Identity Found
                   </span>
                </div>
                
                 <div className="aspect-[4/3] md:h-56 bg-bg-surface flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-uni-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    {item.safe_photo_url ? (
                      <img src={item.safe_photo_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <i className="fa-solid fa-fingerprint text-8xl text-text-muted opacity-20 group-hover:scale-125 transition-transform duration-700"></i>
                    )}
                 </div>

                 <div className="p-6 md:p-10 text-left space-y-4 md:space-y-8 bg-gradient-to-b from-bg-surface to-bg-main/90 flex-grow">
                    <div className="space-y-1 md:space-y-3">
                       <p className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em]">Owner Identified:</p>
                       <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter line-clamp-2 italic group-hover:text-uni-400 transition-colors">
                         {item.identified_name || `ID: ${item.identified_student_id?.replace(/(\d{4})-(\d{2})/, '$1-****')}`}
                       </h3>
                    </div>
 
                    <p className="text-slate-200 text-[12px] md:text-sm font-bold leading-relaxed line-clamp-2 uppercase tracking-wide">
                      A <span className="text-white font-black underline decoration-uni-500/50">{item.item_name}</span> recovered at <span className="text-white font-black">{item.location_zone}</span>.
                    </p>

                   <div className="pt-6 md:pt-8 border-t border-white/5 flex gap-3 md:gap-4">
                      <button 
                         onClick={() => navigate(`/submit-claim/${item.id}`)}
                         className="flex-grow bg-white text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-uni-500 hover:text-white transition-all shadow-lg hover:shadow-uni-500/30"
                      >
                         Claim item
                      </button>
                      <button 
                         onClick={() => handleShare(item)}
                         className="w-12 h-12 md:w-16 md:h-16 bg-bg-elevated border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-text-header hover:bg-uni-500 transition-all group/btn shadow-lg"
                         title="Notify Friend"
                      >
                         <i className="fa-solid fa-paper-plane text-text-muted group-hover/btn:text-white group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-all"></i>
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Hall of Integrity / Leaderboard Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-12 md:mb-20">
            <div className="md:w-1/2 space-y-8 text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-uni-400 text-[9px] font-black uppercase tracking-widest">
                    <i className="fa-solid fa-trophy"></i>
                    Honor System Active
                </div>
                <h2 className="text-3xl md:text-7xl font-black text-text-header uppercase tracking-tighter leading-none italic">"The Hall of <br/><span className="gradient-text not-italic">Integrity</span>"</h2>
                <p className="text-text-muted text-base md:text-lg font-bold leading-relaxed uppercase tracking-widest max-w-lg opacity-80 px-1 md:px-0">
                    Returning lost items isn't just a service—it's a signal of character. Every item returned strengthens our community. Your email is your badge of honor.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-bg-surface/40 border border-white/5 rounded-2xl w-full sm:w-fit backdrop-blur-xl">
                    <button 
                        onClick={() => setLeaderboardType('students')}
                        className={`px-6 md:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex-grow sm:flex-grow-0 ${leaderboardType === 'students' ? 'bg-uni-600 text-white shadow-2xl shadow-uni-500/30' : 'text-text-muted hover:text-text-header hover:bg-white/5'}`}
                    >
                        <i className="fa-solid fa-user-graduate mr-2"></i>
                        Top Keepers
                    </button>
                    <button 
                        onClick={() => setLeaderboardType('colleges')}
                        className={`px-6 md:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex-grow sm:flex-grow-0 ${leaderboardType === 'colleges' ? 'bg-amber-600 text-white shadow-2xl shadow-amber-500/30' : 'text-text-muted hover:text-text-header hover:bg-white/5'}`}
                    >
                        <i className="fa-solid fa-building-columns mr-2"></i>
                        Top Colleges
                    </button>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-border-main/10">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-border-main bg-bg-elevated flex items-center justify-center text-[10px] font-black text-text-header italic">
                                S{i}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                        <span className="text-text-header">124+ Students</span> <br/>
                        Recognized this semester
                    </p>
                </div>
            </div>

            <div className="md:w-1/2 w-full relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-uni-600 px-4 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl z-20">Top List</div>
                
                <div className="glass-panel p-2 md:p-6 rounded-[2.5rem] border border-border-main/30 bg-bg-surface/40">
                    <div className="space-y-1">
                        {leaderboardLoading ? (
                            <div className="py-20 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">Calculating honor list...</div>
                        ) : leaderboardType === 'students' ? (
                            topStudents.length > 0 ? (
                                topStudents.slice(0, 5).map((student, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 py-5 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                                i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 
                                                i === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                                                i === 2 ? 'bg-orange-800/20 text-orange-800 border border-orange-800/30' :
                                                'bg-bg-elevated/50 text-text-muted border border-border-main/10'
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[11px] font-black text-text-header tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {student.full_name_masked}
                                                </p>
                                                <p className="text-[8px] font-bold text-uni-400 uppercase tracking-widest">
                                                    {student.department || 'General Education'} • {student.rank === 1 ? 'Prime Keeper' : 'Scholar of Honor'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[11px] font-black text-uni-400 tracking-[0.2em]">{student.integrity_points} IP</p>
                                                <div className="w-12 h-1 bg-bg-elevated/50 rounded-full overflow-hidden mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-full bg-uni-400" style={{ width: `${(student.integrity_points / (topStudents[0]?.integrity_points || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <span className="text-xl group-hover:scale-110 transition-transform">
                                                {i === 0 ? '👑' : i === 1 ? '🔥' : i === 2 ? '✨' : i === 3 ? '🛡️' : '🔰'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">The Hall is currently empty...</div>
                            )
                        ) : (
                            topColleges.length > 0 ? (
                                topColleges.slice(0, 5).map((col, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 py-5 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black bg-bg-elevated/50 text-text-muted border border-border-main/10 group-hover:border-amber-500/30 transition-all">
                                                {i + 1}
                                            </div>
                                            <div className="text-left text-ellipsis overflow-hidden max-w-[150px]">
                                                <p className="text-[11px] font-black text-text-header tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">{col.department}</p>
                                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{col.student_count} Active Students</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[11px] font-black text-amber-500 tracking-[0.2em]">{col.total_points} IP</p>
                                                <div className="w-12 h-1 bg-bg-elevated/50 rounded-full overflow-hidden mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-full bg-amber-500" style={{ width: `${(col.total_points / (topColleges[0]?.total_points || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">Collecting college stats...</div>
                            )
                        )}
                </div>
            </div>
        </div>
        </div>
        </div>
      </section>

      {/* Mission Protocol (How it Works) */}
      <section className="relative py-8 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
            <div className="text-center space-y-4 mb-12 md:mb-24">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-text-muted text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                  The Mission Protocol
               </div>
               <h2 className="text-3xl md:text-6xl font-black text-text-header uppercase tracking-tighter italic">How it <span className="gradient-text not-italic">Works</span></h2>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
               {[
                 { step: '01', title: 'REPORT IT', desc: 'Found something or lost something? Log it in our community registry with a few taps.', icon: 'fa-file-signature', color: 'bg-uni-500' },
                 { step: '02', title: 'VERIFY IT', desc: 'Our system matches reports automatically. Human moderators ensure every claim is legitimate.', icon: 'fa-shield-halved', color: 'bg-accent-default' },
                 { step: '03', title: 'RECOVER IT', desc: 'Reconnect with your belongings at the designated security station or meetup point.', icon: 'fa-hand-holding-heart', color: 'bg-green-500' }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   className="relative p-8 md:p-12 glass-panel rounded-[2rem] md:rounded-[3rem] border border-white/5 text-center group"
                 >
                   <div className={`absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 ${item.color} rounded-xl md:rounded-2xl flex items-center justify-center text-white text-lg md:text-2xl shadow-2xl z-10`}>
                     <i className={`fa-solid ${item.icon}`}></i>
                   </div>
                   <div className="text-5xl md:text-7xl font-black text-white/5 absolute top-8 md:top-10 left-1/2 -translate-x-1/2 select-none">{item.step}</div>
                   <div className="relative z-10 space-y-3 md:space-y-4 mt-6 md:mt-8">
                     <h4 className="text-lg md:text-2xl font-black text-text-header uppercase tracking-tight italic">{item.title}</h4>
                     <p className="text-text-muted text-[10px] md:text-sm font-bold leading-relaxed uppercase tracking-widest opacity-80">{item.desc}</p>
                   </div>
                 </motion.div>
               ))}
            </div>
        </div>
      </section>
      <section id="browse" className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-12 border-b border-white/5 pb-8 md:pb-12">
           <div className="text-left space-y-2 md:space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-5xl font-black text-text-header uppercase tracking-tighter italic">Public Registry</h2>
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-uni-500/10 border border-uni-500/20 text-uni-400 text-[8px] md:text-[9px] font-black rounded-lg uppercase tracking-widest animate-pulse">Live Feed</span>
              </div>
              <p className="text-text-muted text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] opacity-80 leading-relaxed">Catalog of every item recovered across campus</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto px-1 md:px-0">
              <div className="relative w-full md:w-80 group">
                  <i className="fa-solid fa-search absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-text-muted text-xs md:text-base group-focus-within:text-uni-400 transition-colors"></i>
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="input-field pl-11 md:pl-14 py-3 md:py-4 rounded-xl md:rounded-2xl border-white/5 focus:border-uni-500/50 bg-bg-surface/50 text-xs md:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
           </div>
        </div>

        {/* Smart Discovery Chips */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 mask-fade-right px-1 md:px-0">
           <button 
             onClick={() => setSelectedCategory('all')}
             className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest transition-all shrink-0 border relative z-20 ${
               selectedCategory === 'all' 
               ? 'bg-uni-500 text-white border-uni-400 shadow-lg shadow-uni-500/30' 
               : 'glass-panel border-white/5 text-text-muted hover:text-text-header hover:border-white/20'
             }`}
           >
             All
           </button>
           
           {CATEGORIES.map(cat => {
              const count = items.filter(i => i.category === cat.id).length;
              return (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-wider md:tracking-widest transition-all shrink-0 border flex items-center gap-1.5 md:gap-3 group/chip relative z-20 ${
                    selectedCategory === cat.id 
                    ? 'bg-uni-500 text-white border-uni-400 shadow-lg shadow-uni-500/30' 
                    : 'glass-panel border-white/5 text-text-muted hover:text-text-header hover:border-white/20'
                  }`}
                >
                  <span className={`${selectedCategory === cat.id ? 'opacity-100' : 'opacity-60 group-hover/chip:opacity-100'} transition-opacity pointer-events-none`}>
                    {cat.emoji}
                  </span>
                  <span className="max-w-[80px] md:max-w-none truncate pointer-events-none">{cat.label}</span>
                  {count > 0 && (
                    <span className={`px-1 py-0.5 rounded-md text-[7px] md:text-[8px] pointer-events-none ${
                      selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
           })}
        </div>

        {itemsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[280px] md:h-[400px] bg-white/5 animate-pulse rounded-2xl md:rounded-[2.5rem]"></div>
                ))}
            </div>
        ) : filteredItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 relative overflow-hidden group"
            >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-uni-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 max-w-md mx-auto px-6">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce transition-transform group-hover:scale-110">
                    🔍
                  </div>
                  <h3 className="text-2xl font-black text-text-header uppercase tracking-tighter italic mb-4">No matching records found</h3>
                  <p className="text-text-muted text-xs font-medium uppercase tracking-[0.15em] leading-relaxed mb-10 opacity-70">
                    We've scanned our entire institutional ledger but couldn't find a match for your search parameters.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto border border-white/5"
                    >
                      Reset Filters
                    </button>
                    <Link 
                      to={user ? "/student/report-lost" : "/report-lost/guest"}
                      className="px-8 py-4 bg-accent-default hover:bg-accent-active text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto shadow-lg shadow-accent-default/30"
                    >
                      Report it Missing
                    </Link>
                  </div>
                </div>
            </motion.div>
        ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                  {filteredItems.slice(0, visibleItems).map(item => (
                      <ItemCard 
                          key={item.id}
                          item={item}
                          onClick={() => setActiveItem(item)}
                          onShare={handleShare}
                      />
                  ))}
              </div>
              
              {filteredItems.length > visibleItems && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleItems(prev => prev + 6)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 flex items-center gap-3 group"
                  >
                    Show More Discoveries
                    <i className="fa-solid fa-chevron-down opacity-50 group-hover:translate-y-1 transition-transform"></i>
                  </button>
                </div>
              )}
            </>
        )}
        </div>
      </section>

      {/* Item Details Detail Peek */}
      <AnimatePresence>
        {activeItem && (
          <ItemDetailsPeek 
            item={activeItem} 
            isOpen={!!activeItem}
            onClose={() => setActiveItem(null)}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* Lost Items Registry */}
      <section id="lost-registry" className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 border-b border-white/5 pb-10 md:pb-12">
           <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-5xl font-black text-text-header uppercase tracking-tighter italic">Lost Reports</h2>
                <span className="px-3 py-1 bg-accent-default/10 border border-accent-default/20 text-accent-default text-[9px] font-black rounded-lg uppercase tracking-widest animate-pulse">Active Search</span>
              </div>
              <p className="text-text-muted text-xs md:text-sm font-bold uppercase tracking-[0.2em] opacity-80">Help our community find their missing belongings</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-5 w-full md:w-auto">
              <div className="relative w-full sm:w-80 group">
                  <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-default transition-colors"></i>
                  <input 
                    type="text" 
                    placeholder="Search by owner, item, description..." 
                    className="input-field pl-14 py-4 rounded-2xl border-white/5 focus:border-accent-default/50 bg-bg-surface/50"
                    value={lostSearchQuery}
                    onChange={(e) => setLostSearchQuery(e.target.value)}
                  />
              </div>
           </div>
        </div>

        {/* Smart Discovery Chips for Lost Reports */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 mask-fade-right relative z-10">
           <button 
             onClick={() => setSelectedLostCategory('all')}
             className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border relative z-20 ${
               selectedLostCategory === 'all' 
               ? 'bg-accent-default text-white border-accent-default/40 shadow-lg shadow-accent-default/30' 
               : 'glass-panel border-white/5 text-text-muted hover:text-text-header hover:border-white/20'
             }`}
           >
             Every Report
           </button>
           
           {[...CATEGORIES].sort((a,b) => (a.label || '').localeCompare(b.label || '')).map(cat => {
             const count = lostReports.filter(r => r.category === cat.id).length;
             return (
               <button 
                 key={cat.id}
                 onClick={() => setSelectedLostCategory(cat.id)}
                 className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border flex items-center gap-3 group/chip relative z-20 ${
                   selectedLostCategory === cat.id 
                   ? 'bg-accent-default text-white border-accent-default/40 shadow-lg shadow-accent-default/30' 
                   : 'glass-panel border-white/5 text-text-muted hover:text-text-header hover:border-white/20'
                 }`}
               >
                 <span className={`${selectedLostCategory === cat.id ? 'opacity-100' : 'opacity-60 group-hover/chip:opacity-100'} transition-opacity pointer-events-none`}>
                   {cat.emoji}
                 </span>
                 <span className="pointer-events-none">{cat.label}</span>
                 {count > 0 && (
                   <span className={`px-2 py-0.5 rounded-md text-[8px] pointer-events-none ${
                     selectedLostCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                   }`}>
                     {count}
                   </span>
                 )}
               </button>
             );
           })}
        </div>

        {lostLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[2.5rem]"></div>
                ))}
            </div>
        ) : filteredLostReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-24 text-center glass-panel rounded-[3rem] border border-white/5 relative overflow-hidden group"
            >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-default/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 max-w-md mx-auto px-6">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 animate-pulse transition-transform group-hover:scale-110">
                    🤝
                  </div>
                  <h3 className="text-2xl font-black text-text-header uppercase tracking-tighter italic mb-4">No active lost reports</h3>
                  <p className="text-text-muted text-xs font-medium uppercase tracking-[0.15em] leading-relaxed mb-10 opacity-70">
                    All missing items seem to be accounted for! If you've found something that isn't listed here, you should report it.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <button 
                      onClick={() => { setLostSearchQuery(''); setSelectedLostCategory('all'); }}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto border border-white/5"
                    >
                      Clear Search
                    </button>
                    <Link 
                      to={user ? "/student/report-found" : "/report-found/guest"}
                      className="px-8 py-4 bg-uni-500 hover:bg-uni-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all w-full sm:w-auto shadow-lg shadow-uni-500/30"
                    >
                      Surrender Found Item
                    </Link>
                  </div>
                </div>
            </motion.div>
        ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredLostReports.slice(0, visibleLostReports).map(report => (
                      <LostReportCard 
                          key={report.id}
                          report={report}
                          onWitness={handleWitness}
                      />
                  ))}
              </div>

              {filteredLostReports.length > visibleLostReports && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleLostReports(prev => prev + 6)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 flex items-center gap-3 group"
                  >
                    View More Reports
                    <i className="fa-solid fa-chevron-down opacity-50 group-hover:translate-y-1 transition-transform"></i>
                  </button>
                </div>
              )}
            </>
        )}
        </div>
      </section>

      {/* Community Voice Section */}
      {/* <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 p-10 md:p-16 glass-panel rounded-[3rem] border border-white/5 bg-gradient-to-br from-bg-surface to-bg-main relative overflow-hidden group">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-uni-500/5 blur-[100px] group-hover:bg-uni-500/10 transition-colors"></div>
          
          <div className="md:w-3/5 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-uni-400 text-[9px] font-black uppercase tracking-widest">
              <i className="fa-solid fa-comments"></i>
              Community Dialogue
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-text-header uppercase tracking-tighter italic">Found a bug? <br/><span className="gradient-text not-italic">Help us evolve.</span></h2>
            <p className="text-text-muted text-sm font-bold leading-relaxed uppercase tracking-widest opacity-80 max-w-xl">
              FindIT is built for the community, by the community. Your reports, feature requests, and UX suggestions go directly to the Super Admin team to ensure our sanctuary remains efficient and premium.
            </p>
            <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-camera text-uni-400"></i>
                Visual Snapshot Support
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-uni-400"></i>
                Priority Review
              </div>
            </div>
          </div>
          
          <div className="md:w-2/5 flex justify-end relative z-10 w-full">
            <button 
              onClick={() => {
                // Smooth scroll to top and open modal is handled by Layout, 
                // but we can trigger it by finding the button or just using state if we were in Layout.
                // Since we are in Landing, we'll rely on the floating button being visible, 
                // or we can use a custom event.
                window.dispatchEvent(new CustomEvent('open-feedback'));
              }}
              className="w-full md:w-auto px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-uni-500/50 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group/btn"
            >
              Submit Feedback
              <i className="fa-solid fa-chevron-right text-[8px] group-hover/btn:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </section> */}

      {/* Why Register? (Incentives Section) */}
      <section className="max-w-7xl mx-auto px-4 py-12">
           <div className="glass-panel p-12 md:p-20 rounded-[4rem] border-2 border-uni-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-uni-500/10 blur-[100px] -z-10"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-16">
                 <div className="md:w-1/2 space-y-10 text-left">
                    <div className="space-y-4">
                       <h2 className="text-4xl md:text-6xl font-black text-text-header uppercase tracking-tighter italic leading-none">Why create <br/><span className="gradient-text">an account?</span></h2>
                       <p className="text-text-muted text-sm font-bold uppercase tracking-widest max-w-md">Your email isn't just a login—it's your insurance policy on campus.</p>
                    </div>

                    <div className="space-y-8">
                       <div className="flex gap-6 items-start group">
                          <div className="w-14 h-14 rounded-2xl bg-uni-500/10 border border-uni-500/20 flex items-center justify-center text-2xl group-hover:bg-uni-500 group-hover:text-white transition-all shadow-lg">🛡️</div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-text-header uppercase tracking-tight">The Safety Net</h4>
                             <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">Add your Student ID to your profile. If an item with your name or ID is found, we notify you instantly—zero effort required.</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 items-start group">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg">🏆</div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-text-header uppercase tracking-tight">College Honor</h4>
                             <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">Represent your department. Every item you return adds points to the College Leaderboard. Let's see who has the most integrity.</p>
                          </div>
                       </div>

                       <div className="flex gap-6 items-start group">
                          <div className="w-14 h-14 rounded-2xl bg-uni-400/10 border border-uni-400/20 flex items-center justify-center text-2xl group-hover:bg-uni-400 group-hover:text-white transition-all shadow-lg">📜</div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-text-header uppercase tracking-tight">Official Merit</h4>
                             <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">Reach 1,000 points to receive a physical Certificate of Appreciation for Integrity—a premium addition to your student portfolio.</p>
                          </div>
                       </div>
                    </div>

                    <button 
                       onClick={() => navigate('/register')}
                       className="bg-uni-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.05] transition-all shadow-2xl shadow-uni-500/30"
                    >
                       Get Started Now
                    </button>
                 </div>

                 <div className="md:w-1/2 flex justify-center">
                    <div className="relative">
                       <div className="absolute -inset-10 bg-uni-500/20 blur-[60px] rounded-full animate-pulse"></div>
                       <i className="fa-solid fa-id-card-clip text-[12rem] md:text-[20rem] text-uni-400/20 relative z-10"></i>
                    </div>
                 </div>
              </div>
           </div>
        </section>



      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110]"
          >
            <div className="glass-panel border border-border-main/20 bg-bg-surface/90 text-text-header px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4">
              <i className="fa-solid fa-check-circle text-green-500"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WitnessReportModal
        isOpen={showWitnessModal}
        onClose={() => setShowWitnessModal(false)}
        report={selectedLostReport}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};

export default Landing;
