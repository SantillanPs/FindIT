import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  BadgeCheck,
  Users,
  Eye,
  FileText,
  UserCheck,
  History,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VerificationReviewModal from './components/VerificationReviewModal';

const MemberRegistry = ({ refreshTrigger, setIsSyncing }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('unverified'); // 'unverified' | 'verified'
  
  // Verification Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchUsers(refreshTrigger > 0);
  }, [refreshTrigger, activeTab]);

  const fetchUsers = async (isSync = false) => {
    if (isSync) setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles_v1')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('[REGISTRY] Failed to fetch users', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleStartVerification = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const revokeVerification = async (userId) => {
    const confirmRevoke = window.confirm("Are you sure you want to revoke this student's verified status?");
    if (!confirmRevoke) return;

    try {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ is_verified: false })
        .eq('id', userId);
        
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('[REGISTRY] Revoke failed', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.student_id_number?.includes(searchTerm) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filtering
    if (activeTab === 'unverified') return matchesSearch && !user.is_verified;
    if (activeTab === 'verified') return matchesSearch && user.is_verified;
    return matchesSearch;
  });

  const unverifiedCount = users.filter(u => !u.is_verified).length;
  const verifiedCount = users.filter(u => u.is_verified).length;

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-2">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
                <Shield className="text-uni-400" size={32} />
                Student Verification Hub
            </h1>
            <p className="text-[13px] text-slate-500 font-medium uppercase tracking-[0.2em] leading-relaxed">
               Administrative terminal for identity vetting and institutional auditing.
            </p>
        </div>

        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-uni-400 transition-colors" size={18} />
            <input 
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl pl-14 pr-6 text-sm font-semibold text-white focus:outline-none focus:border-uni-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
            />
        </div>
      </header>

      {/* Internal Navigation Paging */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="flex p-1.5 bg-slate-950/40 border border-white/5 rounded-2xl backdrop-blur-2xl shadow-inner scrollbar-hide overflow-x-auto">
              <TabButton 
                active={activeTab === 'unverified'} 
                onClick={() => setActiveTab('unverified')}
                label="Pending Verification"
                count={unverifiedCount}
                icon={Clock}
                color="text-amber-500"
                activeBg="bg-amber-500/10 border-amber-500/20 shadow-amber-500/10"
              />
              <TabButton 
                active={activeTab === 'verified'} 
                onClick={() => setActiveTab('verified')}
                label="Verified Registry"
                count={verifiedCount}
                icon={CheckCircle2}
                color="text-emerald-500"
                activeBg="bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10"
              />
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/40 border border-white/5 rounded-xl backdrop-blur-xl">
             <Filter size={14} className="text-slate-500" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Context: {activeTab === 'unverified' ? 'Identity Pending' : 'Identity Confirmed'}
             </span>
          </div>
      </div>

      <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6">Student Identity</th>
                <th className="px-10 py-6">ID Reference</th>
                <th className="px-10 py-6 text-center">Identity Proof Status</th>
                <th className="px-10 py-6 text-right">Administrative Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredUsers.map((user) => {
                const hasIDProof = !!user.verification_proof_url;
                
                return (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-10 py-8 text-left">
                        <div className="space-y-1.5 text-left">
                            <div className="font-bold text-white text-[15px] tracking-tight flex items-center gap-2">
                                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}
                                {user.is_verified && <BadgeCheck size={16} className="text-emerald-400" />}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold tracking-wider lowercase opacity-60">
                                {user.email}
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <span className={user.student_id_number ? "text-uni-400 font-bold tracking-widest text-[13px]" : "text-rose-500/30 font-medium text-[11px] uppercase"}>
                            {user.student_id_number || 'PENDING RECORD'}
                        </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                        {hasIDProof ? (
                             <Badge variant="outline" className="bg-uni-500/10 text-uni-400 border-uni-500/20 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg">
                                Documentary Evidence Uploaded
                             </Badge>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950 border border-white/5 opacity-30">
                               <ShieldAlert size={12} className="text-slate-500" />
                               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">No Submission</span>
                            </div>
                        )}
                    </td>
                    <td className="px-10 py-8 text-left">
                      <div className="flex justify-end items-center gap-4">
                          {activeTab === 'unverified' ? (
                              <Button 
                                onClick={() => handleStartVerification(user)}
                                disabled={!hasIDProof}
                                className="h-12 px-7 bg-uni-600 text-white hover:bg-uni-700 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-20 disabled:grayscale transition-all group"
                              >
                                {hasIDProof ? (
                                   <>
                                      Auditing Stage
                                      <ArrowRight size={14} className="ml-3 group-hover:translate-x-1 transition-transform" />
                                   </>
                                ) : 'Waiting for ID'}
                              </Button>
                          ) : (
                              <div className="flex items-center gap-2">
                                <Button 
                                  onClick={() => handleStartVerification(user)}
                                  variant="ghost"
                                  className="h-11 px-5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  Review Record
                                </Button>
                                <Button 
                                  onClick={() => revokeVerification(user.id)}
                                  variant="ghost"
                                  className="h-11 px-6 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 border border-transparent transition-all"
                                >
                                  Revoke Attestation
                                </Button>
                              </div>
                          )}
                      </div>
                    </td>
                </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan="4" className="py-40 text-center">
                        <div className="max-w-xs mx-auto space-y-6 opacity-40">
                            <Users size={56} className="mx-auto text-slate-800" />
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registry Clear</p>
                              <p className="text-[10px] text-slate-600 font-medium">No members found in the current filtering context.</p>
                            </div>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VerificationReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onComplete={fetchUsers}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, label, count, icon: Icon, color, activeBg }) => (
    <button 
      onClick={onClick}
      className={`relative px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] flex items-center gap-4 transition-all min-w-[210px] group ${active ? `${activeBg} text-white shadow-2xl` : 'text-slate-500 hover:text-slate-300'}`}
    >
        <Icon size={16} className={active ? color : 'text-slate-600 group-hover:text-slate-400 transition-colors'} />
        <span className="flex-1 text-left">{label}</span>
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${active ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-600 group-hover:bg-slate-800'}`}>
          {count}
        </span>
        {active && (
            <motion.div 
                layoutId="active-nav-glow"
                className="absolute inset-0 bg-white/5 rounded-xl -z-10"
            />
        )}
    </button>
);

export default MemberRegistry;
