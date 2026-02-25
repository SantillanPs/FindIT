import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import { CATEGORIES } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [items, setItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [lostLoading, setLostLoading] = useState(true);
  const [sharedId, setSharedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lostSearchQuery, setLostSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLostCategory, setSelectedLostCategory] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '' });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicFeed();
    fetchLostReports();
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
            className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed font-medium px-4"
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
                className="bg-uni-600 hover:bg-uni-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl shadow-uni-500/20 hover:scale-[1.05]"
            >
                Report a lost item
            </button>
            <button 
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/5 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-[1.05]"
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
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Reunion Alerts</h2>
              <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-widest">Items found with visible names or IDs</p>
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
                
                <div className="h-48 bg-slate-900 flex items-center justify-center text-7xl opacity-20 group-hover:opacity-30 transition-opacity">
                   {item.safe_photo_url ? (
                     <img src={item.safe_photo_url} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <i className="fa-solid fa-fingerprint"></i>
                   )}
                </div>

                <div className="p-8 text-left space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner Identified as:</p>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1 italic">
                        {item.identified_name || `ID: ${item.identified_student_id?.replace(/(\d{4})-(\d{2})/, '$1-****')}`}
                      </h3>
                   </div>

                   <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-2">
                     A {item.item_name} recovered at {item.location_zone}.
                   </p>

                   <div className="pt-6 border-t border-white/5 flex gap-3">
                      <button 
                         onClick={() => navigate(`/submit-claim/${item.id}`)}
                         className="flex-grow bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all"
                      >
                         Claim this item
                      </button>
                      <button 
                         onClick={() => handleShare(item)}
                         className="w-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
                         title="Notify Friend"
                      >
                         <i className="fa-solid fa-paper-plane"></i>
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Registry Browser */}
      <section id="browse" className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-white/5 pb-8 md:pb-10">
           <div className="text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Public Registry</h2>
              <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-widest">Live feed of items recovered on campus</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
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
                <option value="Cellphone">Cellphone</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="ID Card">ID Card</option>
                <option value="Wallet">Wallet</option>
                <option value="Bag / Backpack">Bag / Backpack</option>
                <option value="Keys">Keys</option>
                <option value="Headphones / Earbuds">Headphones / Earbuds</option>
                <option value="Watch / Wearable">Watch / Wearable</option>
                <option value="Water Bottle">Water Bottle</option>
                <option value="Umbrella">Umbrella</option>
                <option value="Eyewear">Eyewear</option>
                <option value="Book">Book</option>
                <option value="Notebook">Notebook</option>
                <option value="Stationery">Stationery</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
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
            <div className="py-32 text-center glass-panel rounded-[3rem] border border-white/5">
                <div className="text-5xl opacity-20 mb-6">📦</div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No matching items</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">We couldn't find any results for your current filters.</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b border-white/5 pb-8 md:pb-10">
           <div className="text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Lost Reports</h2>
              <p className="text-accent-default text-[10px] md:text-sm font-black uppercase tracking-widest">Help our community find their missing belongings</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
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
            <div className="py-32 text-center glass-panel rounded-[3rem] border border-white/5">
                <div className="text-5xl opacity-20 mb-6">🔍</div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No active lost reports</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">We couldn't find any lost items matching your current filters.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLostReports.map(report => (
                    <LostReportCard 
                        key={report.id}
                        report={report}
                    />
                ))}
            </div>
        )}
      </section>

      {/* Hall of Integrity / Leaderboard Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-uni-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
        
        <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 space-y-8 text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-uni-400 text-[9px] font-black uppercase tracking-widest">
                    <i className="fa-solid fa-trophy"></i>
                    Honor System Active
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">"The Hall of <br/><span className="gradient-text">Integrity</span>"</h2>
                <p className="text-slate-400 text-sm font-bold leading-relaxed uppercase tracking-widest max-w-md">
                    Returning lost items isn't just a service—it's a signal of character. Every item returned strengthens our community. Your email is your badge of honor.
                </p>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white italic">
                                S{i}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        <span className="text-white">124+ Students</span> <br/>
                        Recognized this semester
                    </p>
                </div>
            </div>

            <div className="md:w-1/2 w-full">
                <div className="glass-panel p-8 md:p-10 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-md relative">
                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-uni-600 px-4 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl">Top List</div>
                    
                    <div className="space-y-6">
                        {[
                            { email: 'm***n@university.edu', points: 125, rank: 1, icon: '👑' },
                            { email: 's***j@university.edu', points: 90, rank: 2, icon: '🔥' },
                            { email: 'a***p@university.edu', points: 75, rank: 3, icon: '✨' },
                            { email: 'p***z@university.edu', points: 40, rank: 4, icon: '🛡️' },
                            { email: 'k***l@university.edu', points: 35, rank: 5, icon: '🔰' }
                        ].map((student, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                                        i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 
                                        i === 1 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/20' :
                                        i === 2 ? 'bg-orange-800/20 text-orange-800 border border-orange-800/20' :
                                        'bg-white/5 text-slate-500 border border-white/5'
                                    }`}>
                                        {student.rank}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-white tracking-widest font-mono opacity-80 group-hover:opacity-100 transition-opacity">{student.email}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{student.rank === 1 ? 'Prime Keeper' : 'Scholar of Honor'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-uni-400 tracking-[0.2em]">{student.points} IP</p>
                                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                                            <div className="h-full bg-uni-400" style={{ width: `${(student.points/125)*100}%` }}></div>
                                        </div>
                                    </div>
                                    <span className="text-xl">{student.icon}</span>
                                </div>
                            </div>
                        ))}
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
            <div className="glass-panel border border-white/10 bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4">
              <i className="fa-solid fa-check-circle text-green-400"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
