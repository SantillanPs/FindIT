import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Search,
  LayoutDashboard,
  ShieldCheck,
  PackageCheck,
  Archive,
  ImageIcon,
  Eye,
  EyeOff,
  X} from "lucide-react";

// Modular Components
import InventoryTab from './components/InventoryTab';
import ClaimsTab from './components/ClaimsTab';
import MatchmakerTab from './components/MatchmakerTab';
import LostReportsTab from './components/LostReportsTab';
import ActivityFeed from './components/ActivityFeed';
import WitnessReportsTab from './components/WitnessReportsTab';
import AdminHeader from './components/AdminHeader';
import Analytics from './Analytics';
import Leaderboard from './Leaderboard';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';
import { imageCache } from '../../lib/imageCache';

// Modals
import ReleaseItemModal from './components/ReleaseItemModal';
import ClaimReviewModal from './components/ClaimReviewModal';
import MatchComparisonModal from './components/MatchComparisonModal';
import ImagePreviewOverlay from './components/ImagePreviewOverlay';
import ReportReviewModal from './components/ReportReviewModal';
import LostReviewModal from './components/LostReviewModal';

/**
 * AdminDashboard - Premium Professional (Pro Max)
 * - Clean, high-impact workspace.
 * - Human-centric labeling (No "Command Center").
 * - Breathable, elegant navigation.
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [syncTriggers] = useState({ analytics: 0, leaderboard: 0, witnesses: 0, registry: 0 });
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedLostReview, setSelectedLostReview] = useState(null);


  // Queries
  const { data: recentFound = [], isLoading: inventoryLoading, isFetching: inventoryFetching } = useQuery({
    queryKey: ['admin_inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_admin_inventory').select('*').neq('status', 'released');
      if (error) throw error;
      return data || [];
    },
    enabled: currentTab === 'found',
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: pendingClaims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['admin_claims'],
    queryFn: async () => {
      // 1. Fetch base claims from the reliable view
      const { data: claims, error } = await supabase
        .from('v_admin_claims')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;
      if (!claims || claims.length === 0) return [];

      // 2. Extract valid item IDs to fetch missing identified details
      const itemIds = [...new Set(claims.map(c => c.found_item_id || c.item_id))].filter(Boolean);
      
      if (itemIds.length === 0) return claims;

      // 3. Fetch missing identified fields directly from found_items
      const { data: items, error: itemsError } = await supabase
        .from('found_items')
        .select('id, identified_id_number, identified_name')
        .in('id', itemIds);

      if (itemsError) {
        console.warn("Could not enrich claims with identified details:", itemsError);
        return claims.map(c => ({
          ...c,
          is_identified_claim: c.is_identified_claim || !!c.found_item_identified_id
        }));
      }

      // 4. Merge the data (Enrichment)
      const itemMap = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      return claims.map(claim => {
        const itemId = claim.found_item_id || claim.item_id;
        const itemDetails = itemMap[itemId];
        return {
          ...claim,
          // Use view's owner_name or derive from guest fields
          owner_name: claim.owner_name || `${claim.guest_first_name || ''} ${claim.guest_last_name || ''}`.trim() || 'Guest Claimant',
          owner_email: claim.owner_email || claim.guest_email,
          // Add the missing identified info
          item_identified_id: itemDetails?.identified_id_number,
          item_identified_name: itemDetails?.identified_name,
          is_identified_claim: claim.is_identified_claim || !!itemDetails?.identified_id_number || !!itemDetails?.identified_name
        };
      });
    },
    enabled: currentTab === 'claims',
    placeholderData: keepPreviousData,
    refetchInterval: 120000,
  });

  // 1. Core Data Queries
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError } = useQuery({
    queryKey: ['admin_matches'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_matches', {
        match_threshold: 0.3,
        match_count: 5
      });
      if (error) {
        console.warn('[MATCHMAKER] Similarity engine reported an error:', error.message);
        throw error;
      };
      return data || [];
    },
    enabled: currentTab === 'matches',
    placeholderData: keepPreviousData,
    refetchInterval: 300000, // Reduced frequency to 5m to avoid server strain
    staleTime: 1000 * 60 * 2, // 2m stale time
    retry: false, // Don't spam the server on a 520
  });

  const { data: lostReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin_lost'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_admin_lost_reports').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: currentTab === 'lost',
    placeholderData: keepPreviousData,
    refetchInterval: 120000, // Reduced to 2m for networking room
  });

  const { data: historyItems = [], isLoading: historyLoading } = useQuery({
    queryKey: ['admin_history'],
    queryFn: async () => {
      // Step 1: Try the preferred activity log view
      const { data: activityData, error: activityError } = await supabase.from('v_admin_activity_log').select('*');
      
      if (!activityError && activityData) return activityData;

      // Step 2: Fallback to existing released history if view hasn't been created yet
      const { data, error } = await supabase.from('v_admin_history').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: currentTab === 'history' || currentTab === 'released',
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  // Proactive visual preloading for instant tab switching
  useEffect(() => {
    if (recentFound?.length > 0) {
      recentFound.forEach(item => {
        if (item.photo_url) imageCache.preload(item.photo_url);
      });
    }
  }, [recentFound]);


  // Dynamic Sync State: Watch the fetching status of the ACTIVE tab only
  const isSyncing = (currentTab === 'found' && inventoryFetching) || 
                    (currentTab === 'claims' && queryClient.isFetching({ queryKey: ['admin_claims'] }) > 0) ||
                    (currentTab === 'lost' && queryClient.isFetching({ queryKey: ['admin_lost'] }) > 0) ||
                    (currentTab === 'matches' && queryClient.isFetching({ queryKey: ['admin_matches'] }) > 0) ||
                    (currentTab === 'history' && queryClient.isFetching({ queryKey: ['admin_history'] }) > 0);

  const loading = (currentTab === 'found' && inventoryLoading) || 
                  (currentTab === 'claims' && claimsLoading) || 
                  (currentTab === 'matches' && matchesLoading) || 
                  (currentTab === 'lost' && reportsLoading) || 
                  (currentTab === 'history' && historyLoading);

  // Mutations (Standardized)
  const foundItemUpdateMutation = useMutation({
    mutationFn: async ({ id, updates, questionsChanged }) => {
      // Use the forensic secure RPC to handle transaction + logging + claim flagging
      const { data, error } = await supabase.rpc('rpc_secure_found_item_v1', {
        p_item_id: id,
        p_updates: updates,
        p_questions_changed: questionsChanged || false,
        p_admin_id: user.id
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["found_items"] });
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_review_queue'] });
      setSelectedReviewItem(null);
    },
    onError: (error) => {
      console.error("Forensic secure failed:", error);
    }
  });

  const foundItemBulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      const { error } = await supabase.from('found_items').update({ status }).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_inventory'] })
  });

  const claimReviewMutation = useMutation({
    mutationFn: async ({ claimId, status, adminNotes, scheduledPickupTime }) => {
      const { error } = await supabase.rpc('rpc_handle_claim_review', {
        p_claim_id: claimId,
        p_status: status,
        p_admin_notes: adminNotes,
        p_scheduled_pickup_time: scheduledPickupTime || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
    }
  });

  const connectMatchMutation = useMutation({
    mutationFn: async ({ foundId, lostId }) => {
      const { error } = await supabase.rpc('rpc_connect_match', {
        p_found_id: foundId,
        p_lost_id: lostId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_matches'] });
      queryClient.invalidateQueries({ queryKey: ['admin_lost'] });
    }
  });

  // All lost item updates use direct table writes — avoids PostgREST schema cache issues
  const lostItemStatusMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes, title, category, synthesized_description, attributes }) => {
      const updates = {};
      if (status !== undefined) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (title !== undefined) updates.title = title;
      if (category !== undefined) updates.category = category;
      if (synthesized_description !== undefined) updates.synthesized_description = synthesized_description;
      
      if (attributes !== undefined) {
        updates.attributes = attributes;
        // Sync top-level brand/model columns if they exist in the attributes blob
        if (attributes.brand) updates.brand = attributes.brand;
        if (attributes.model) updates.model = attributes.model;
      }

      const { error } = await supabase
        .from('lost_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_lost'] })
  });

  const releaseItemMutation = useMutation({
    mutationFn: async ({ id, releaseData }) => {
      const { error } = await supabase.from('found_items').update({
        status: 'released',
        ...releaseData,
        released_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin_history'] });
    }
  });

 
  const refreshActiveTab = () => {
    let key = `admin_${currentTab}`;
    if (currentTab === 'history' || currentTab === 'released') key = 'admin_history';
    if (currentTab === 'found') key = 'admin_inventory';
    
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  const handleStatusUpdate = async (item, status) => {
    if (status === 'in_custody') {
      setSelectedReviewItem(item);
      return;
    }
    
    setActionLoading(item.id);
    try {
      await foundItemUpdateMutation.mutateAsync({ id: item.id, updates: { status } });
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoading(null);
    }
  };


  const handleBulkStatusUpdate = async (itemIds, status) => {
    setActionLoading('bulk');
    try {
      await foundItemBulkUpdateMutation.mutateAsync({ ids: itemIds, status });
    } catch (err) {
      console.error('Bulk update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDirectRelease = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(showReleaseModal.id);
    try {
      await releaseItemMutation.mutateAsync({
        id: showReleaseModal.id,
        releaseData: {
          released_to_name: releaseForm.name,
          released_to_id_number: releaseForm.id_number,
          released_by_name: user?.full_name || 'Admin Staff',
          released_to_photo_url: releaseForm.photo_url
        }
      });
        
      setShowReleaseModal(null);
      setReleaseStep(1);
      setReleaseForm({ name: '', id_number: '', photo_url: '' });
    } catch (err) {
      console.error('Release failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimReview = async (claim, status, scheduledPickupTime) => {
    const displayId = claim.id;
    setActionLoading(`claim-${displayId}`);
    
    try {
      await claimReviewMutation.mutateAsync({ 
        claimId: claim.id, 
        status, 
        adminNotes: `Processed via dashboard on ${new Date().toLocaleDateString()}`,
        scheduledPickupTime
      });
    } catch (err) {
      console.error('Review failed:', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectMatch = async (foundId, lostId) => {
    setActionLoading(`match-${foundId}-${lostId}`);
    try {
      await connectMatchMutation.mutateAsync({ foundId, lostId });
    } catch (err) {
      console.error('Connection failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLostReportUpdate = async (reportId, updates) => {
    setActionLoading(`lost-${reportId}`);

    console.group('%c🗄️ [Dashboard] LOST ITEM UPDATE', 'background: #1e3a5f; color: #60a5fa; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.log('Report ID:', reportId);
    console.log('Updates to DB:', updates);
    console.groupEnd();

    try {
      await lostItemStatusMutation.mutateAsync({ id: reportId, ...updates });
      console.log('%c✅ [Dashboard] Lost item update SUCCESS', 'color: #34d399; font-weight: bold;');
      setSelectedLostReview(null);
    } catch (err) {
      console.error('%c❌ [Dashboard] Lost report update FAILED:', 'color: #f87171; font-weight: bold;', err);
      throw err; // Re-throw so the modal can show the error
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = recentFound.filter(item => {
    if (item.status === 'released') return false;
    if (inventoryFilter === 'pending' && !['reported', 'available'].includes(item.status)) return false;
    if (inventoryFilter === 'vault' && item.status !== 'in_custody') return false;
    if (inventoryFilter === 'ready' && item.status !== 'claimed') return false;
    if (searchTerm === 'today') return new Date(item.date_found).toLocaleDateString() === new Date().toLocaleDateString();
    if (searchTerm === 'weekly') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.date_found) >= weekAgo;
    }
    return (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.category?.toLowerCase().includes(searchTerm.toLowerCase()) || item.location?.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm));
  });

  const historyFiltered = historyItems.filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (item.released_to_name && item.released_to_name.toLowerCase().includes(searchTerm.toLowerCase())) || item.id.toString().includes(searchTerm));
  const filteredClaims = pendingClaims.filter(claim => (claim.owner_name && claim.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) || (claim.item_category && claim.item_category.toLowerCase().includes(searchTerm.toLowerCase())) || claim.student_id?.toString().includes(searchTerm));
  const filteredMatches = matches.filter(group => group.found_item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || group.found_item?.category?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLostReports = lostReports
    .filter(report => {
      if (report.status === 'dismissed' || report.status === 'resolved') return false;
      return report.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (report.owner_name && report.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) || report.id.toString().includes(searchTerm);
    })
    .sort((a, b) => {
      if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
      if (a.status !== 'pending_review' && b.status === 'pending_review') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen">
        <AdminHeader 
          currentTab={currentTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSync={refreshActiveTab}
          isSyncing={isSyncing}
          isLoading={loading}
        />

        <div className="pb-32 max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
        {/* Content Tabs */}
        <Tabs value={currentTab} onValueChange={(val) => navigate(`/admin/${val === 'found' ? '' : val}`)} className="w-full">
          <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl overflow-hidden min-h-[700px] w-full">
            <div className="p-4 md:p-8 lg:p-10 w-full">
              <TabsContent value="found" className="m-0 focus-visible:outline-none"><InventoryTab {...{inventoryFilter, setInventoryFilter, filteredItems, matches, pendingClaims, navigate, setSearchTerm, handleStatusUpdate, handleBulkStatusUpdate, setShowReleaseModal, setReleaseForm, actionLoading, activeFilter: searchTerm, onReviewItem: setSelectedReviewItem}} /></TabsContent>
              <TabsContent value="claims" className="m-0 focus-visible:outline-none"><ClaimsTab {...{filteredClaims, setSelectedClaim, setClaimReviewStep}} /></TabsContent>
              <TabsContent value="matches" className="m-0 focus-visible:outline-none">
                <MatchmakerTab {...{
                  filteredMatches, 
                  setSelectedMatchPair, 
                  handleConnectMatch, 
                  actionLoading, 
                  setPreviewImage,
                  isError: matchesError
                }} />
              </TabsContent>
              <TabsContent value="lost" className="m-0 focus-visible:outline-none"><LostReportsTab {...{filteredLostReports, matches, navigate, setSearchTerm, onUpdateReport: handleLostReportUpdate, onReviewReport: setSelectedLostReview, actionLoading, setPreviewImage, activeFilter: searchTerm}} /></TabsContent>
              <TabsContent value="witnesses" className="m-0 focus-visible:outline-none"><WitnessReportsTab {...{setPreviewImage, refreshTrigger: syncTriggers.witnesses}} /></TabsContent>
              <TabsContent value="history" className="m-0 focus-visible:outline-none">
                <ActivityFeed 
                  activities={historyFiltered} 
                  loading={historyLoading} 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm} 
                />
              </TabsContent>
              <TabsContent value="released" className="m-0 focus-visible:outline-none">
                <ActivityFeed 
                  activities={historyFiltered} 
                  loading={historyLoading} 
                  searchTerm={searchTerm} 
                  onSearchChange={setSearchTerm} 
                />
              </TabsContent>
              <TabsContent value="analytics" className="m-0 focus-visible:outline-none"><Analytics {...{onNavigateToTab: (tab) => navigate(`/admin/${tab}`), onSetSearchTerm: setSearchTerm, refreshTrigger: syncTriggers.analytics}} /></TabsContent>
              <TabsContent value="users" className="m-0 focus-visible:outline-none"><Leaderboard {...{refreshTrigger: syncTriggers.leaderboard}} /></TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {selectedClaim && <ClaimReviewModal key="claim-review" {...{selectedClaim, setSelectedClaim, claimReviewStep, setClaimReviewStep, handleClaimReview, actionLoading: actionLoading === `claim-${selectedClaim.id}`}} />}
          {showReleaseModal && <ReleaseItemModal key="release-item" {...{showReleaseModal, setShowReleaseModal, releaseStep, setReleaseStep, releaseForm, setReleaseForm, handleDirectRelease, actionLoading: actionLoading === showReleaseModal.id}} />}
          {selectedMatchPair && <MatchComparisonModal key="match-comparison" {...{selectedMatchPair, setSelectedMatchPair, handleConnectMatch}} />}
          {previewImage && <ImagePreviewOverlay key="image-preview" {...{previewImage, setPreviewImage}} />}
          

          {selectedReviewItem && (
            <ReportReviewModal 
              key="report-review"
              item={selectedReviewItem}
              onClose={() => setSelectedReviewItem(null)}
              onSubmit={foundItemUpdateMutation.mutate}
              isSubmitting={foundItemUpdateMutation.isPending}
            />
          )}

          {selectedLostReview && (
            <LostReviewModal 
              key="lost-review"
              report={selectedLostReview}
              onClose={() => setSelectedLostReview(null)}
              onPublish={handleLostReportUpdate}
              isSubmitting={actionLoading === `lost-${selectedLostReview.id}`}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
