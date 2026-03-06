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
  const [suggestions, setSuggestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [foundRes, suggestionsRes, matchesRes, claimsRes, lostRes, historyRes] = await Promise.all([
        apiClient.get('/admin/found'),
        apiClient.get('/categories/suggestions'),
        apiClient.get('/admin/matches/all'),
        apiClient.get('/admin/claims/pending'),
        apiClient.get('/admin/lost/all'),
        apiClient.get('/analytics/history')
      ]);
      setRecentFound(foundRes.data);
      setSuggestions(suggestionsRes.data);
      setMatches(matchesRes.data);
      setPendingClaims(claimsRes.data);
      setLostReports(lostRes.data);
      setHistoryItems(historyRes.data);
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
        released_by_name: 'Admin Staff',
        released_to_photo_url: releaseForm.photo_url
      });
      setShowReleaseModal(null);
      setReleaseStep(1);
      setReleaseForm({ name: '', id_number: '', photo_url: '' });
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

  const handleLostReportUpdate = async (reportId, updates) => {
    setActionLoading(`lost-${reportId}`);
    try {
      await apiClient.put(`/admin/lost/${reportId}/status`, updates);
      await fetchDashboardData();
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

  const filteredLostReports = lostReports.filter(report => 
    report.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toString().includes(searchTerm)
  );

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-32">


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
                />
            )}

            {currentTab === 'witnesses' && (
              <WitnessReportsTab setPreviewImage={setPreviewImage} />
            )}

            {currentTab === 'history' || currentTab === 'released' ? (
              <ReleasedItemsTable releasedItems={historyFiltered} />
            ) : null}

            {currentTab === 'analytics' && (
              <div className="p-8 md:p-12">
                 <Analytics />
              </div>
            )}

            {currentTab === 'users' && (
              <div className="p-8 md:p-12 pb-32">
                 <Leaderboard />
              </div>
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
