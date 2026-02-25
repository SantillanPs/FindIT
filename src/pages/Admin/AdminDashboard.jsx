import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../constants/categories';
import Analytics from './Analytics';
import UserVerification from './UserVerification';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_lost: 0, total_found: 0, total_claims: 0 });
  const [recentFound, setRecentFound] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() === 'admin' ? 'found' : location.pathname.split('/').pop();
  const [greeting, setGreeting] = useState('Good Morning');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(null); // item to release
  const [releaseStep, setReleaseStep] = useState(1);
  const [releaseForm, setReleaseForm] = useState({ name: '', id_number: '' });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewStep, setClaimReviewStep] = useState(1);
  const [selectedMatchPair, setSelectedMatchPair] = useState(null); // { found, lost, score }
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
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
    if (e) e.preventDefault();
    setActionLoading(showReleaseModal.id);
    try {
      await apiClient.post(`/admin/found/${showReleaseModal.id}/direct-release`, {
        released_to_name: releaseForm.name,
        released_to_id_number: releaseForm.id_number,
        released_by_name: 'Admin Staff'
      });
      setShowReleaseModal(null);
      setReleaseStep(1);
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
    item.status !== 'released' && (
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location_zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    )
  );

  const releasedItems = recentFound.filter(item => 
    item.status === 'released' && (
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.released_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    )
  );

  const filteredClaims = pendingClaims.filter(claim => 
    claim.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.found_item_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.proof_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.contact_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.course_department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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


  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32">

        {currentTab !== 'analytics' && currentTab !== 'users' && (
            <div className="flex justify-end pt-2 mt-4">
                <div className="relative w-full md:w-80">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-black tracking-widest text-white outline-none focus:border-uni-500 transition-all w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </div>
        )}

        {/* Main Management Area */}
        <section className="space-y-6">

        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">

          {currentTab === 'found' && (
            <div className="p-6 md:p-8 space-y-4">
              {filteredItems.length === 0 ? (
                <div className="py-20 text-center opacity-50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Empty Inventory</p>
                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest text-center mt-2">No reported items match your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/[0.05] transition-all group">
                       <div className="flex items-center gap-5">
                          {/* Visual ID */}
                          <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center text-2xl shadow-inner relative flex-shrink-0">
                             {CATEGORIES.find(c => c.id === item.category)?.emoji || '📦'}
                             <div className="absolute -bottom-1 -right-1 bg-slate-800 text-[7px] font-black text-slate-400 px-1.5 py-0.5 rounded-md border border-white/5">
                                #{item.id.toString().padStart(4, '0')}
                             </div>
                          </div>

                          {/* Primary Info */}
                          <div className="space-y-1">
                             <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{item.item_name}</h4>
                             <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.category}</span>
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                   {new Date(item.found_time).toLocaleDateString()}
                                </span>
                             </div>
                          </div>
                       </div>

                       {/* Contextual Intelligence */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-grow max-w-2xl px-2 md:px-0">
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Discovery Location</p>
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-200 uppercase tracking-wide">
                                <i className="fa-solid fa-location-dot text-uni-500 text-[10px]"></i>
                                {item.location_zone}
                             </div>
                             <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
                                Report: {item.finder_id ? `By Student #${item.finder_id}` : (item.contact_full_name || 'Staff Log')}
                             </p>
                          </div>

                          <div className="space-y-2 border-l border-white/5 pl-8 hidden sm:block">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Identification State</p>
                             {item.identified_name || item.identified_student_id ? (
                                <div className="space-y-1">
                                   <div className="text-[10px] text-uni-400 font-black uppercase tracking-widest flex items-center gap-2">
                                      <i className="fa-solid fa-id-badge"></i> {item.identified_name || 'Verified Member'}
                                   </div>
                                   <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">
                                      {item.identified_student_id || 'Institutional ID'}
                                   </div>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 text-[9px] text-slate-700 font-black uppercase tracking-widest py-1">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                   Awaiting Match
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Action Pipeline */}
                       <div className="w-full md:w-auto flex flex-col items-end gap-3 border-t md:border-none border-white/5 pt-4 md:pt-0">
                          <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                             item.status === 'reported' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                             item.status === 'in_custody' ? 'bg-uni-500/10 text-uni-400 border-uni-500/20' :
                             'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}>
                            {item.status === 'reported' ? 'Discovery Pending' : item.status.replace('_', ' ')}
                          </div>

                          {item.status === 'reported' ? (
                             <button 
                               onClick={() => handleStatusUpdate(item, 'in_custody')}
                               disabled={actionLoading === item.id}
                               className="w-full md:w-48 bg-uni-600 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-uni-500 transition-all shadow-lg shadow-uni-500/20 flex items-center justify-center gap-3 active:scale-95"
                             >
                                <i className="fa-solid fa-vault"></i>
                                {actionLoading === item.id ? '...' : 'Secure In Vault'}
                             </button>
                          ) : (
                             <button 
                                onClick={() => {
                                   setShowReleaseModal(item);
                                   setReleaseForm({ 
                                      name: item.identified_name || '', 
                                      id_number: item.identified_student_id || '' 
                                   });
                                }}
                                className="w-full md:w-auto px-6 py-2 rounded-xl text-[9px] font-black text-green-500 hover:text-white hover:bg-green-500/20 uppercase tracking-[0.2em] transition-all border border-green-500/10 active:scale-95"
                             >
                                Process Release
                             </button>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
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
                             <p className="text-[12px] font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                                {claim.owner_name || `Student ID: ${claim.student_id}`}
                                <span className="text-[7px] bg-uni-500/10 text-uni-400 px-2 py-0.5 rounded-full border border-uni-500/10 font-black">Awaiting Evidence Review</span>
                             </p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Item: <span className="text-white">{claim.found_item_category}</span> • {claim.owner_email || 'Institutional Member'}
                             </p>
                             <p className="text-[9px] text-uni-400 font-black uppercase mt-2 italic opacity-80">
                                Testimony: "{claim.proof_description.substring(0, 60)}..."
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button 
                            onClick={() => {
                                setSelectedClaim(claim);
                                setClaimReviewStep(1);
                            }}
                            className="px-8 py-3 rounded-xl bg-uni-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-uni-500 transition-all shadow-lg shadow-uni-500/20 flex items-center gap-3"
                          >
                             <i className="fa-solid fa-microscope text-xs"></i>
                             Analyze Case
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'matches' && (
             <div className="p-8 space-y-12 pb-32">
                {filteredMatches.length === 0 ? (
                  <div className="py-20 text-center opacity-50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Matchmaker Idle</p>
                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-2">No cross-referenced reports found at this time</p>
                  </div>
                ) : (
                  <div className="space-y-16">
                     {filteredMatches.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-8">
                           {/* Found Item Context Header */}
                           <div className="flex items-center gap-4 px-6 py-3 bg-uni-500/5 border-l-4 border-uni-500 rounded-r-xl">
                              <span className="text-xl">🔍</span>
                              <div>
                                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Master Found Record: {group.found_item.item_name}</h3>
                                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">ID #{group.found_item.id} • Registered in {group.found_item.category}</p>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-6 pl-4 border-l border-white/5">
                              {group.top_matches.map((match, mIdx) => (
                                 <div key={mIdx} className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 hover:border-uni-500/30 transition-all relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-1">
                                       <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${match.similarity_score > 0.8 ? 'text-green-400' : 'text-uni-400'}`}>
                                          {(match.similarity_score * 100).toFixed(0)}% Match
                                       </div>
                                       <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                          <div className={`h-full transition-all duration-1000 ${match.similarity_score > 0.8 ? 'bg-green-500' : 'bg-uni-500'}`} style={{ width: `${match.similarity_score * 100}%` }}></div>
                                       </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row items-stretch gap-8">
                                       {/* Component 1: Found State */}
                                       <div className="flex-1 space-y-4">
                                          <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                               <i className="fa-solid fa-building-columns"></i> Institutional Log
                                            </p>
                                            <button 
                                              onClick={() => setPreviewImage(group.found_item.safe_photo_url)}
                                              className="text-[8px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                              View Evidence <i className="fa-solid fa-image ml-1"></i>
                                            </button>
                                          </div>
                                          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                             <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-lg">{CATEGORIES.find(c => c.id === group.found_item.category)?.emoji || '📦'}</div>
                                                <div>
                                                  <p className="text-[11px] font-black text-white uppercase">{group.found_item.item_name}</p>
                                                  <p className="text-[8px] font-bold text-slate-500 uppercase">{group.found_item.location_zone} • {new Date(group.found_item.found_time).toLocaleDateString()}</p>
                                                </div>
                                             </div>
                                             <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed line-clamp-2">{group.found_item.description}</p>
                                          </div>
                                       </div>

                                       {/* Relationship Indicator */}
                                       <div className="flex items-center justify-center py-4 lg:py-0">
                                          <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-uni-400 shadow-2xl relative z-10">
                                             <i className="fa-solid fa-link-slash group-hover:fa-link transition-all"></i>
                                          </div>
                                       </div>

                                       {/* Component 2: Lost State */}
                                       <div className="flex-1 space-y-4">
                                          <div className="flex justify-between items-center">
                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                               <i className="fa-solid fa-user-graduate"></i> Student's Lost Report
                                            </p>
                                            <button 
                                              onClick={() => match.item.safe_photo_url ? setPreviewImage(match.item.safe_photo_url) : null}
                                              className={`text-[8px] font-black uppercase tracking-widest transition-colors ${match.item.safe_photo_url ? 'text-amber-500 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}
                                            >
                                              {match.item.safe_photo_url ? 'View Photo' : 'No Photo Provided'} <i className="fa-solid fa-image ml-1"></i>
                                            </button>
                                          </div>
                                          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-4">
                                             <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-lg text-amber-500"><i className="fa-solid fa-file-circle-question"></i></div>
                                                <div>
                                                  <p className="text-[11px] font-black text-white uppercase">{match.item.item_name}</p>
                                                  <p className="text-[8px] font-bold text-slate-500 uppercase">{match.item.location_zone} • {new Date(match.item.last_seen_time).toLocaleDateString()}</p>
                                                </div>
                                             </div>
                                             <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed line-clamp-2">{match.item.description}</p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                                       <div className="flex items-center gap-6">
                                          <div>
                                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Owner Identity</p>
                                             <p className="text-[10px] font-black text-white uppercase">{match.item.owner_name || 'Anonymous Student'}</p>
                                          </div>
                                          <div className="w-px h-8 bg-white/5"></div>
                                          <div>
                                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Email</p>
                                             <p className="text-[10px] font-black text-uni-400 uppercase tracking-tighter truncate max-w-[200px]">{match.item.owner_email || 'No email provided'}</p>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-4 w-full sm:w-auto">
                                          <button 
                                             onClick={() => setSelectedMatchPair({ found: group.found_item, lost: match.item, score: match.similarity_score })}
                                             className="flex-1 sm:flex-none border border-white/10 hover:border-white/30 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                          >
                                             Scan Comparison
                                          </button>
                                          <button 
                                             onClick={() => handleConnectMatch(group.found_item.id, match.item.id)}
                                             disabled={actionLoading === `match-${group.found_item.id}-${match.item.id}`}
                                             className="flex-1 sm:flex-none bg-uni-600 hover:bg-uni-500 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-uni-500/20 flex items-center justify-center gap-3 active:scale-95"
                                          >
                                             <i className="fa-solid fa-check-double text-xs"></i>
                                             Confirm Match
                                          </button>
                                       </div>
                                    </div>
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

           {currentTab === 'users' && (
             <div className="p-8 md:p-12 pb-32">
                <UserVerification />
             </div>
           )}

           {currentTab === 'released' && (
             <div className="overflow-x-auto p-8">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     <th className="px-8 py-5">Item & Ref</th>
                     <th className="px-8 py-5">Handed Over To</th>
                     <th className="px-8 py-5">Release Details</th>
                     <th className="px-8 py-5 text-right">Audit Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {releasedItems.map(item => (
                     <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-8 py-6">
                         <div className="font-black text-white text-[11px] uppercase tracking-widest mb-1">{item.item_name}</div>
                         <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">#{item.id.toString().padStart(4, '0')} • {item.category}</div>
                       </td>
                       <td className="px-8 py-6">
                         <div className="text-[11px] text-uni-400 font-black uppercase tracking-widest">{item.released_to_name}</div>
                         <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">{item.released_to_id_number}</div>
                       </td>
                       <td className="px-8 py-6">
                         <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">Released {new Date(item.released_at).toLocaleDateString()}</div>
                         <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Authorized By {item.released_by_name}</div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-green-500/10 text-green-400 border-green-500/20">Archived Record</span>
                       </td>
                     </tr>
                   ))}
                   {releasedItems.length === 0 && (
                     <tr>
                       <td colSpan="4" className="px-8 py-20 text-center opacity-50">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No released items found</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           )}
        </div>
        </section>



      {/* Claim Review Wizard Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => setSelectedClaim(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-4xl rounded-[3rem] overflow-hidden relative z-10 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                        <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Claim Verification Engine</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Case #{selectedClaim.id.toString().padStart(5, '0')} • Status: Manual Review required</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   {[1,2,3].map(s => (
                       <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${claimReviewStep === s ? 'w-12 bg-uni-400' : 'w-4 bg-white/10'}`} />
                   ))}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-10">
                <AnimatePresence mode="wait">
                  {claimReviewStep === 1 && (
                    <motion.div 
                      key="rev1" 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Original Found Item</span>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                     <h4 className="text-2xl font-black text-white uppercase italic">{selectedClaim.found_item_name || 'Electronics'}</h4>
                                     <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span><i className="fa-solid fa-location-dot text-uni-500"></i> {selectedClaim.found_item_location || 'Unknown'}</span>
                                        <span><i className="fa-solid fa-calendar text-uni-400"></i> {new Date(selectedClaim.found_item_time).toLocaleDateString()}</span>
                                     </div>
                                     <p className="text-sm text-slate-500 font-bold leading-relaxed">{selectedClaim.found_item_description}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <span className="text-[10px] font-black text-uni-400 uppercase tracking-widest block">Claimant Description</span>
                                <div className="p-6 bg-uni-500/5 rounded-3xl border border-uni-500/20 space-y-4">
                                     <p className="text-lg text-white font-black italic leading-tight">"{selectedClaim.proof_description}"</p>
                                     <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Semantic match score</p>
                                        <p className="text-[11px] font-black text-uni-400">High Confidence</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setClaimReviewStep(2)}
                            className="w-full bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl"
                        >
                            Examine Evidence →
                        </button>
                    </motion.div>
                  )}

                  {claimReviewStep === 2 && (
                    <motion.div 
                      key="rev2" 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 aspect-video bg-slate-900 rounded-[2rem] border border-white/10 overflow-hidden relative group">
                                {selectedClaim.proof_photo_url ? (
                                    <img src={selectedClaim.proof_photo_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                                        <i className="fa-solid fa-image text-6xl"></i>
                                        <p className="text-[10px] font-black uppercase tracking-widest">No photo evidence provided</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ownership Indicator</p>
                                    <p className="text-[12px] text-white font-bold leading-relaxed">The student provided {selectedClaim.proof_photo_url ? 'photo evidence' : 'descriptive text only'}. Compare this against any known private marks.</p>
                                </div>
                                <div className="p-6 bg-slate-900 rounded-2xl border border-white/5 space-y-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Claimant Identity</p>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">{selectedClaim.guest_full_name || 'Verified Student'}</p>
                                        <p className="text-[8px] text-uni-400 font-black uppercase tracking-widest">{selectedClaim.course_department || 'No department info'}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/5 space-y-1">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Contact Preference</p>
                                        <div className="flex items-center gap-2">
                                            <i className={`fa-brands ${selectedClaim.contact_method === 'Facebook' ? 'fa-facebook' : 'fa-solid ' + (selectedClaim.contact_method === 'Phone' ? 'fa-phone' : 'fa-envelope')} text-slate-400 text-[10px]`}></i>
                                            <p className="text-[10px] text-white font-bold">{selectedClaim.contact_info || 'N/A'}</p>
                                        </div>
                                        {selectedClaim.guest_email && (
                                            <p className="text-[8px] text-slate-600 font-bold italic">{selectedClaim.guest_email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setClaimReviewStep(1)} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Back</button>
                            <button 
                                onClick={() => setClaimReviewStep(3)}
                                className="flex-grow bg-white text-black py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl"
                            >
                                Final Judgment →
                            </button>
                        </div>
                    </motion.div>
                  )}

                  {claimReviewStep === 3 && (
                    <motion.div 
                      key="rev3" 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="space-y-12 py-10 text-center"
                    >
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-3xl text-uni-400">⚖️</div>
                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Final Authorization</h4>
                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                                Once approved, the student will be notified to visit the office for collection. If rejected, they can clarify their claim.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <button 
                                onClick={() => {
                                    handleClaimReview(selectedClaim.id, 'rejected');
                                    setSelectedClaim(null);
                                }}
                                disabled={actionLoading}
                                className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-left space-y-4"
                            >
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-xmark text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Reject Claim</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">InSufficient proof provided</p>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    handleClaimReview(selectedClaim.id, 'approved');
                                    setSelectedClaim(null);
                                }}
                                disabled={actionLoading}
                                className="group p-8 rounded-[2.5rem] bg-uni-600 border border-uni-600 shadow-2xl shadow-uni-600/20 hover:bg-uni-500 transition-all text-left space-y-4"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-check text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Approve Claim</p>
                                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Mark as ready for collection</p>
                                </div>
                            </button>
                        </div>

                        <button onClick={() => setClaimReviewStep(2)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">Review evidence again</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showReleaseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => {
                setShowReleaseModal(null);
                setReleaseStep(1);
              }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 border border-white/10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Release Protocol</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Protocol Step {releaseStep} of 3 • Item #{showReleaseModal.id}</p>
                  </div>
                  <div className="flex gap-1">
                      {[1,2,3].map(s => (
                          <div key={s} className={`w-6 h-1 rounded-full ${releaseStep >= s ? 'bg-uni-500' : 'bg-white/10'}`} />
                      ))}
                  </div>
              </div>

              <AnimatePresence mode="wait">
                {releaseStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 py-4"
                  >
                    <div className="p-6 bg-uni-500/5 border border-uni-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4 text-uni-400">
                            <i className="fa-solid fa-clipboard-check text-xl"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">Physical Verification Required</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">
                           Before proceeding, ensure the student is physically present and has provided a valid University ID card.
                        </p>
                    </div>
                    
                    <button 
                      onClick={() => setReleaseStep(2)}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-uni-400 hover:text-white transition-all shadow-xl"
                    >
                      ID Verified, Proceed →
                    </button>
                  </motion.div>
                )}

                {releaseStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient Full Name</label>
                            <input 
                                type="text"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white focus:border-uni-500 outline-none transition-all"
                                value={releaseForm.name}
                                onChange={(e) => setReleaseForm({...releaseForm, name: e.target.value})}
                                placeholder="FullName..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID Number</label>
                            <input 
                                type="text"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs font-bold text-white focus:border-uni-500 outline-none transition-all"
                                value={releaseForm.id_number}
                                onChange={(e) => setReleaseForm({...releaseForm, id_number: e.target.value})}
                                placeholder="e.g. 2024-XXXXX"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setReleaseStep(1)} className="flex-grow py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Back</button>
                        <button 
                            disabled={!releaseForm.name || !releaseForm.id_number}
                            onClick={() => setReleaseStep(3)} 
                            className="flex-[2] bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all"
                        >
                            Next Step
                        </button>
                    </div>
                  </motion.div>
                )}

                {releaseStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 py-4"
                  >
                    <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[2rem] text-center space-y-4">
                        <i className="fa-solid fa-handshake text-3xl text-green-500"></i>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Final Authorization</h4>
                        <div className="text-left space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Item: <span className="text-white">{showReleaseModal.item_name}</span></p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recipient: <span className="text-white">{releaseForm.name}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={handleDirectRelease}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-green-500 transition-all shadow-2xl shadow-green-500/20 active:scale-95"
                    >
                        {actionLoading ? 'Finalizing...' : 'Authorize Handover'}
                    </button>
                    <button onClick={() => setReleaseStep(2)} className="w-full text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Return to Edit</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Match Comparison Deep Review Modal */}
      <AnimatePresence>
        {selectedMatchPair && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatchPair(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-3xl font-black text-white uppercase tracking-tight">Full-Scope Analysis</h2>
                       <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Manual Cross-Verification of Digital Evidence</p>
                    </div>
                    <button onClick={() => setSelectedMatchPair(null)} className="w-12 h-12 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-400">
                       <i className="fa-solid fa-xmark"></i>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Found Item (The Anchor) */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="px-4 py-1.5 bg-uni-500/10 text-uni-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-uni-500/20">
                             Official Registry Record
                          </div>
                       </div>
                       
                       <div className="space-y-8 bg-white/5 rounded-3xl p-8 border border-white/5">
                          <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Item Name</p>
                             <h3 className="text-xl font-black text-white uppercase">{selectedMatchPair.found.item_name}</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                             <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Category</p>
                                <p className="text-[11px] font-black text-white uppercase tracking-wide">{selectedMatchPair.found.category}</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stored Location</p>
                                <p className="text-[11px] font-black text-uni-400 uppercase tracking-wide">{selectedMatchPair.found.location_zone}</p>
                             </div>
                          </div>

                          <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Internal Description / Notes</p>
                             <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-uni-500/20 pl-4 py-2">
                                "{selectedMatchPair.found.description || 'No detailed notes provided during logging.'}"
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Right: Lost Report (The Claim) */}
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <div className="px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                             Student Reporting Data
                          </div>
                          <div className="text-[10px] font-black text-white uppercase tracking-widest">
                             AI CONFIDENCE: <span className="text-uni-400">{(selectedMatchPair.score * 100).toFixed(0)}%</span>
                          </div>
                       </div>
                       
                       <div className="space-y-8 bg-amber-500/5 rounded-3xl p-8 border-amber-500/10">
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Reported Item</p>
                             <h3 className="text-xl font-black text-white uppercase">{selectedMatchPair.lost.item_name}</h3>
                             <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{selectedMatchPair.lost.location_zone} • {new Date(selectedMatchPair.lost.last_seen_time).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                             <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-wide truncate">{selectedMatchPair.lost.owner_name || 'Member'}</p>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Owner Identity</p>
                             </div>
                             <div>
                                <p className="text-[11px] font-black text-amber-500 uppercase tracking-wide">#{selectedMatchPair.lost.id}</p>
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-1">Report ID</p>
                             </div>
                          </div>

                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Student's Description of Loss</p>
                             <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-amber-500/20 pl-4 py-2">
                                "{selectedMatchPair.lost.description || 'No description provided.'}"
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleConnectMatch(selectedMatchPair.found.id, selectedMatchPair.lost.id).then(() => setSelectedMatchPair(null))}
                      className="flex-grow bg-uni-600 hover:bg-uni-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4"
                    >
                       <i className="fa-solid fa-check-double text-lg"></i>
                       Confirm & Authorize Match
                    </button>
                    <button 
                      onClick={() => setSelectedMatchPair(null)}
                      className="px-10 border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                       Go Back
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
