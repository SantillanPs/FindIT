import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../constants/categories';

// Modular Components
import InventoryTab from './components/InventoryTab';
import ClaimsTab from './components/ClaimsTab';
import MatchmakerTab from './components/MatchmakerTab';
import LostReportsTab from './components/LostReportsTab';
import ReleasedItemsTable from './components/ReleasedItemsTable';
import WitnessReportsTab from './components/WitnessReportsTab';
import Analytics from './Analytics';
import Leaderboard from './Leaderboard';

// Modals
import ReleaseItemModal from './components/ReleaseItemModal';
import ClaimReviewModal from './components/ClaimReviewModal';
import MatchComparisonModal from './components/MatchComparisonModal';
import ImagePreviewOverlay from './components/ImagePreviewOverlay';


const AdminDashboard = () => {
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
  const currentTab = location.pathname.split('/').pop() === 'admin' ? 'found' : location.pathname.split('/').pop();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(null); 
  const [releaseStep, setReleaseStep] = useState(1);
  const [releaseForm, setReleaseForm] = useState({ name: '', id_number: '', photo_url: '' });
  const [inventoryFilter, setInventoryFilter] = useState('all'); 
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewStep, setClaimReviewStep] = useState(1);
  const [selectedMatchPair, setSelectedMatchPair] = useState(null); 
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

  const handleDirectRelease = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(showReleaseModal.id);
    try {
      await apiClient.post(`/admin/found/${showReleaseModal.id}/direct-release`, {
        released_to_name: releaseForm.name,
        released_to_id_number: releaseForm.id_number,
        released_by_name: 'Admin Staff',
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
    <div className="space-y-12 pb-32">
        <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20">
                <i className="fa-solid fa-server text-[16px]"></i>
             </div>
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Data Management</h3>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentTab} module active</p>
             </div>
          </div>
          <button 
            onClick={refreshActiveTab}
            disabled={isSyncing}
            className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all ${isSyncing ? 'opacity-50' : ''}`}
          >
            {isSyncing ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <i className="fa-solid fa-rotate text-[12px]"></i>
            )}
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>


        <section className="space-y-6">
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
            {currentTab === 'found' && (
              <InventoryTab 
                inventoryFilter={inventoryFilter}
                setInventoryFilter={setInventoryFilter}
                filteredItems={filteredItems}
                matches={matches}
                pendingClaims={pendingClaims}
                navigate={navigate}
                setSearchTerm={setSearchTerm}
                handleStatusUpdate={handleStatusUpdate}
                setShowReleaseModal={setShowReleaseModal}
                setReleaseForm={setReleaseForm}
                actionLoading={actionLoading}
                activeFilter={searchTerm}
              />
            )}

            {currentTab === 'claims' && (
              <ClaimsTab 
                filteredClaims={filteredClaims}
                setSelectedClaim={setSelectedClaim}
                setClaimReviewStep={setClaimReviewStep}
              />
            )}

            {currentTab === 'matches' && (
              <MatchmakerTab 
                filteredMatches={filteredMatches}
                setSelectedMatchPair={setSelectedMatchPair}
                handleConnectMatch={handleConnectMatch}
                actionLoading={actionLoading}
                setPreviewImage={setPreviewImage}
              />
            )}

            {currentTab === 'lost' && (
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
            )}

            {currentTab === 'witnesses' && (
              <WitnessReportsTab 
                setPreviewImage={setPreviewImage} 
                refreshTrigger={syncTriggers.witnesses}
                setIsSyncing={setIsSyncing}
              />
            )}

            {currentTab === 'history' || currentTab === 'released' ? (
              <ReleasedItemsTable releasedItems={historyFiltered} />
            ) : null}

            {currentTab === 'analytics' && (
              <div className="p-8 md:p-12">
                 <Analytics 
                   onNavigateToTab={(tab) => navigate(`/admin/${tab}`)}
                   onSetSearchTerm={setSearchTerm}
                   refreshTrigger={syncTriggers.analytics}
                   setIsSyncing={setIsSyncing}
                 />
              </div>
            )}

            {currentTab === 'users' && (
              <div className="p-8 md:p-12 pb-32">
                 <Leaderboard 
                   refreshTrigger={syncTriggers.leaderboard} 
                   setIsSyncing={setIsSyncing}
                 />
              </div>
            )}

            {currentTab === 'staff' && (
              <StaffManagementTab />
            )}
          </div>
        </section>

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
        </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
