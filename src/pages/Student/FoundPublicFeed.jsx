import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../constants/categories';
import ItemCard from '../../components/ItemCard';

const FoundPublicFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryStats, setCategoryStats] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicFeed();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const resp = await apiClient.get('/categories/stats');
      setCategoryStats(resp.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const sortedCategories = useMemo(() => {
    const statsMap = categoryStats.reduce((acc, curr) => ({
      ...acc, [curr.category_id]: curr.hit_count
    }), {});
    
    return [...CATEGORIES].sort((a, b) => {
      if (a.id === 'Other') return 1;
      if (b.id === 'Other') return -1;
      return (statsMap[b.id] || 0) - (statsMap[a.id] || 0);
    });
  }, [categoryStats]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            {sortedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
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
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => navigate(`/submit-claim/${item.id}`)} 
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default FoundPublicFeed;
