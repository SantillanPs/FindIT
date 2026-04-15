import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import FeedbackModal from './FeedbackModal';
import ManualIntakeModal from '../pages/Admin/components/ManualIntakeModal';
import { useTheme } from '../context/ThemeContext';
import { SidebarUser } from './SidebarUser';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  LogOut, 
  Globe, 
  MessageSquare, 
  Users, 
  Shield,
  Moon,
  Sun,
  ChevronDown,
  LayoutGrid,
  ShieldCheck, 
  Warehouse, 
  HelpCircle, 
  Stamp, 
  Eye, 
  Sparkles, 
  Trophy, 
  PieChart, 
  History, 
  Home,
  ClipboardCheck,
  Search,
  AlertTriangle,
  HeartHandshake,
  Archive,
  Menu,
  X
} from "lucide-react";

// Refined Logo Component
const Logo = ({ className = "" }) => (
  <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-bold text-2xl shadow-2xl shadow-sky-500/10 border border-white/10 ${className}`}>
    <span>f</span>
  </div>
);

// Helper components moved up for hoisting
const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-uni-500/10 blur-[120px] rounded-full"></div>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-uni-500/15 blur-[120px] rounded-full"></div>
    <div className="absolute inset-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-uni-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-default/10 rounded-full blur-[120px]" />
    </div>
    <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
  </div>
);

const SideNavItem = ({ to, icon: Icon, label, count }) => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const isActive = (to === '/admin' || to === '/super' || to === '/')
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        isActive={isActive}
        className={`h-14 w-full transition-all duration-300 group border border-transparent !p-0 ${
          isActive ? 'bg-white text-black shadow-2xl shadow-sky-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
        render={
          <Link 
            to={to} 
            onClick={() => setOpenMobile(false)}
            className="flex items-center gap-4 px-4 w-full h-full no-underline relative z-[110] pointer-events-auto"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${isActive ? 'bg-black/5 text-black' : 'bg-slate-950 border border-white/5 text-slate-600 group-hover:text-sky-400'}`}>
              <Icon size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex-grow truncate">{label}</span>
            {count > 0 && (
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold ${isActive ? 'bg-black text-white' : 'bg-sky-500/20 text-sky-400'}`}>
                {count}
              </span>
            )}
            {isActive && (
              <div className="absolute -left-1 w-1.5 h-6 rounded-r-full bg-black shadow-lg" />
            )}
          </Link>
        }
      />
    </SidebarMenuItem>
  );
};

const LayoutContents = ({ children }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showManualIntake, setShowManualIntake] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { toggleSidebar, setOpenMobile } = useSidebar();
  const { data: adminStats = { claims: 0, matches: 0, lost: 0, feedbacks: 0 } } = useQuery({
    queryKey: ['admin', 'sidebar_stats', user?.id],
    queryFn: async () => {
      console.info('[STATS] Synchronizing Sidebar Counters...');
      const results = await Promise.allSettled([
        supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.rpc('get_admin_matches', { match_threshold: 0.3, match_count: 5 }),
        supabase.from('lost_items').select('id', { count: 'exact', head: true }).eq('status', 'reported'),
        user?.role === 'super_admin' ? supabase.rpc('count_pending_feedbacks').then(res => ({ count: res.data || 0 })) : Promise.resolve({ count: 0 })
      ]);

      const [claimsRes, matchesRes, lostRes, feedbackRes] = results.map(r => 
        r.status === 'fulfilled' ? r.value : { count: 0, data: [], error: r.reason }
      );

      // If the RPC specifically failed, we just show 0 or keep old count instead of crashing
      return {
        claims: claimsRes?.count || 0,
        matches: matchesRes?.data?.length || 0,
        lost: lostRes?.count || 0,
        feedbacks: feedbackRes?.count || 0
      };
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin'),
    refetchInterval: 60000, // Sync every 1m
    staleTime: 1000 * 30,
  });


  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  useEffect(() => {
    if (showManualIntake) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showManualIntake]);

  // Global Manual Intake Mutation
  const manualIntakeMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.rpc('rpc_manual_intake', {
        p_type: data.type,
        p_title: data.title,
        p_description: data.description,
        p_category: data.category,
        p_location: data.location,
        p_date: `${data.date}T12:00:00Z`,
        p_reporter_name: data.reporter_name,
        p_status: data.status,
        p_assisted_by: data.assisted_by,
        p_time: data.time,
        p_photo_url: data.photo_url
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'found' ? 'admin_inventory' : 'admin_lost'] });
      // Only close if it's NOT a sequential "Next" operation
      if (!variables.isNext) {
        setShowManualIntake(false);
      }
    }
  });

  const handleLogoClick = () => {
    const mainArea = document.querySelector('main');
    if (mainArea) {
      mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleOpenFeedback = () => setIsFeedbackOpen(true);
    window.addEventListener('open-feedback', handleOpenFeedback);
    return () => window.removeEventListener('open-feedback', handleOpenFeedback);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isInventoryOrLost = location.pathname === '/admin' || location.pathname === '/admin/lost';
  const shouldShowManualIntake = isAdmin && isInventoryOrLost;
  const shouldShowFeedback = !isAdmin;
  const showButton = shouldShowManualIntake || shouldShowFeedback;

  return (
    <div className="app-bg-main h-screen text-text-main flex overflow-hidden w-full relative">
      <BackgroundEffects />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      
      {showManualIntake && (
        <ManualIntakeModal 
          isOpen={showManualIntake}
          onClose={() => setShowManualIntake(false)}
          onSubmit={(data) => manualIntakeMutation.mutate(data)}
          actionLoading={manualIntakeMutation.isPending}
        />
      )}

      {user && location.pathname !== '/reset-password' ? (
        <div className="flex w-full h-full overflow-hidden relative">
          <Sidebar className="bg-slate-900/40 backdrop-blur-xl border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.3)] transition-all">
            <SidebarHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-4 group no-underline">
                  <Logo />
                  <div className="text-left">
                    <h1 className="text-xl font-bold text-white tracking-tighter leading-none uppercase">FindIT</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 pl-0.5">Asset Registry</p>
                  </div>
                </Link>
                <button 
                  onClick={() => setOpenMobile(false)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4 mt-6">
               {(location.pathname.startsWith('/super') && user.role === 'super_admin') ? (
                 <SidebarGroup>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6">Super Admin Workspace</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/super" icon={Globe} label="System Overview" />
                     <SideNavItem to="/super/feedback" icon={MessageSquare} label="Feedback Hub" count={adminStats.feedbacks} />
                     <SideNavItem to="/super/staff" icon={Users} label="Staff Management" />
                     <SideNavItem to="/super/audit" icon={ShieldCheck} label="Security Audit Logs" />
                   </SidebarMenu>
                   <SidebarSeparator className="my-4 bg-white/5 mx-2" />
                   <SidebarMenu>
                     <SideNavItem to="/admin" icon={Warehouse} label="Exit to Admin Panel" />
                   </SidebarMenu>
                 </SidebarGroup>
               ) : ['admin', 'super_admin'].includes(user.role) ? (
                 <SidebarGroup>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6">Command Center</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/" icon={Globe} label="Landing Page" />
                     <SideNavItem to="/admin" icon={Warehouse} label="Inventory" />
                     <SideNavItem to="/admin/lost" icon={HelpCircle} label="Lost Reports" count={adminStats.lost} />
                     <SideNavItem to="/admin/claims" icon={Stamp} label="Verify Claims" count={adminStats.claims} />
                     <SideNavItem to="/admin/witnesses" icon={Eye} label="Witness Intel" />
                     <SideNavItem to="/admin/matches" icon={Sparkles} label="Matchmaker" count={adminStats.matches} />
                     <SideNavItem to="/admin/users" icon={Trophy} label="Leaderboard" />
                     <SideNavItem to="/admin/registry" icon={Shield} label="Account Approval" />
                     <SideNavItem to="/admin/analytics" icon={PieChart} label="System Insights" />
                   </SidebarMenu>
                   <SidebarSeparator className="my-4 bg-white/5 mx-2" />
                   <SidebarMenu>
                     <SideNavItem to="/admin/released" icon={History} label="History" />
                     {user.role === 'super_admin' && (
                       <>
                         <SidebarSeparator className="my-4 bg-white/5 mx-2" />
                         <SideNavItem to="/super" icon={ShieldCheck} label="Super Admin Workspace" />
                       </>
                     )}
                   </SidebarMenu>
                 </SidebarGroup>
               ) : (
                 <SidebarGroup>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6">Terminal</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/student" icon={Home} label="Mission Control" />
                     <SideNavItem to="/my-claims" icon={ClipboardCheck} label="My Claims" />
                   </SidebarMenu>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Registry</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/public-feed" icon={Search} label="Found Inventory" />
                     <SideNavItem to="/lost-reports" icon={HelpCircle} label="Lost Reports" />
                     <SideNavItem to="/hall-of-integrity" icon={Trophy} label="Hall of Integrity" />
                   </SidebarMenu>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Personal</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/report/lost" icon={AlertTriangle} label="Report Lost" />
                     <SideNavItem to="/report/found" icon={HeartHandshake} label="Report Found" />
                     <SideNavItem to="/asset-vault" icon={Archive} label="Asset Vault" />
                   </SidebarMenu>
                 </SidebarGroup>
               )}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-white/5 bg-slate-950/20">
              <SidebarUser 
                user={user} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                handleLogout={handleLogout} 
              />
            </SidebarFooter>
          </Sidebar>

          <div className="flex-grow flex flex-col relative overflow-hidden layout-main-container">
            <header className="h-[var(--navbar-height)] flex-shrink-0 border-b border-white/5 flex items-center justify-between px-4 md:px-12 bg-slate-900/40 backdrop-blur-2xl z-[500]">
                <div className="flex items-center gap-4">
                  {user && (
                    <button 
                      onClick={toggleSidebar}
                      className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95 relative z-[50]"
                    >
                        <Menu size={24} />
                    </button>
                  )}
                  <div className="text-left space-y-1">
                      <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                        {location.pathname === '/student' ? 'Mission Control' : location.pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${user?.is_verified ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`}></div>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{user?.is_verified ? 'Member Authorized' : 'Queue Pending'}</span>
                      </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.role === 'student' && <NotificationCenter />}
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar relative text-left">
              <div className={`${(location.pathname.startsWith('/admin') || location.pathname.startsWith('/super')) ? 'max-w-[1700px] w-full' : 'max-w-6xl'} mx-auto`}>
                  {user.role === 'student' && !user.is_verified && (
                      <div className="mb-8 app-card border-brand-gold/30 bg-brand-gold/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
                        <div className="flex items-start sm:items-center gap-3 text-left">
                            <span className="text-xl">🏛️</span>
                            <div>
                                <p className="font-bold text-[12px] text-brand-gold uppercase tracking-wider mb-0.5">Authorization Pending</p>
                                <p className="text-[13px] text-slate-300 font-medium leading-relaxed">Registration queue active. USG administration will authorize your account shortly.</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] font-bold uppercase tracking-wider flex-shrink-0 w-full sm:w-auto text-center">Awaiting Approval</div>
                      </div>
                  )}
                  <div key={location.pathname}>{children}</div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col h-screen overflow-y-auto custom-scrollbar relative mesh-bg-premium bg-fixed w-full text-left">
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>
          
          <header className="sticky top-0 z-[60] h-[var(--navbar-height)] flex-shrink-0 border-b border-white/5 bg-slate-900/40 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between h-full items-center">
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 md:gap-4 group no-underline">
                  <Logo className="w-8 h-8 md:w-10 md:h-10 text-xl md:text-2xl rounded-lg md:rounded-xl" />
                  <div className="hidden sm:block text-left">
                    <h1 className="font-display font-bold text-xl tracking-tighter text-white leading-none uppercase">FindIT</h1>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 pl-0.5">Asset Registry</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 md:gap-6">
                  <ThemeToggle />
                  {location.pathname !== '/reset-password' && (
                    <>
                      <Link to="/register" className="hidden md:flex text-slate-400 hover:text-white px-4 h-12 items-center font-bold text-[10px] uppercase tracking-[0.2em]">Register</Link>
                      <Link to="/login" className="bg-white hover:bg-slate-200 text-black px-5 md:px-8 h-10 md:h-12 rounded-xl flex items-center justify-center font-bold text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl shadow-sky-500/10 active:scale-95">Sign In</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-grow w-full relative z-10"><div key={location.pathname}>{children}</div></main>
          {location.pathname === '/' && (
            <footer className="py-6 border-t border-white/5 bg-slate-950/60 backdrop-blur-xl relative z-10 w-full text-center">
                <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
                  FindIT Registry &bull; Institutional Asset Recovery &bull; &copy; 2026
                </p>
            </footer>
          )}
        </div>
      )}

      {/* Refined Feedback Trigger — Smaller, smart z-index, and reactive scale */}
      <style>{`
        body.modal-open .feedback-trigger {
          transform: scale(0);
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
      <AnimatePresence>
        {location.pathname !== '/super/feedback' && showButton && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[45] group feedback-trigger"
          >
        <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-10"></div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (shouldShowManualIntake) {
              setShowManualIntake(true);
            } else {
              setIsFeedbackOpen(true);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative h-11 rounded-2xl bg-slate-900/60 backdrop-blur-xl border-white/5 group-hover:border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-[width] duration-300 ease-in-out overflow-hidden ring-1 ring-white/10 flex items-center justify-start",
            isHovered ? (shouldShowManualIntake ? "w-48 px-4" : "w-40 px-4") : "w-11 px-0 justify-center"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {shouldShowManualIntake ? (
                <Archive className="w-4 h-4 text-sky-400 group-hover:text-white" />
              ) : (
                <MessageSquare className="w-4 h-4 text-white/70 group-hover:text-white" />
              )}
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {shouldShowManualIntake ? 'Manual Intake' : 'Feedback'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <LayoutContents>{children}</LayoutContents>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default Layout;
