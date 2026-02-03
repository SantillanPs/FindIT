import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_lost: 0, total_found: 0, total_claims: 0 });
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, foundRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/found')
      ]);
      setStats(statsRes.data);
      setRecentFound(foundRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (item, status) => {
    setActionLoading(item.id);
    try {
      await apiClient.put(`/admin/found/${item.id}/custody`, { notes: `Status updated to ${status}` });
      await fetchDashboardData(); 
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = recentFound.filter(item => 
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const statVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({ 
      y: 0, 
      opacity: 1,
      transition: { delay: i * 0.1, type: 'spring', damping: 20, stiffness: 100 }
    })
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Overview Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          index={0}
          icon="fa-box-open" 
          label="Total Found Items" 
          value={stats.total_found} 
          color="blue"
          variants={statVariants}
        />
        <StatCard 
          index={1}
          icon="fa-magnifying-glass" 
          label="Active Lost Reports" 
          value={stats.total_lost} 
          color="gold"
          variants={statVariants}
        />
        <StatCard 
          index={2}
          icon="fa-clipboard-check" 
          label="Pending Claims" 
          value={stats.total_claims} 
          color="purple" 
          variants={statVariants}
        />
      </section>

      {/* Main Management Area */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
           <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Recently Reported Items</h2>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Manage custody and status of found belongings</p>
           </div>
           
           <div className="relative w-full md:w-80">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text" 
                placeholder="Search ID, category, location..." 
                className="input-field pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 md:px-8 py-5">Item Info</th>
                <th className="px-4 md:px-8 py-5 hidden sm:table-cell">Reported By</th>
                <th className="px-4 md:px-8 py-5 hidden md:table-cell">Location / Time</th>
                <th className="px-4 md:px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-base md:text-lg shadow-inner grayscale group-hover:grayscale-0 transition-all">
                           {item.category === 'Electronics' ? '📱' : '📦'}
                        </div>
                        <div>
                            <div className="font-black text-white text-[10px] md:text-[11px] uppercase tracking-widest mb-1">{item.category}</div>
                            <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest">#{item.id.toString().padStart(4, '0')}</div>
                            <div className="md:hidden mt-2 text-[8px] text-slate-500 font-black uppercase">
                               {item.location_zone}
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 hidden sm:table-cell">
                    <div className="text-[11px] text-slate-300 font-black uppercase tracking-widest">
                        {item.finder_id ? `User ID: ${item.finder_id}` : 'Staff Member'}
                    </div>
                    <div className="text-[9px] text-slate-600 font-black uppercase mt-1 tracking-widest">
                        {item.finder_id ? 'Student Report' : 'In-House Log'}
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-left hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">
                      <i className="fa-solid fa-location-dot text-uni-500"></i> {item.location_zone}
                    </div>
                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                       {new Date(item.found_time).toLocaleDateString()} at {new Date(item.found_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                          item.status === 'reported' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          item.status === 'in_custody' ? 'bg-uni-500/10 text-uni-400 border-uni-500/20' :
                          'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        
                        {item.status === 'reported' && (
                           <button 
                            onClick={() => handleStatusUpdate(item, 'in_custody')}
                            disabled={actionLoading === item.id}
                            className="text-[9px] font-black text-uni-500 hover:text-white uppercase tracking-widest border-b border-uni-500/20 pb-0.5 transition-all"
                           >
                              {actionLoading === item.id ? 'Updating...' : 'Mark as Received'}
                           </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="space-y-2 opacity-50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No items found</p>
                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, variants, index }) => {
  const themes = {
    blue: 'text-uni-400 from-uni-600/20',
    gold: 'text-brand-gold from-brand-gold/20',
    purple: 'text-purple-400 from-purple-600/20'
  };

  return (
    <motion.div 
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      className="glass-panel p-8 rounded-3xl border border-white/5 relative group overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${themes[color].split(' ')[1]} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className={`w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-xl mb-6 border border-white/5 ${themes[color].split(' ')[0]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <h4 className="text-4xl font-black text-white tracking-tighter">{value.toString().padStart(2, '0')}</h4>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
