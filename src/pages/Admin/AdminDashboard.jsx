import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../constants/categories';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_lost: 0, total_found: 0, total_claims: 0 });
  const [recentFound, setRecentFound] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('found'); // 'found', 'claims', 'matches', 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(null); // item to release
  const [releaseForm, setReleaseForm] = useState({ name: '', id_number: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, foundRes, suggestionsRes, matchesRes, claimsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/found'),
        apiClient.get('/categories/suggestions'),
        apiClient.get('/admin/matches/all'),
        apiClient.get('/admin/claims/pending')
      ]);
      setStats(statsRes.data);
      setRecentFound(foundRes.data);
      setSuggestions(suggestionsRes.data);
      setMatches(matchesRes.data);
      setPendingClaims(claimsRes.data);
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

  const handleDirectRelease = async (e) => {
    e.preventDefault();
    setActionLoading(showReleaseModal.id);
    try {
      await apiClient.post(`/admin/found/${showReleaseModal.id}/direct-release`, {
        released_to_name: releaseForm.name,
        released_to_id_number: releaseForm.id_number,
        released_by_name: 'Admin Staff' // In a real app, this would be the logged-in admin's name
      });
      setShowReleaseModal(null);
      setReleaseForm({ name: '', id_number: '' });
      await fetchDashboardData();
    } catch (err) {
      console.error('Release failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimReview = async (claimId, status) => {
    setActionLoading(`claim-${claimId}`);
    try {
      await apiClient.post(`/admin/claims/${claimId}/review`, { 
        status, 
        admin_notes: `Processed via dashboard on ${new Date().toLocaleDateString()}` 
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Review failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectMatch = async (foundId, lostId) => {
    setActionLoading(`match-${foundId}-${lostId}`);
    try {
      await apiClient.post('/admin/matches/connect', { 
        found_item_id: foundId, 
        lost_item_id: lostId 
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Connection failed', err);
    } finally {
      setActionLoading(null);
    }
  };
 
  const filteredItems = recentFound.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location_zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const filteredClaims = pendingClaims.filter(claim => 
    claim.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.found_item_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.proof_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.student_id?.toString().includes(searchTerm)
  );

  const filteredMatches = matches.filter(group => 
    group.found_item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.found_item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.top_matches.some(m => 
        m.item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.item.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-2">
            <div className="flex items-center gap-8">
               <TabButton active={currentTab === 'found'} onClick={() => setCurrentTab('found')} label="Registry" count={searchTerm ? filteredItems.length : recentFound.length} />
               <TabButton active={currentTab === 'claims'} onClick={() => setCurrentTab('claims')} label="Claims" count={searchTerm ? filteredClaims.length : pendingClaims.length} />
               <TabButton active={currentTab === 'matches'} onClick={() => setCurrentTab('matches')} label="AI Matches" count={searchTerm ? filteredMatches.length : matches.length} />
               <TabButton active={currentTab === 'analytics'} onClick={() => setCurrentTab('analytics')} label="Insights" />
            </div>
           
           {currentTab !== 'analytics' && (
             <div className="relative w-full md:w-80 pb-4">
               <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-black tracking-widest text-white outline-none focus:border-uni-500 transition-all w-full"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           )}
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
          {currentTab === 'found' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-4 md:px-8 py-5">Item Info</th>
                    <th className="px-4 md:px-8 py-5 hidden md:table-cell">Identified Owner</th>
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
                               {CATEGORIES.find(c => c.id === item.category)?.emoji || '📦'}
                            </div>
                            <div>
                                <div className="font-black text-white text-[10px] md:text-[11px] uppercase tracking-widest mb-1">{item.item_name}</div>
                                <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest">{item.category} • #{item.id.toString().padStart(4, '0')}</div>
                                <div className="md:hidden mt-2 text-[8px] text-slate-500 font-black uppercase">
                                   {item.location_zone}
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-6 hidden md:table-cell">
                        {item.identified_name || item.identified_student_id ? (
                            <div>
                                <div className="text-[11px] text-uni-400 font-black uppercase tracking-widest italic flex items-center gap-2">
                                    <i className="fa-solid fa-id-card"></i> {item.identified_name || 'Anonymous ID'}
                                </div>
                                <div className="text-[9px] text-slate-600 font-black uppercase mt-1 tracking-widest">
                                    {item.identified_student_id || 'No ID Number'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Unidentified</div>
                        )}
                      </td>
                      <td className="px-4 md:px-8 py-6 hidden sm:table-cell">
                        <div className="text-[11px] text-slate-300 font-black uppercase tracking-widest">
                            {item.finder_id ? `User ID: ${item.finder_id}` : (item.contact_full_name || 'Staff Member')}
                        </div>
                        <div className="text-[9px] text-slate-600 font-black uppercase mt-1 tracking-widest">
                            {item.finder_id ? 'Student Report' : (item.contact_full_name ? 'Guest Report' : 'In-House Log')}
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
                                className="w-full bg-uni-500 text-white text-[9px] font-black uppercase tracking-widest py-2 px-4 rounded-lg hover:bg-uni-400 transition-all shadow-lg shadow-uni-500/20"
                               >
                                  {actionLoading === item.id ? 'Updating...' : 'Receive Item'}
                               </button>
                            )}
                            
                            {(item.status === 'in_custody' || item.status === 'reported') && (
                               <button 
                                onClick={() => {
                                    setShowReleaseModal(item);
                                    setReleaseForm({ 
                                        name: item.identified_name || '', 
                                        id_number: item.identified_student_id || '' 
                                    });
                                }}
                                className="text-[9px] font-black text-green-500 hover:text-white uppercase tracking-widest border-b border-green-500/20 pb-0.5 transition-all"
                               >
                                  Direct Release
                               </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
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
          )}

          {currentTab === 'claims' && (
            <div className="p-8 space-y-6">
              {filteredClaims.length === 0 ? (
                <div className="py-20 text-center opacity-50">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No matching claims</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredClaims.map(claim => (
                    <div key={claim.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-center text-2xl overflow-hidden relative">
                             {claim.proof_photo_url ? (
                               <img src={claim.proof_photo_url} className="w-full h-full object-cover" />
                             ) : (
                               '📄'
                             )}
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">
                                {claim.guest_full_name || `Student ID: ${claim.student_id}`}
                             </p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Claiming {claim.found_item_category} • {claim.guest_email || 'Verified Student'}
                             </p>
                             <p className="text-[8px] text-uni-400 font-black uppercase mt-2 italic">
                                "{claim.proof_description.substring(0, 50)}..."
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button 
                            onClick={() => handleClaimReview(claim.id, 'rejected')}
                            disabled={actionLoading === `claim-${claim.id}`}
                            className="px-6 py-3 rounded-xl bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                          >
                             Reject
                          </button>
                          <button 
                            onClick={() => handleClaimReview(claim.id, 'approved')}
                            disabled={actionLoading === `claim-${claim.id}`}
                            className="px-6 py-3 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                          >
                             Approve
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'matches' && (
             <div className="p-8 space-y-8">
                {filteredMatches.length === 0 ? (
                  <div className="py-20 text-center opacity-50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No matching matches found</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                     {filteredMatches.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-6">
                           <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                              <div className="text-xl">📥</div>
                              <div>
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">{group.found_item.item_name} (#{group.found_item.id})</p>
                                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{group.found_item.category} at {group.found_item.location_zone}</p>
                              </div>
                              <div className="ml-auto flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-uni-400 animate-pulse"></div>
                                 <p className="text-[8px] font-black text-uni-400 uppercase tracking-[0.2em] italic">AI Confidence: {(group.max_score * 100).toFixed(0)}%</p>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8 border-l-2 border-white/5">
                              {group.top_matches.slice(0, 2).map((match, mIdx) => (
                                 <div key={mIdx} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-uni-500/30 transition-all">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-white uppercase tracking-widest">{match.item.item_name} (#{match.item.id})</p>
                                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">{match.item.description}</p>
                                       <p className="text-[7px] text-uni-400 font-black uppercase tracking-widest italic">{match.item.guest_full_name || 'Student'}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleConnectMatch(group.found_item.id, match.item.id)}
                                      disabled={actionLoading === `match-${group.found_item.id}-${match.item.id}`}
                                      className="bg-white/5 hover:bg-uni-500 text-white p-3 rounded-lg transition-all"
                                    >
                                       <i className="fa-solid fa-link text-xs"></i>
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
           )}
           
           {currentTab === 'analytics' && (
             <div className="p-8 md:p-12">
                <Analytics />
             </div>
           )}
        </div>
        </section>

      {/* Suggested Categories section */}
      {suggestions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">New Category Suggestions</h2>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Frequently reported items currently categorized as "Other"</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestions.slice(0, 8).map((sug, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between group"
              >
                <div>
                  <div className="text-[11px] font-black text-white uppercase tracking-tight mb-1">{sug.suggested_name}</div>
                  <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                    Last reported {new Date(sug.last_reported_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-uni-400">{sug.hit_count}</div>
                  <div className="text-[7px] text-slate-600 font-black uppercase tracking-[0.2em]">Hits</div>
                </div>
              </motion.div>
            ))}
          </div>
      </section>
      )}

      {/* Direct Release Modal */}
      <AnimatePresence>
        {showReleaseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setShowReleaseModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 border border-white/10 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Direct Handover</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Officially log the release of Item #{showReleaseModal.id.toString().padStart(4, '0')}</p>
              </div>

              <form onSubmit={handleDirectRelease} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient Full Name</label>
                  <input 
                    type="text"
                    required
                    className="input-field"
                    value={releaseForm.name}
                    onChange={(e) => setReleaseForm({...releaseForm, name: e.target.value})}
                    placeholder="Enter full name..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID Number</label>
                  <input 
                    type="text"
                    required
                    className="input-field"
                    value={releaseForm.id_number}
                    onChange={(e) => setReleaseForm({...releaseForm, id_number: e.target.value})}
                    placeholder="e.g. 2021-10042"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setShowReleaseModal(null)}
                    className="flex-grow bg-white/5 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-grow bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                   >
                     {actionLoading ? 'Processing...' : 'Confirm Release'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick}
    className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${
      active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    <div className="flex items-center gap-3">
       {label}
       {count > 0 && (
         <span className={`px-2 py-0.5 rounded-md text-[7px] ${active ? 'bg-uni-500 text-white' : 'bg-white/5 text-slate-500'}`}>
            {count}
         </span>
       )}
    </div>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-uni-500 shadow-[0_0_10px_rgba(var(--uni-rgb),0.5)]"
      />
    )}
  </button>
);

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
