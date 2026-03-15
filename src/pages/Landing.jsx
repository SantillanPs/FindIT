import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import WitnessReportModal from '../components/WitnessReportModal';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';

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
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
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
  }, []);

  const fetchPublicFeed = async () => {
    try {
      const response = await apiClient.get('/found/public');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch public feed', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchLostReports = async () => {
    try {
      const resp = await apiClient.get('/lost/public');
      setLostReports(resp.data);
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

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location_zone?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredLostReports = lostReports.filter(report => {
    const matchesSearch = (report.description?.toLowerCase().includes(lostSearchQuery.toLowerCase()) || 
                          report.item_name?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                          report.category?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                          report.location_zone?.toLowerCase().includes(lostSearchQuery.toLowerCase()) ||
                          report.owner_name?.toLowerCase().includes(lostSearchQuery.toLowerCase()));
    const matchesCategory = selectedLostCategory === 'all' || report.category === selectedLostCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] md:h-[400px] bg-uni-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel border border-white/5 text-uni-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-8 md:mb-10"
          >
            <span className="w-1.5 h-1.5 md:w-2 h-2 bg-accent-default rounded-full animate-pulse"></span>
            Official Lost & Found Portal
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-tight"
          >
            Lost it? <br />
            <span className="gradient-text italic">Find it.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-xl text-text-muted max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed font-medium px-4"
          >
            The official community registry for lost and found items. Report what you lost, list what you've found, and reconnect with your belongings.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4"
          >
            <button 
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="bg-accent-default/5 hover:bg-accent-default hover:text-white text-accent-default border border-accent-default/30 px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.05] hover:border-accent-default shadow-lg shadow-accent-default/5"
            >
                Report a lost item
            </button>
            <button 
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="bg-uni-500/5 hover:bg-uni-600 hover:text-white text-uni-400 border border-uni-500/30 px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.05] hover:border-uni-400 shadow-lg shadow-uni-500/5"
            >
                I found something
            </button>
          </motion.div>
        </div>
      </section>

      {/* Reunion Alerts (Identified Items) */}
      {items.some(i => i.identified_name || i.identified_student_id) && (
        <section className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
              <i className="fa-solid fa-bullhorn animate-bounce"></i>
            </div>
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-black text-text-header uppercase tracking-tight">Reunion Alerts</h2>
              <p className="text-text-muted text-[10px] md:text-sm font-black uppercase tracking-widest">Items found with visible names or IDs</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
            {items.filter(i => i.identified_name || i.identified_student_id).map(item => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -5 }}
                className="min-w-[300px] md:min-w-[400px] snap-start glass-panel rounded-[2.5rem] border-2 border-uni-500/30 overflow-hidden flex flex-col relative group"
              >
                <div className="absolute top-6 left-6 z-10">
                   <span className="px-4 py-2 bg-uni-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-uni-500/50">
                      Identity Found
                   </span>
                </div>
                
                <div className="h-48 bg-bg-surface flex items-center justify-center text-7xl opacity-20 group-hover:opacity-30 transition-opacity">
                   {item.safe_photo_url ? (
                     <img src={item.safe_photo_url} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <i className="fa-solid fa-fingerprint text-text-muted"></i>
                   )}
                </div>

                <div className="p-8 text-left space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Owner Identified as:</p>
                      <h3 className="text-2xl font-black text-text-header uppercase tracking-tight line-clamp-1 italic">
                        {item.identified_name || `ID: ${item.identified_student_id?.replace(/(\d{4})-(\d{2})/, '$1-****')}`}
                      </h3>
                   </div>

                   <p className="text-text-muted text-xs font-bold leading-relaxed line-clamp-2">
                     A {item.item_name} recovered at {item.location_zone}.
                   </p>

                   <div className="pt-6 border-t border-border-main/10 flex gap-3">
                      <button 
                         onClick={() => navigate(`/submit-claim/${item.id}`)}
                         className="flex-grow bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all"
                      >
                         Claim this item
                      </button>
                      <button 
                         onClick={() => handleShare(item)}
                         className="w-14 bg-bg-surface border border-border-main/50 rounded-xl flex items-center justify-center text-text-header hover:bg-bg-elevated transition-all"
                         title="Notify Friend"
                      >
                         <i className="fa-solid fa-paper-plane text-text-muted"></i>
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Hall of Integrity / Leaderboard Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 space-y-8 text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-uni-400 text-[9px] font-black uppercase tracking-widest">
                    <i className="fa-solid fa-trophy"></i>
                    Honor System Active
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-text-header uppercase tracking-tighter leading-none italic">"The Hall of <br/><span className="gradient-text">Integrity</span>"</h2>
                <p className="text-text-muted text-sm font-bold leading-relaxed uppercase tracking-widest max-w-md">
                    Returning lost items isn't just a service—it's a signal of character. Every item returned strengthens our community. Your email is your badge of honor.
                </p>
                
                <div className="flex gap-2 p-1 bg-bg-surface/30 border border-border-main/20 rounded-2xl w-fit backdrop-blur-sm">
                    <button 
                        onClick={() => setLeaderboardType('students')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${leaderboardType === 'students' ? 'bg-uni-600 text-white shadow-lg shadow-uni-500/20' : 'text-text-muted hover:text-text-header'}`}
                    >
                        Top Students
                    </button>
                    <button 
                        onClick={() => setLeaderboardType('colleges')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${leaderboardType === 'colleges' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:text-text-header'}`}
                    >
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
                
                <div className="glass-panel p-2 md:p-6 rounded-[2.5rem] border border-border-main/30 bg-bg-surface/40 backdrop-blur-md">
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
      </section>

      {/* Registry Browser */}
      <section id="browse" className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-border-main/10 pb-8 md:pb-10">
           <div className="text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-text-header uppercase tracking-tight">Public Registry</h2>
              <p className="text-text-muted text-[10px] md:text-sm font-black uppercase tracking-widest">Live feed of items recovered on campus</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                  <input 
                    type="text" 
                    placeholder="Search by color, model, or area..." 
                    className="input-field pl-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
              <select 
                className="input-field sm:w-64 font-black uppercase text-[10px] tracking-widest"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Every Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
           </div>
        </div>

        {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[2.5rem]"></div>
                ))}
            </div>
        ) : filteredItems.length === 0 ? (
            <div className="py-32 text-center glass-panel rounded-[3rem] border border-border-main/20">
                <div className="text-5xl opacity-40 mb-6">📦</div>
                <h3 className="text-xl font-black text-text-header uppercase tracking-tight mb-2">No matching items</h3>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">We couldn't find any results for your current filters.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map(item => (
                    <ItemCard 
                        key={item.id}
                        item={item}
                        onClick={() => navigate(`/submit-claim/${item.id}`)}
                        onShare={handleShare}
                    />
                ))}
            </div>
        )}
      </section>

      {/* Lost Items Registry */}
      <section id="lost-registry" className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-border-main/10 pb-8 md:pb-10">
           <div className="text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-text-header uppercase tracking-tight">Lost Reports</h2>
              <p className="text-accent-default text-[10px] md:text-sm font-black uppercase tracking-widest">Help our community find their missing belongings</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                  <input 
                    type="text" 
                    placeholder="Search by owner, item, description..." 
                    className="input-field pl-12 focus:border-accent-default focus:ring-accent-glow/20"
                    value={lostSearchQuery}
                    onChange={(e) => setLostSearchQuery(e.target.value)}
                  />
              </div>
              <select 
                className="input-field sm:w-64 font-black uppercase text-[10px] tracking-widest focus:border-accent-default focus:ring-accent-glow/20"
                value={selectedLostCategory}
                onChange={(e) => setSelectedLostCategory(e.target.value)}
              >
                <option value="all">Every Category</option>
                {[...CATEGORIES].sort((a,b) => a.label.localeCompare(b.label)).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
           </div>
        </div>

        {lostLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[2.5rem]"></div>
                ))}
            </div>
        ) : filteredLostReports.length === 0 ? (
            <div className="py-32 text-center glass-panel rounded-[3rem] border border-border-main/20">
                <div className="text-5xl opacity-40 mb-6">🔍</div>
                <h3 className="text-xl font-black text-text-header uppercase tracking-tight mb-2">No active lost reports</h3>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">We couldn't find any lost items matching your current filters.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLostReports.map(report => (
                    <LostReportCard 
                        key={report.id}
                        report={report}
                        onWitness={handleWitness}
                    />
                ))}
            </div>
        )}
      </section>

      {/* Why Register? (Incentives Section) */}
      <section className="max-w-7xl mx-auto px-4 py-20">
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
            <div className="glass-panel border border-border-main/20 bg-bg-surface/90 backdrop-blur-md text-text-header px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4">
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
