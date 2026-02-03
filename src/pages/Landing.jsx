import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [sharedId, setSharedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicFeed();
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
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location_zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
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
                onClick={() => navigate(user ? '/report-lost' : '/report-lost-guest')}
                className="bg-uni-600 hover:bg-uni-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl shadow-uni-500/20 hover:scale-[1.05]"
            >
                Report a lost item
            </button>
            <button 
                onClick={() => navigate(user ? '/report-found' : '/login')}
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
                     A {item.category} recovered at {item.location_zone}.
                   </p>

                   <div className="pt-6 border-t border-white/5 flex gap-3">
                      <button 
                         onClick={() => navigate(`/register?claim=${item.id}`)}
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
                className="input-field sm:w-48 font-black uppercase text-[10px] tracking-widest"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Every Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Personal Effects">Personal Effects</option>
                <option value="Keys">Keys</option>
                <option value="Accessories">Accessories</option>
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
                    <motion.div 
                        key={item.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -6 }}
                        className="glass-panel group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-uni-500/30 transition-all cursor-pointer flex flex-col"
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className="h-48 md:h-56 relative overflow-hidden bg-slate-900 border-b border-white/5">
                            {item.safe_photo_url ? (
                                <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl opacity-10 font-bold uppercase tracking-tighter">
                                    {item.category.substring(0, 3)}
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-uni-400 text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest font-sans">
                                    {item.location_zone}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 text-left flex flex-col flex-grow">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-uni-400 transition-colors">
                                {item.category} recovered
                            </h3>
                            <p className="text-slate-400 text-xs italic line-clamp-2 leading-relaxed mb-8 flex-grow">"{item.description}"</p>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {new Date(item.found_time).toLocaleDateString()}
                                </span>
                                <span className="text-uni-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                    View details <i className="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </section>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-2xl rounded-[3rem] overflow-hidden relative z-10 border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors z-20 border border-white/5"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                 <div className="h-64 md:h-full relative bg-slate-900 overflow-hidden">
                    {selectedItem.safe_photo_url ? (
                        <img src={selectedItem.safe_photo_url} alt="Item detail" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">📦</div>
                    )}
                 </div>
                 <div className="p-10 text-left flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-4 py-1 bg-uni-500/10 text-uni-400 text-[10px] font-black rounded-full border border-uni-500/20 uppercase tracking-widest">{selectedItem.category}</span>
                            <span className="px-4 py-1 bg-white/5 text-slate-400 text-[10px] font-black rounded-full border border-white/5 uppercase tracking-widest">{selectedItem.location_zone}</span>
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 font-display leading-[0.9]">Item <br />Recovered</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Logged on {new Date(selectedItem.found_time).toLocaleDateString()}</p>
                        <p className="text-slate-200 mb-10 text-lg leading-relaxed font-bold italic border-l-4 border-uni-500 pl-6 py-2">"{selectedItem.description}"</p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate(`/login?redirect=/submit-claim/${selectedItem.id}`)}
                            className="w-full bg-uni-600 hover:bg-uni-500 text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-uni-500/20 transition-all hover:scale-[1.02]"
                        >
                            This is mine
                        </button>
                        <button 
                            onClick={() => handleShare(selectedItem)}
                            className={`w-full bg-white/5 font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all hover:bg-white/10 border border-white/5 ${sharedId === selectedItem.id ? 'text-green-400 border-green-500/20' : 'text-white'}`}
                        >
                            {sharedId === selectedItem.id ? 'Copied to clipboard' : 'Share report'}
                        </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
