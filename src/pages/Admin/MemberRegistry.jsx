import React, { useState } from 'react';
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
  ShieldAlert,
  XCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AccountReviewModal from './components/AccountReviewModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MemberRegistry = ({ refreshTrigger, setIsSyncing }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('unverified'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['registry-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles_v1')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .from('user_profiles_v1')
        .update({ 
          is_verified: false,
          verification_status: 'rejected',
          verification_feedback: 'Verification revoked by administrator.'
        })
        .eq('id', userId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registry-users'] });
    }
  });

  const handleStartVerification = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const revokeVerification = (userId) => {
    const confirmRevoke = window.confirm("Are you sure you want to suspend this member’s approved status?");
    if (!confirmRevoke) return;
    revokeMutation.mutate(userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.student_id_number?.includes(searchTerm) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filtering
    if (activeTab === 'unverified') return matchesSearch && user.verification_status === 'pending';
    if (activeTab === 'correction') return matchesSearch && user.verification_status === 're_audit';
    if (activeTab === 'rejected') return matchesSearch && user.verification_status === 'rejected';
    if (activeTab === 'verified') return matchesSearch && user.is_verified && user.verification_status === 'approved';
    
    return matchesSearch;
  });

  const pendingCount = users.filter(u => u.verification_status === 'pending').length;
  const correctionCount = users.filter(u => u.verification_status === 're_audit').length;
  const rejectedCount = users.filter(u => u.verification_status === 'rejected').length;
  const verifiedCount = users.filter(u => u.is_verified && u.verification_status === 'approved').length;

  if (isLoading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-2">
        <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <Shield className="text-uni-400" size={24} />
                Member Approval Console
            </h1>
            <p className="text-[12px] text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
               Administrative terminal for membership verification and account management.
            </p>
        </div>

        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-uni-400 transition-colors" size={16} />
            <input 
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl pl-12 pr-6 text-xs font-semibold text-white focus:outline-none focus:border-uni-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
            />
        </div>
      </header>

      {/* Internal Navigation Paging */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
          <div className="flex p-1.5 bg-slate-950/40 border border-white/5 rounded-2xl backdrop-blur-2xl shadow-inner scrollbar-hide overflow-x-auto w-full lg:min-w-max">
              <TabButton 
                active={activeTab === 'unverified'} 
                onClick={() => setActiveTab('unverified')}
                label="Pending"
                count={pendingCount}
                icon={Clock}
                color="text-amber-500"
                activeBg="bg-amber-500/10 border-amber-500/20 shadow-amber-500/10"
              />
              <TabButton 
                active={activeTab === 'correction'} 
                onClick={() => setActiveTab('correction')}
                label="Correction"
                count={correctionCount}
                icon={RefreshCw}
                color="text-sky-500"
                activeBg="bg-sky-500/10 border-sky-500/20 shadow-sky-500/10"
              />
              <TabButton 
                active={activeTab === 'verified'} 
                onClick={() => setActiveTab('verified')}
                label="Approved"
                count={verifiedCount}
                icon={CheckCircle2}
                color="text-emerald-500"
                activeBg="bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10"
              />
              <TabButton 
                active={activeTab === 'rejected'} 
                onClick={() => setActiveTab('rejected')}
                label="Denied"
                count={rejectedCount}
                icon={XCircle}
                color="text-rose-500"
                activeBg="bg-rose-500/10 border-rose-500/20 shadow-rose-500/10"
              />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/40 border border-white/5 rounded-xl backdrop-blur-xl w-full lg:w-auto justify-center lg:justify-start">
             <Filter size={12} className="text-slate-400" />
             <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                Context: {
                  activeTab === 'unverified' ? 'First-Time Applicants' : 
                  activeTab === 're-audit' ? 'Corrected Re-submissions' : 
                  activeTab === 'rejected' ? 'Validation Denials' : 'Account Authorized'
                }
             </span>
          </div>
      </div>

      <div className="lg:bg-slate-900/40 lg:rounded-[2.5rem] lg:border lg:border-white/5 lg:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] lg:backdrop-blur-xl overflow-visible lg:overflow-hidden">
        <div className="overflow-x-visible lg:overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-white/[0.02] text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-5">Account Details</th>
                <th className="px-8 py-5">Record Reference</th>
                <th className="px-8 py-5 text-center">Approval Status</th>
                <th className="px-8 py-5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group lg:divide-y lg:divide-white/[0.02] space-y-6 lg:space-y-0">
              {filteredUsers.map((user) => {
                const hasIDProof = !!user.verification_proof_url;
                
                return (
                  <tr key={user.id} className="transition-all group block lg:table-row p-6 lg:p-0 bg-slate-900/40 lg:bg-transparent rounded-3xl lg:rounded-none border border-white/5 lg:border-none shadow-2xl lg:shadow-none backdrop-blur-xl lg:backdrop-blur-none hover:bg-white/[0.02] lg:hover:bg-white/[0.01]">
                    <td className="px-4 lg:px-8 py-3 lg:py-5 text-left block lg:table-cell">
                        <div className="space-y-0.5 text-left">
                            <div className="font-bold text-white text-[15px] tracking-tight flex items-center gap-2">
                                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}
                                {user.is_verified && <BadgeCheck size={14} className="text-emerald-400" />}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium tracking-wide lowercase">
                                {user.email}
                            </div>
                        </div>
                    </td>
                    <td className="px-4 lg:px-8 py-3 lg:py-5 block lg:table-cell">
                        <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Student ID</div>
                        <span className={user.student_id_number ? "text-uni-400 font-bold tracking-wider text-sm" : "text-rose-500/60 font-medium text-[11px] uppercase"}>
                            {user.student_id_number || 'PENDING RECORD'}
                        </span>
                    </td>
                    <td className="px-4 lg:px-8 py-3 lg:py-5 text-left lg:text-center block lg:table-cell">
                        <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-0.5">Evidence Status</div>
                        {hasIDProof ? (
                             <div className="flex flex-col items-start lg:items-center gap-1.5">
                                <Badge variant="outline" className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                                    user.verification_status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                    user.verification_status === 're_audit' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                    'bg-uni-500/10 text-uni-300 border-uni-500/20'
                                }`}>
                                    {
                                      user.verification_status === 'rejected' ? 'Validation Issue' : 
                                      user.verification_status === 're_audit' ? 'Documentary Correction' : 
                                      'Documentary Evidence Uploaded'
                                    }
                                </Badge>
                                {user.verification_status === 'rejected' && (
                                    <span className="text-[9px] font-bold text-rose-500/80 uppercase tracking-widest">Awaiting Correction</span>
                                )}
                                {user.verification_status === 're_audit' && (
                                    <span className="text-[9px] font-bold text-sky-400/80 uppercase tracking-widest">Re-evaluation Required</span>
                                )}
                             </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950 border border-white/10">
                               <ShieldAlert size={12} className="text-slate-500" />
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Submission</span>
                            </div>
                        )}
                    </td>
                    <td className="px-4 lg:px-10 py-6 lg:py-8 text-left block lg:table-cell">
                      <div className="flex flex-col lg:flex-row lg:justify-end items-stretch lg:items-center gap-3">
                          {activeTab !== 'verified' ? (
                              <Button 
                                onClick={() => handleStartVerification(user)}
                                disabled={!hasIDProof}
                                className="h-10 px-6 bg-uni-600 text-white hover:bg-uni-700 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg disabled:opacity-20 disabled:grayscale transition-all group w-full lg:w-auto"
                              >
                                {hasIDProof ? (
                                   <>
                                      {
                                        user.verification_status === 'rejected' ? 'Review Rejection' : 
                                        user.verification_status === 're_audit' ? 'Review Correction' : 
                                        'Review Stage'
                                      }
                                      <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                   </>
                                ) : 'Waiting for ID'}
                              </Button>
                          ) : (
                              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                                <Button 
                                  onClick={() => handleStartVerification(user)}
                                  variant="ghost"
                                  className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all w-full lg:w-auto bg-white/5 lg:bg-transparent"
                                >
                                  Review Record
                                </Button>
                                <Button 
                                  onClick={() => revokeVerification(user.id)}
                                  variant="ghost"
                                  className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-white/10 lg:border-transparent transition-all w-full lg:w-auto"
                                >
                                  Suspend Approval
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

      <AccountReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onComplete={() => queryClient.invalidateQueries({ queryKey: ['registry-users'] })}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, label, count, icon: Icon, color, activeBg }) => (
    <button 
      onClick={onClick}
      className={`relative px-5 lg:px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-3 transition-all flex-1 lg:min-w-[180px] group ${active ? `${activeBg} text-white shadow-2xl` : 'text-slate-400 hover:text-slate-200'}`}
    >
        <Icon size={14} className={active ? color : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
        <span className="flex-1 text-left hidden sm:inline">{label}</span>
        <span className="flex-1 text-left sm:hidden">{label.split(' ')[0]}</span>
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800'}`}>
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
