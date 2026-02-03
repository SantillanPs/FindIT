import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

const FoundPublicFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location_zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      <motion.header className="space-y-4" variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Browse Found Items
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Everything found on campus is listed here. If you see something that belongs to you, click the button to claim it.
        </p>
      </motion.header>

      {/* Filters */}
      <motion.div variants={itemVariants} className="glass-panel p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
                type="text"
                placeholder="Search description, location..."
                className="input-field pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <select 
            className="input-field md:w-64 font-black uppercase text-[10px] tracking-widest px-4"
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
      </motion.div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[350px] md:h-[400px] bg-white/5 animate-pulse rounded-3xl"></div>
            ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div variants={itemVariants}>
                <EmptyState 
                title="Nothing Found"
                message="We couldn't find any items matching your current filters."
                />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -5 }}
                    className="glass-panel rounded-3xl overflow-hidden border border-white/5 group flex flex-col"
                >
                    <div className="h-48 relative bg-slate-950 overflow-hidden shrink-0">
                        {item.safe_photo_url ? (
                            <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                                📦
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-uni-400 text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                                {item.location_zone}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow text-left">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">{item.category} recovered</h3>
                                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Ref: #{item.id.toString().padStart(4, '0')}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] md:text-xs italic leading-relaxed mb-8 flex-grow">
                            "{item.description}"
                        </p>
                        
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {new Date(item.found_time).toLocaleDateString()}
                            </span>
                            <button 
                                onClick={() => navigate(`/submit-claim/${item.id}`)}
                                className="bg-uni-600 hover:bg-uni-500 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-uni-500/10"
                            >
                                This is mine
                            </button>
                        </div>
                    </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default FoundPublicFeed;
