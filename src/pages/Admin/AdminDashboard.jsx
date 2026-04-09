import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  Search,
  LayoutDashboard,
  ClipboardCheck,
  ShieldCheck,
  X,
  PackageCheck
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

/**
 * AdminDashboard - Premium Professional (Pro Max)
 * - Clean, high-impact workspace.
 * - Human-centric labeling (No "Command Center").
 * - Breathable, elegant navigation.
 */
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
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadTabData();
  }, [currentTab]);

  const loadTabData = async (force = false) => {
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
      const [foundRes, claimsRes, lostRes] = await Promise.all([
        supabase.from('found_items').select('*').neq('status', 'released'),
        supabase.from('claims').select('*, found_items(*)').eq('status', 'pending'),
        supabase.from('lost_items').select('*')
      ]);
      
      if (foundRes.error) throw foundRes.error;
      if (claimsRes.error) throw claimsRes.error;
      if (lostRes.error) throw lostRes.error;

      setRecentFound(foundRes.data || []);
      setPendingClaims(claimsRes.data || []);
      setLostReports(lostRes.data || []);
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
      const { data, error } = await supabase
        .from('claims')
        .select('*, found_items(*)')
        .eq('status', 'pending');
      if (error) throw error;
      setPendingClaims(data || []);
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
      const { data, error } = await supabase.rpc('get_admin_matches', {
        match_threshold: 0.3,
        match_count: 5
      });
      if (error) throw error;
      setMatches(data || []);
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
      const { data, error } = await supabase.from('lost_items').select('*');
      if (error) throw error;
      setLostReports(data || []);
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
      const { data, error } = await supabase.from('found_items').select('*').eq('status', 'released');
      if (error) throw error;
      setHistoryItems(data || []);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

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
    
    setActionLoading(item.id);
    try {
      const { error } = await supabase.from('found_items').update({ status }).eq('id', item.id);
      if (error) throw error;
      setRecentFound(prev => prev.map(i => i.id === item.id ? { ...i, status } : i));
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
      const { error } = await supabase.from('found_items').update({ 
        status: 'in_custody',
        verification_note,
        challenge_question,
        attributes
      }).eq('id', item.id);
      
      if (error) throw error;
      setShowIntakeModal(null);
      await refreshActiveTab();
    } catch (err) {
      console.error('Intake failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkStatusUpdate = async (itemIds, status) => {
    const prevItems = [...recentFound];
    setRecentFound(prev => prev.map(i => itemIds.includes(i.id) ? { ...i, status } : i));
    setActionLoading('bulk');
    try {
      const { error } = await supabase.from('found_items').update({ status }).in('id', itemIds);
      if (error) throw error;
    } catch (err) {
      console.error('Bulk update failed', err);
      setRecentFound(prevItems);
    } finally {
      setActionLoading(null);
      await refreshActiveTab();
    }
  };

  const handleDirectRelease = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(showReleaseModal.id);
    try {
      const { error } = await supabase.from('found_items').update({
        status: 'released',
        released_to_name: releaseForm.name,
        released_to_id_number: releaseForm.id_number,
        released_by_name: user?.full_name || 'Admin Staff',
        released_to_photo_url: releaseForm.photo_url,
        released_at: new Date().toISOString()
      }).eq('id', showReleaseModal.id);
        
      if (error) throw error;
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
      const { error } = await supabase.from('claims').update({ 
        status, 
        admin_notes: `Processed via dashboard on ${new Date().toLocaleDateString()}` 
      }).eq('id', claimId);
        
      if (error) throw error;
      if (status === 'approved') {
          const claim = pendingClaims.find(c => c.id === claimId);
          if (claim && claim.found_item_id) {
              await supabase.from('found_items').update({ status: 'claimed' }).eq('id', claim.found_item_id);
          }
      }
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
      const { error: fError } = await supabase.from('found_items').update({ status: 'claimed' }).eq('id', foundId);
      const { error: lError } = await supabase.from('lost_items').update({ status: 'resolved' }).eq('id', lostId);
      if (fError || lError) throw (fError || lError);
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
      const { error } = await supabase.from('lost_items').update(updates).eq('id', reportId);
      if (error) throw error;
      await refreshActiveTab();
    } catch (err) {
      console.error('Lost report update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = recentFound.filter(item => {
    if (item.status === 'released') return false;
    if (inventoryFilter === 'pending' && item.status !== 'reported') return false;
    if (inventoryFilter === 'vault' && item.status !== 'in_custody') return false;
    if (inventoryFilter === 'ready' && item.status !== 'claimed') return false;
    if (searchTerm === 'today') return new Date(item.date_found).toLocaleDateString() === new Date().toLocaleDateString();
    if (searchTerm === 'weekly') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.date_found) >= weekAgo;
    }
    return (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.category?.toLowerCase().includes(searchTerm.toLowerCase()) || item.location?.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm));
  });

  const historyFiltered = historyItems.filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.released_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toString().includes(searchTerm));
  const filteredClaims = pendingClaims.filter(claim => claim.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || claim.found_items?.category?.toLowerCase().includes(searchTerm.toLowerCase()) || claim.student_id?.toString().includes(searchTerm));
  const filteredMatches = matches.filter(group => group.found_item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || group.found_item.category?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLostReports = lostReports.filter(report => report.title?.toLowerCase().includes(searchTerm.toLowerCase()) || report.guest_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || report.id.toString().includes(searchTerm));

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-32 max-w-[1600px] mx-auto">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 border border-white/5 flex items-center justify-center text-uni-400 shadow-2xl">
              <LayoutDashboard size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Administration Panel</h2>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">Main Registry</h1>
                <Badge variant="outline" className="bg-uni-500/10 text-uni-400 border-uni-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Live
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-96">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-uni-400 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search items, users, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-slate-900/40 border border-white/10 rounded-[1.5rem] pl-14 pr-6 text-sm font-semibold text-white placeholder:text-slate-600 focus:border-uni-500/50 focus:bg-slate-900/60 outline-none backdrop-blur-3xl transition-all shadow-xl"
              />
            </div>

            <button 
              onClick={refreshActiveTab}
              disabled={isSyncing}
              className={`flex items-center justify-center gap-3 bg-uni-600 hover:bg-white hover:text-slate-950 text-white h-14 px-8 rounded-[1.5rem] border border-uni-400/20 text-[11px] font-bold uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] ${isSyncing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Synchronizing' : 'Sync Registry'}
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={currentTab} onValueChange={(val) => navigate(`/admin/${val === 'found' ? '' : val}`)} className="w-full">
          <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl overflow-hidden min-h-[700px] w-full">
            <div className="p-4 md:p-8 lg:p-10 w-full">
              <TabsContent value="found" className="m-0"><InventoryTab {...{inventoryFilter, setInventoryFilter, filteredItems, matches, pendingClaims, navigate, setSearchTerm, handleStatusUpdate, handleBulkStatusUpdate, setShowReleaseModal, setReleaseForm, actionLoading, activeFilter: searchTerm}} /></TabsContent>
              <TabsContent value="claims" className="m-0"><ClaimsTab {...{filteredClaims, setSelectedClaim, setClaimReviewStep}} /></TabsContent>
              <TabsContent value="matches" className="m-0"><MatchmakerTab {...{filteredMatches, setSelectedMatchPair, handleConnectMatch, actionLoading, setPreviewImage}} /></TabsContent>
              <TabsContent value="lost" className="m-0"><LostReportsTab {...{filteredLostReports, matches, navigate, setSearchTerm, onUpdateReport: handleLostReportUpdate, actionLoading, setPreviewImage, activeFilter: searchTerm}} /></TabsContent>
              <TabsContent value="witnesses" className="m-0"><WitnessReportsTab {...{setPreviewImage, refreshTrigger: syncTriggers.witnesses, setIsSyncing}} /></TabsContent>
              <TabsContent value="released" className="m-0"><ReleasedItemsTable releasedItems={historyFiltered} /></TabsContent>
              <TabsContent value="analytics" className="m-0"><Analytics {...{onNavigateToTab: (tab) => navigate(`/admin/${tab}`), onSetSearchTerm: setSearchTerm, refreshTrigger: syncTriggers.analytics, setIsSyncing}} /></TabsContent>
              <TabsContent value="users" className="m-0"><Leaderboard {...{refreshTrigger: syncTriggers.leaderboard, setIsSyncing}} /></TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {selectedClaim && <ClaimReviewModal {...{selectedClaim, setSelectedClaim, claimReviewStep, setClaimReviewStep, handleClaimReview, actionLoading: actionLoading === `claim-${selectedClaim.id}`}} />}
          {showReleaseModal && <ReleaseItemModal {...{showReleaseModal, setShowReleaseModal, releaseStep, setReleaseStep, releaseForm, setReleaseForm, handleDirectRelease, actionLoading: actionLoading === showReleaseModal.id}} />}
          {selectedMatchPair && <MatchComparisonModal {...{selectedMatchPair, setSelectedMatchPair, handleConnectMatch}} />}
          {previewImage && <ImagePreviewOverlay {...{previewImage, setPreviewImage}} />}

          {showIntakeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowIntakeModal(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 relative z-10 shadow-3xl space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-uni-500/10 rounded-2xl flex items-center justify-center border border-uni-500/20 text-uni-400">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Process Item Intake</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Item #{showIntakeModal.item.id} • Securing Foundation</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck size={16} className="text-uni-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify Item Details</p>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        {(ITEM_ATTRIBUTES[showIntakeModal.item.category] || []).map(field => (
                          <div key={field} className="space-y-2">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">{field}</label>
                            {field.includes('Color') ? (
                              <select className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-uni-500 outline-none appearance-none" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})}>
                                <option value="">Select</option>{COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : field === 'Condition' ? (
                              <select className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-uni-500 outline-none appearance-none" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})}>
                                <option value="">Select</option>{CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-uni-500 outline-none transition-all" value={showIntakeModal.attributes[field] || ''} onChange={(e) => setShowIntakeModal({...showIntakeModal, attributes: {...showIntakeModal.attributes, [field]: e.target.value}})} placeholder={`Enter ${field}`} />
                            )}
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">Internal Staff Note</label>
                      <textarea className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-xs font-medium text-white focus:border-uni-500 outline-none min-h-[100px] transition-all" placeholder="Add specific details only staff can see..." value={showIntakeModal.verification_note} onChange={(e) => setShowIntakeModal({...showIntakeModal, verification_note: e.target.value})} />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 text-left">Challenge Question (For Students)</label>
                      <input type="text" className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xs font-medium text-white focus:border-uni-500 outline-none transition-all" placeholder="Ask something unique about the item..." value={showIntakeModal.challenge_question} onChange={(e) => setShowIntakeModal({...showIntakeModal, challenge_question: e.target.value})} />
                   </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                   <button onClick={() => setShowIntakeModal(null)} className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                   <button onClick={handleIntakeSubmit} disabled={actionLoading === showIntakeModal.item.id || !showIntakeModal.verification_note} className="flex-1 bg-white hover:bg-uni-600 hover:text-white text-slate-950 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-3">
                     <PackageCheck size={18} />
                     {actionLoading === showIntakeModal.item.id ? 'Processing' : 'Confirm Intake'}
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
