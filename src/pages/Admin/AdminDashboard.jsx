import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Search,
  LayoutDashboard,
  ShieldCheck,
  PackageCheck,
  Archive,
  Image as ImageIcon,
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
import MemberRegistry from './MemberRegistry';
import LandingTab from './components/LandingTab';
import { ITEM_ATTRIBUTES, COLOR_OPTIONS, CONDITION_OPTIONS } from '../../constants/attributes';
import { imageCache } from '../../lib/imageCache';

// Modals
import ReleaseItemModal from './components/ReleaseItemModal';
import ClaimReviewModal from './components/ClaimReviewModal';
import MatchComparisonModal from './components/MatchComparisonModal';
import ImagePreviewOverlay from './components/ImagePreviewOverlay';
import ManualIntakeModal from './components/ManualIntakeModal';

/**
 * AdminDashboard - Premium Professional (Pro Max)
 * - Clean, high-impact workspace.
 * - Human-centric labeling (No "Command Center").
 * - Breathable, elegant navigation.
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [syncTriggers, setSyncTriggers] = useState({ analytics: 0, leaderboard: 0, witnesses: 0, registry: 0 });
  
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
  const [showIntakeModal, setShowIntakeModal] = useState(null);
  const [showManualIntake, setShowManualIntake] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Global event listeners for sidebar actions
  useEffect(() => {
    const handleOpenIntake = () => setShowManualIntake(true);
    window.addEventListener('open-manual-intake', handleOpenIntake);
    
    if (showIntakeModal || showManualIntake) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      window.removeEventListener('open-manual-intake', handleOpenIntake);
      document.body.classList.remove('modal-open');
    };
  }, [showIntakeModal, showManualIntake]);

  // Queries
  const { data: recentFound = [], isLoading: inventoryLoading, isFetching: inventoryFetching } = useQuery({
    queryKey: ['admin_inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_admin_inventory').select('*').neq('status', 'released');
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: pendingClaims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['admin_claims'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_admin_claims').select('*').eq('status', 'pending');
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['admin_matches'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_matches', {
        match_threshold: 0.3,
        match_count: 5
      });
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: lostReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin_lost'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_admin_lost_reports').select('*');
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: historyItems = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery({
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

  const isSyncing = inventoryFetching;
  const loading = (currentTab === 'found' && inventoryLoading) || 
                  (currentTab === 'claims' && claimsLoading) || 
                  (currentTab === 'matches' && matchesLoading) || 
                  (currentTab === 'lost' && reportsLoading) || 
                  (currentTab === 'history' && historyLoading);

  // Mutations (Standardized)
  const foundItemUpdateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('found_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_inventory'] })
  });

  const foundItemBulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      const { error } = await supabase.from('found_items').update({ status }).in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_inventory'] })
  });

  const claimReviewMutation = useMutation({
    mutationFn: async ({ claimId, status, adminNotes }) => {
      const { error } = await supabase.rpc('rpc_handle_claim_review', {
        p_claim_id: claimId,
        p_status: status,
        p_admin_notes: adminNotes
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

  const lostItemStatusMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }) => {
      const { error } = await supabase.from('lost_items').update({ status, admin_notes }).eq('id', id);
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

  const manualIntakeMutation = useMutation({
    mutationFn: async (data) => {
      const isFound = data.type === 'found';
      const tableName = isFound ? 'found_items' : 'lost_items';
      
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        [isFound ? 'date_found' : 'date_lost']: `${data.date}T12:00:00Z`,
        [isFound ? 'guest_name' : 'guest_name']: data.reporter_name, // Map to guest_name for manual entries
        status: data.status,
        is_manual_entry: true,
        attributes: {
          assisted_by: data.assisted_by,
          time: data.time,
          source: 'Physical Register'
        }
      };

      const { error } = await supabase.from(tableName).insert([payload]);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'found' ? 'admin_inventory' : 'admin_lost'] });
      setShowManualIntake(false);
    }
  });

  const refreshActiveTab = () => {
    queryClient.invalidateQueries({ queryKey: [`admin_${currentTab === 'history' || currentTab === 'released' ? 'history' : currentTab === 'found' ? 'inventory' : currentTab}`] });
  };

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
    
    setActionLoading(item.id);
    try {
      await foundItemUpdateMutation.mutateAsync({ id: item.id, updates: { status } });
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
      await foundItemUpdateMutation.mutateAsync({ 
        id: item.id, 
        updates: { 
          status: 'in_custody',
          verification_note,
          challenge_question,
          attributes
        }
      });
      setShowIntakeModal(null);
    } catch (err) {
      console.error('Intake failed', err);
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

  const handleClaimReview = async (claimId, status) => {
    setActionLoading(`claim-${claimId}`);
    try {
      await claimReviewMutation.mutateAsync({ 
        claimId, 
        status, 
        adminNotes: `Processed via dashboard on ${new Date().toLocaleDateString()}` 
      });
    } catch (err) {
      console.error('Review failed', err);
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
    try {
      await lostItemStatusMutation.mutateAsync({ id: reportId, ...updates });
    } catch (err) {
      console.error('Lost report update failed', err);
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
  const filteredLostReports = lostReports.filter(report => report.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (report.owner_name && report.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) || report.id.toString().includes(searchTerm));

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
              <TabsContent value="found" className="m-0 focus-visible:outline-none"><InventoryTab {...{inventoryFilter, setInventoryFilter, filteredItems, matches, pendingClaims, navigate, setSearchTerm, handleStatusUpdate, handleBulkStatusUpdate, setShowReleaseModal, setReleaseForm, actionLoading, activeFilter: searchTerm}} /></TabsContent>
              <TabsContent value="claims" className="m-0 focus-visible:outline-none"><ClaimsTab {...{filteredClaims, setSelectedClaim, setClaimReviewStep}} /></TabsContent>
              <TabsContent value="matches" className="m-0 focus-visible:outline-none"><MatchmakerTab {...{filteredMatches, setSelectedMatchPair, handleConnectMatch, actionLoading, setPreviewImage}} /></TabsContent>
              <TabsContent value="lost" className="m-0 focus-visible:outline-none"><LostReportsTab {...{filteredLostReports, matches, navigate, setSearchTerm, onUpdateReport: handleLostReportUpdate, actionLoading, setPreviewImage, activeFilter: searchTerm}} /></TabsContent>
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
              <TabsContent value="registry" className="m-0 focus-visible:outline-none"><MemberRegistry {...{refreshTrigger: syncTriggers.registry}} /></TabsContent>
              <TabsContent value="landing" className="m-0 focus-visible:outline-none"><LandingTab /></TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {selectedClaim && <ClaimReviewModal key="claim-review" {...{selectedClaim, setSelectedClaim, claimReviewStep, setClaimReviewStep, handleClaimReview, actionLoading: actionLoading === `claim-${selectedClaim.id}`}} />}
          {showReleaseModal && <ReleaseItemModal key="release-item" {...{showReleaseModal, setShowReleaseModal, releaseStep, setReleaseStep, releaseForm, setReleaseForm, handleDirectRelease, actionLoading: actionLoading === showReleaseModal.id}} />}
          {selectedMatchPair && <MatchComparisonModal key="match-comparison" {...{selectedMatchPair, setSelectedMatchPair, handleConnectMatch}} />}
          {previewImage && <ImagePreviewOverlay key="image-preview" {...{previewImage, setPreviewImage}} />}
          
          <ManualIntakeModal 
            key="manual-intake"
            isOpen={showManualIntake} 
            onClose={() => setShowManualIntake(false)} 
            onSubmit={(data) => manualIntakeMutation.mutate(data)}
            actionLoading={manualIntakeMutation.isPending}
          />

          {showIntakeModal && (
            <div key="intake-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 isolate">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowIntakeModal(null)} className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] relative z-10 shadow-3xl max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Header — compact and centered text mobile-first */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-4 md:px-8 md:pt-8 md:pb-6 border-b border-white/5 shrink-0">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-uni-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-uni-500/20 text-uni-400 shrink-0">
                    <ShieldCheck className="w-[18px] h-[18px] md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base md:text-xl font-bold text-white tracking-tight truncate">Process Intake</h3>
                      <span className="text-[8px] md:text-[10px] font-black text-white/30 tracking-widest bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shrink-0">#{showIntakeModal.item.id.slice(-4).toUpperCase()}</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Security Protocol</p>
                  </div>
                  <button 
                    onClick={() => setShowIntakeModal(null)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Context Strip (Backlog Item #97) */}
                <div className="px-5 py-4 md:px-8 md:py-5 bg-white/[0.02] border-b border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                    {showIntakeModal.item.photo_url ? (
                      <img src={showIntakeModal.item.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-grow py-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-uni-500/5 text-uni-400 border-uni-500/20 px-2 py-0.5 rounded-md">
                        {showIntakeModal.item.category}
                      </Badge>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{showIntakeModal.item.location}</p>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate mb-1">{showIntakeModal.item.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic font-medium">"{showIntakeModal.item.description || 'No description provided'}"</p>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar px-5 py-5 md:px-8 md:py-6 space-y-5 md:space-y-6">
                   <div className="bg-white/[0.02] p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-white/5 space-y-4 md:space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-uni-500"></div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.2em]">Verification Grid</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {(ITEM_ATTRIBUTES[showIntakeModal.item.category] || []).map(field => (
                          <div key={field} className="space-y-1.5">
                            <label className="block text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-0.5">{field}</label>
                            {field.includes('Color') ? (
                              <select className="w-full h-10 md:h-12 bg-white/[0.03] border border-white/5 rounded-lg md:rounded-xl px-3 md:px-4 text-[11px] md:text-xs font-bold text-white focus:border-uni-500/50 focus:bg-white/[0.06] outline-none appearance-none transition-all cursor-pointer [&>option]:text-slate-900" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})}>
                                <option value="" className="text-slate-500">Select {field}</option>{COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : field === 'Condition' ? (
                              <select className="w-full h-10 md:h-12 bg-white/[0.03] border border-white/5 rounded-lg md:rounded-xl px-3 md:px-4 text-[11px] md:text-xs font-bold text-white focus:border-uni-500/50 focus:bg-white/[0.06] outline-none appearance-none transition-all cursor-pointer [&>option]:text-slate-900" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})}>
                                <option value="" className="text-slate-500">Select Condition</option>{CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <input type="text" className="w-full h-10 md:h-12 bg-white/[0.03] border border-white/5 rounded-lg md:rounded-xl px-3 md:px-4 text-[11px] md:text-xs font-bold text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})} placeholder={`Value`} />
                            )}
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
                      <textarea className="w-full bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 text-[13px] md:text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none min-h-[80px] md:min-h-[100px] transition-all resize-none shadow-inner" placeholder="Staff-only specific details..." value={showIntakeModal.verification_note} onChange={(e) => setShowIntakeModal({...showIntakeModal, verification_note: e.target.value})} />
                   </div>

                   <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-widest ml-1 text-left">Challenge Question</label>
                      <input type="text" className="w-full h-11 md:h-14 bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl px-5 md:px-6 text-[13px] md:text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 focus:bg-white/[0.06] outline-none transition-all shadow-inner" placeholder="Ask student something unique..." value={showIntakeModal.challenge_question} onChange={(e) => setShowIntakeModal({...showIntakeModal, challenge_question: e.target.value})} />
                   </div>
                </div>

                {/* Sticky bottom action bar — now always visible and centered container */}
                <div className="shrink-0 px-5 py-4 md:px-8 md:py-6 border-t border-white/5 bg-slate-900/95 backdrop-blur-sm flex flex-row items-center gap-3 md:gap-4">
                   <button onClick={() => setShowIntakeModal(null)} className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all bg-white/5 rounded-xl md:rounded-2xl hover:bg-white/10">Discard</button>
                   <button onClick={handleIntakeSubmit} disabled={actionLoading === showIntakeModal.item.id} className="flex-1 bg-white hover:bg-uni-600 hover:text-white text-slate-950 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-2 md:gap-3 active:scale-[0.98]">
                     {actionLoading === showIntakeModal.item.id ? <RefreshCw size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                     {actionLoading === showIntakeModal.item.id ? 'Securing...' : 'Verify & Secure'}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
