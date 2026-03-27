import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  Search
} from "lucide-react";

// Modular Components
import InventoryTab from './components/InventoryTab';
import ClaimsTab from './components/ClaimsTab';
import MatchmakerTab from './components/MatchmakerTab';
import LostReportsTab from './components/LostReportsTab';
import ReleasedItemsTable from './components/ReleasedItemsTable';
import WitnessReportsTab from './components/WitnessReportsTab';
import Analytics from './Analytics';
import Leaderboard from './Leaderboard';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';

// Modals
import ReleaseItemModal from './components/ReleaseItemModal';
import ClaimReviewModal from './components/ClaimReviewModal';
import MatchComparisonModal from './components/MatchComparisonModal';
import ImagePreviewOverlay from './components/ImagePreviewOverlay';


const AdminDashboard = () => {
  const { user } = useAuth();
  const [recentFound, setRecentFound] = useState([]);
  const [matches, setMatches] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTriggers, setSyncTriggers] = useState({ analytics: 0, leaderboard: 0, witnesses: 0 });

  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Robust tab determination
  const lastSegment = location.pathname.split('/').filter(Boolean).pop();
  const currentTab = (!lastSegment || lastSegment === 'admin') ? 'found' : lastSegment;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(null); 
  const [releaseStep, setReleaseStep] = useState(1);
  const [releaseForm, setReleaseForm] = useState({ name: '', id_number: '', photo_url: '' });
  const [inventoryFilter, setInventoryFilter] = useState('all'); 
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewStep, setClaimReviewStep] = useState(1);
  const [selectedMatchPair, setSelectedMatchPair] = useState(null); 
  const [showIntakeModal, setShowIntakeModal] = useState(null); // { item, verification_note, challenge_question }
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadTabData();
  }, [currentTab]);

  const loadTabData = async (force = false) => {
    // Determine what needs to be fetched for this tab
    const needsFetch = force || false;
    
    switch (currentTab) {
      case 'found':
        if (force || recentFound.length === 0) fetchInventory(force);
        break;
      case 'claims':
        if (force || pendingClaims.length === 0) fetchClaims(force);
        break;
      case 'matches':
        if (force || matches.length === 0) fetchMatches(force);
        break;
      case 'lost':
        if (force || lostReports.length === 0) fetchLostReports(force);
        break;
      case 'history':
      case 'released':
        if (force || historyItems.length === 0) fetchHistory(force);
        break;
      case 'analytics':
        if (force) setSyncTriggers(prev => ({ ...prev, analytics: prev.analytics + 1 }));
        break;
      case 'users':
        if (force) setSyncTriggers(prev => ({ ...prev, leaderboard: prev.leaderboard + 1 }));
        break;
      case 'witnesses':
        if (force) setSyncTriggers(prev => ({ ...prev, witnesses: prev.witnesses + 1 }));
        break;
      default:
        break;
    }
  };

  const fetchInventory = async (isSync = false) => {
    if (!isSync) setLoading(true);
    else setIsSyncing(true);
    try {
      const [foundRes, matchesRes, claimsRes] = await Promise.all([
        apiClient.get('/admin/found'),
        apiClient.get('/admin/matches/all'),
        apiClient.get('/admin/claims/pending')
      ]);
      setRecentFound(foundRes.data);
      setMatches(matchesRes.data);
      setPendingClaims(claimsRes.data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchClaims = async (isSync = false) => {
    if (!isSync) setLoading(true);
    else setIsSyncing(true);
    try {
      const res = await apiClient.get('/admin/claims/pending');
      setPendingClaims(res.data);
    } catch (error) {
      console.error('Failed to fetch claims', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchMatches = async (isSync = false) => {
    if (!isSync) setLoading(true);
    else setIsSyncing(true);
    try {
      const res = await apiClient.get('/admin/matches/all');
      setMatches(res.data);
    } catch (error) {
      console.error('Failed to fetch matches', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchLostReports = async (isSync = false) => {
    if (!isSync) setLoading(true);
    else setIsSyncing(true);
    try {
      const res = await apiClient.get('/admin/lost/all');
      setLostReports(res.data);
    } catch (error) {
      console.error('Failed to fetch lost reports', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchHistory = async (isSync = false) => {
    if (!isSync) setLoading(true);
    else setIsSyncing(true);
    try {
      const res = await apiClient.get('/analytics/history');
      setHistoryItems(res.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Keep this for updates
  const refreshActiveTab = () => loadTabData(true);


  const handleStatusUpdate = async (item, status) => {
    if (status === 'in_custody') {
      setShowIntakeModal({ 
        item, 
        verification_note: item.verification_note || '', 
        challenge_question: item.challenge_question || '',
        attributes: { ...(item.attributes || {}) }
      });
      return;
    }
    
    // Fallback for other status updates
    setActionLoading(item.id);
    try {
      await apiClient.put(`/admin/found/${item.id}/custody`, { notes: `Status updated to ${status}` });
      await refreshActiveTab();
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIntakeSubmit = async () => {
    const { item, verification_note, challenge_question, attributes } = showIntakeModal;
    setActionLoading(item.id);
    try {
      await apiClient.put(`/admin/found/${item.id}/custody`, { 
        notes: `Secured in vault with verified attributes`,
        verification_note,
        challenge_question,
        attributes
      });
      setShowIntakeModal(null);
      await refreshActiveTab();
    } catch (err) {
      console.error('Intake failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkStatusUpdate = async (itemIds, status) => {
    // Optimistic Update
    const prevItems = [...recentFound];
    setRecentFound(prev => prev.map(i => itemIds.includes(i.id) ? { ...i, status: 'in_custody' } : i));
    
    setActionLoading('bulk');
    try {
      await apiClient.post('/admin/found/bulk/custody', { 
        item_ids: itemIds,
        notes: `Bulk status update to ${status}` 
      });
    } catch (err) {
      console.error('Bulk update failed', err);
      setRecentFound(prevItems); // Rollback
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
        released_by_name: user.full_name || 'Admin Staff',
        released_to_photo_url: releaseForm.photo_url
      });
      setShowReleaseModal(null);
      setReleaseStep(1);
      setReleaseForm({ name: '', id_number: '', photo_url: '' });
      await refreshActiveTab();
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
      await refreshActiveTab();
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
      await refreshActiveTab();
    } catch (err) {
      console.error('Connection failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLostReportUpdate = async (reportId, updates) => {
    setActionLoading(`lost-${reportId}`);
    try {
      await apiClient.put(`/admin/lost/${reportId}/status`, updates);
      await refreshActiveTab();
    } catch (err) {
      console.error('Lost report update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter Logic
  const filteredItems = recentFound.filter(item => {
    if (item.status === 'released') return false;
    if (inventoryFilter === 'pending' && item.status !== 'reported') return false;
    if (inventoryFilter === 'vault' && item.status !== 'in_custody') return false;
    if (inventoryFilter === 'ready' && item.status !== 'claimed') return false;

    // Time-based magic filters from Analytics
    if (searchTerm === 'today') {
      const today = new Date().toLocaleDateString();
      return new Date(item.found_time).toLocaleDateString() === today;
    }
    if (searchTerm === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.found_time) >= weekAgo;
    }

    return (
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location_zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    );
  });

  const historyFiltered = historyItems.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.released_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
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

  const filteredLostReports = lostReports.filter(report => {
    // Time-based magic filters from Analytics
    if (searchTerm === 'today') {
      const today = new Date().toLocaleDateString();
      return new Date(report.last_seen_time).toLocaleDateString() === today;
    }
    if (searchTerm === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(report.last_seen_time) >= weekAgo;
    }

    return (
      report.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().includes(searchTerm)
    );
  });

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-inner">
              <Database size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Command Center</h2>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Registry</h1>
                <Badge variant="outline" className="bg-uni-500/10 text-uni-400 border-uni-500/20 text-[11px] px-2 py-0">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-uni-400 transition-colors">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search Registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-slate-900/40 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-uni-500/50 outline-none backdrop-blur-md transition-all"
              />
            </div>

            <button 
              onClick={refreshActiveTab}
              disabled={isSyncing}
              className={`flex items-center justify-center gap-3 bg-uni-600 hover:bg-uni-500 text-white h-14 px-8 rounded-2xl border border-uni-400/20 text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-uni-600/10 active:scale-[0.98] ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white/70" />
              ) : (
                <RefreshCw size={18} className="transition-transform duration-500" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>

        {/* Navigation & Content Root */}
        <Tabs 
          value={currentTab} 
          onValueChange={(val) => navigate(`/admin/${val === 'found' ? '' : val}`)}
          className="w-full space-y-4"
        >

          <div className="bg-slate-950/20 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-2xl overflow-hidden min-h-[600px] w-full">
            <div className="p-6 md:p-10 lg:p-12 w-full">
              <TabsContent value="found" className="m-0 focus-visible:outline-none">
                <InventoryTab 
                  inventoryFilter={inventoryFilter}
                  setInventoryFilter={setInventoryFilter}
                  filteredItems={filteredItems}
                  matches={matches}
                  pendingClaims={pendingClaims}
                  navigate={navigate}
                  setSearchTerm={setSearchTerm}
                  handleStatusUpdate={handleStatusUpdate}
                  handleBulkStatusUpdate={handleBulkStatusUpdate}
                  setShowReleaseModal={setShowReleaseModal}
                  setReleaseForm={setReleaseForm}
                  actionLoading={actionLoading}
                  activeFilter={searchTerm}
                />
              </TabsContent>

              <TabsContent value="claims" className="m-0 focus-visible:outline-none">
                <ClaimsTab 
                  filteredClaims={filteredClaims}
                  setSelectedClaim={setSelectedClaim}
                  setClaimReviewStep={setClaimReviewStep}
                />
              </TabsContent>

              <TabsContent value="matches" className="m-0 focus-visible:outline-none">
                <MatchmakerTab 
                  filteredMatches={filteredMatches}
                  setSelectedMatchPair={setSelectedMatchPair}
                  handleConnectMatch={handleConnectMatch}
                  actionLoading={actionLoading}
                  setPreviewImage={setPreviewImage}
                />
              </TabsContent>

              <TabsContent value="lost" className="m-0 focus-visible:outline-none">
                <LostReportsTab 
                  filteredLostReports={filteredLostReports}
                  matches={matches}
                  navigate={navigate}
                  setSearchTerm={setSearchTerm}
                  onUpdateReport={handleLostReportUpdate}
                  actionLoading={actionLoading}
                  setPreviewImage={setPreviewImage}
                  activeFilter={searchTerm}
                />
              </TabsContent>

              <TabsContent value="witnesses" className="m-0 focus-visible:outline-none">
                <WitnessReportsTab 
                  setPreviewImage={setPreviewImage} 
                  refreshTrigger={syncTriggers.witnesses}
                  setIsSyncing={setIsSyncing}
                />
              </TabsContent>

              <TabsContent value="released" className="m-0 focus-visible:outline-none">
                <ReleasedItemsTable releasedItems={historyFiltered} />
              </TabsContent>

              <TabsContent value="analytics" className="m-0 focus-visible:outline-none">
                 <Analytics 
                   onNavigateToTab={(tab) => navigate(`/admin/${tab}`)}
                   onSetSearchTerm={setSearchTerm}
                   refreshTrigger={syncTriggers.analytics}
                   setIsSyncing={setIsSyncing}
                 />
              </TabsContent>

              <TabsContent value="users" className="m-0 focus-visible:outline-none">
                 <Leaderboard 
                   refreshTrigger={syncTriggers.leaderboard} 
                   setIsSyncing={setIsSyncing}
                 />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Modals */}
        <AnimatePresence>
          {selectedClaim && (
            <ClaimReviewModal 
              selectedClaim={selectedClaim}
              setSelectedClaim={setSelectedClaim}
              claimReviewStep={claimReviewStep}
              setClaimReviewStep={setClaimReviewStep}
              handleClaimReview={handleClaimReview}
              actionLoading={actionLoading === `claim-${selectedClaim.id}`}
            />
          )}

          {showReleaseModal && (
            <ReleaseItemModal 
              showReleaseModal={showReleaseModal}
              setShowReleaseModal={setShowReleaseModal}
              releaseStep={releaseStep}
              setReleaseStep={setReleaseStep}
              releaseForm={releaseForm}
              setReleaseForm={setReleaseForm}
              handleDirectRelease={handleDirectRelease}
              actionLoading={actionLoading === showReleaseModal.id}
            />
          )}

          {selectedMatchPair && (
            <MatchComparisonModal 
              selectedMatchPair={selectedMatchPair}
              setSelectedMatchPair={setSelectedMatchPair}
              handleConnectMatch={handleConnectMatch}
            />
          )}

          {previewImage && (
            <ImagePreviewOverlay 
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
            />
          )}

          {showIntakeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowIntakeModal(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-panel w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 border border-white/10 space-y-8 bg-slate-900/50"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-uni-500/10 rounded-2xl flex items-center justify-center border border-uni-500/20 text-uni-400">
                    <i className="fa-solid fa-vault text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">"Secure Item"</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Item #{showIntakeModal.item.id} • Intake to Vault</p>
                  </div>
                </div>
                <div className="space-y-6">
                   {/* Data Integrity Audit: Structured Attributes */}
                   <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 space-y-4">
                      <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest italic flex items-center gap-2 mb-2">
                        <i className="fa-solid fa-clipboard-check"></i>
                        Data Integrity Audit
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {(ITEM_ATTRIBUTES[showIntakeModal.item.category] || []).map(field => (
                          <div key={field} className="space-y-1.5">
                            <label className="block text-[8px] font-black text-slate-500 tracking-widest uppercase ml-1">{field}</label>
                            
                            {field === 'Color' || field === 'Primary Color' || field === 'Frame Color' ? (
                              <select
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white focus:border-uni-500 outline-none"
                                value={showIntakeModal.attributes[field] || ''}
                                onChange={(e) => setShowIntakeModal({
                                  ...showIntakeModal,
                                  attributes: { ...showIntakeModal.attributes, [field]: e.target.value }
                                })}
                              >
                                <option value="">Select Color</option>
                                {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : field === 'Condition' ? (
                              <select
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white focus:border-uni-500 outline-none"
                                value={showIntakeModal.attributes[field] || ''}
                                onChange={(e) => setShowIntakeModal({
                                  ...showIntakeModal,
                                  attributes: { ...showIntakeModal.attributes, [field]: e.target.value }
                                })}
                              >
                                <option value="">Select Condition</option>
                                {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <input 
                                type="text"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white focus:border-uni-500 outline-none tracking-widest uppercase"
                                value={showIntakeModal.attributes[field] || ''}
                                onChange={(e) => setShowIntakeModal({
                                  ...showIntakeModal,
                                  attributes: { ...showIntakeModal.attributes, [field]: e.target.value }
                                })}
                                placeholder={`Enter ${field}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <i className="fa-solid fa-eye-slash text-[8px] text-uni-400"></i>
                        Secret Verification Note (Internal)
                      </label>
                      <textarea 
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all min-h-[80px]"
                        placeholder="E.g., Small sunflower sticker under the case..."
                        value={showIntakeModal.verification_note}
                        onChange={(e) => setShowIntakeModal({...showIntakeModal, verification_note: e.target.value})}
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <i className="fa-solid fa-question-circle text-[8px] text-uni-400"></i>
                        Challenge Question (Ask student)
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-[11px] font-black text-white focus:border-uni-500 outline-none transition-all tracking-widest"
                        placeholder="E.g., What color is the sticker on the back?"
                        value={showIntakeModal.challenge_question}
                        onChange={(e) => setShowIntakeModal({...showIntakeModal, challenge_question: e.target.value})}
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setShowIntakeModal(null)}
                     className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                   >
                     Cancel
                   </button>

                   <button 
                     onClick={handleIntakeSubmit}
                     disabled={actionLoading === showIntakeModal.item.id || !showIntakeModal.verification_note}
                     className="flex-grow bg-uni-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-black disabled:opacity-20 transition-all"
                   >
                     {actionLoading === showIntakeModal.item.id ? 'Securing...' : 'Verify & Lock Item →'}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
