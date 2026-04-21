import React, { useState, useEffect } from 'react';
/* eslint-disable no-unused-vars */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import FeedbackModal from './FeedbackModal';
import ManualIntakeModal from '../pages/Admin/components/ManualIntakeModal';
import { useTheme } from '../context/ThemeContext';
import { SidebarUser } from './SidebarUser';
import HelpMenu from './HelpMenu';
import ManualIntakeButton from './ManualIntakeButton';
import TutorialOverlay from './TutorialOverlay';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { cn } from "@/lib/utils";
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

const tourSteps = {
  'tour-landing': [
    {
      target: '#tour-welcome',
      content: 'Welcome to FindIT! This is your central hub for recovering lost property and reporting found items within the institution.',
      title: 'Welcome to FindIT',
      placement: 'center',
    },
    {
      target: '#tour-report-missing',
      content: 'If you\'ve lost an item, start here to file a report. Our AI matching system will immediately look for potentially matching found items.',
      title: 'Report Your Loss',
    },
    {
      target: '#tour-report-found',
      content: 'Found someone else\'s property? Join our "Integrity" mission by registering it here for secure return to its owner.',
      title: 'Register a Discovery',
    },
    {
      target: '#tour-feed',
      content: 'Browse the latest found items and active lost reports from across the campus.',
      title: 'Public Feed',
    },
    {
      target: '#tour-search',
      content: 'Use our high-speed registry search to quickly filter through thousands of records by title or category.',
      title: 'Registry Search',
    },
    {
      target: '#tour-leaderboard',
      content: 'Explore the community Honor Roll to see who leads in integrity points and successful returns!',
      title: 'Community Honor Roll',
    },
  ],
  'tour-dashboard': [
    {
      target: '#tour-mission-control',
      content: 'Welcome to your Mission Control. Here you can track all your lost and found cases within the institution.',
      title: 'Dashboard Overview',
      placement: 'center',
    },
    {
      target: '#tour-integrity-points',
      content: 'These are your Integrity Points. Earn them by reporting found items and returning property to their rightful owners.',
      title: 'Honesty Level',
    },
    {
      target: '#tour-stats',
      content: 'Your case statistics at a glance. Track how many items you\'ve reported, found, and matching statuses.',
      title: 'Case Insights',
    },
    {
      target: '#tour-live-feed',
      content: 'The Discovery Feed shows the most recent found items reported by other students. Keep an eye out for yours!',
      title: 'Real-time Discoveries',
    },
    {
      target: '#tour-community-searches',
      content: 'Check "Community Searches" to see what your peers have lost. You might have found exactly what they are looking for!',
      title: 'Help Your Peers',
    },
    {
      target: '#tour-honor-context',
      content: 'See your standing within your department. Integrity points contribute to your college\'s overall reputation.',
      title: 'Department Standing',
    },
    {
      target: '#tour-case-queue',
      content: 'Access your full history of lost and found cases here. Track matches and verify returns in real-time.',
      title: 'The Queue',
    },
  ],
  'tour-report-lost': [
    {
      target: '#tour-report-missing',
      content: 'Clicking this button starts the missing property workflow.',
      title: 'Start Process',
    }
  ],
  'tour-report': [
    {
      target: '#tour-report-missing',
      content: 'Start here if you have lost something. Our AI system will begin scanning the registry for matches.',
      title: 'Report Lost Item',
    },
    {
      target: '#tour-report-found',
      content: 'Use this to register items you have recovered. This is the primary way to earn Integrity Points and improve your standing.',
      title: 'Register Discovery',
    }
  ],
  'tour-report-found': [
    {
      target: '#tour-report-found',
      content: 'Clicking this button starts the found item registration.',
      title: 'Secure Registry',
    }
  ]
};

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

const SideNavItem = ({ id, to, icon: Icon, label, count, disabled, isDev }) => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const isActive = !disabled && ((to === '/admin' || to === '/super' || to === '/')
    ? location.pathname === to 
    : location.pathname.startsWith(to));

  const Comp = (disabled || !to) ? 'div' : Link;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        isActive={isActive}
        disabled={disabled}
        className={cn(
          "h-14 w-full transition-all duration-300 group border border-transparent !p-0",
          isActive ? 'bg-white text-black shadow-2xl shadow-sky-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5',
          disabled && "opacity-50 cursor-not-allowed grayscale"
        )}
        render={
          <Comp 
            id={id}
            to={!disabled ? to : undefined} 
            onClick={!disabled ? (() => setOpenMobile(false)) : undefined}
            className={cn(
              "flex items-center gap-4 px-4 w-full h-full no-underline relative z-[110]",
              !disabled ? "pointer-events-auto" : "pointer-events-none"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
              isActive ? 'bg-black/5 text-black' : 'bg-slate-950 border border-white/5 text-slate-600 group-hover:text-sky-400',
              disabled && "bg-slate-900/50 text-slate-700"
            )}>
              <Icon size={16} aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0 flex-grow">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] truncate">{label}</span>
              {isDev && (
                <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest mt-0.5">In Development</span>
              )}
            </div>
            {count > 0 && !isDev && (
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold ${isActive ? 'bg-black text-white' : 'bg-sky-500/20 text-sky-400'}`}>
                {count}
              </span>
            )}
            {isActive && (
              <div className="absolute -left-1 w-1.5 h-6 rounded-r-full bg-black shadow-lg" />
            )}
          </Comp>
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
  const { showHallOfIntegrity, showAssetVault } = useFeatureFlags();
  
  const [activeTour, setActiveTour] = useState(null);
  const [tourRun, setTourRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const startTour = (tourId) => {
    // Force a restart by incrementing key and resetting run state
    setTourRun(false);
    setTimeout(() => {
      setActiveTour(tourId);
      setTourRun(true);
      setTourKey(prev => prev + 1);
    }, 50);
  };

  useEffect(() => {
    const handleOpenTutorial = (e) => {
      startTour(e.detail.id);
    };
    window.addEventListener('open-tutorial', handleOpenTutorial);
    return () => window.removeEventListener('open-tutorial', handleOpenTutorial);
  }, []);
  
  const { toggleSidebar, setOpenMobile } = useSidebar();
  const { data: adminStats = { claims: 0, matches: 0, lost: 0, feedbacks: 0, review: 0 } } = useQuery({
    queryKey: ['admin', 'sidebar_stats', user?.id],
    queryFn: async () => {
      console.info('[STATS] Synchronizing Sidebar Counters (Consolidated Pulse)...');
      const { data, error } = await supabase.rpc('get_admin_sidebar_counts');
      
      if (error) {
        console.error('[STATS] Pulse failed:', error);
        return { claims: 0, matches: 0, lost: 0, feedbacks: 0, review: 0 };
      }

      return data || { claims: 0, matches: 0, lost: 0, feedbacks: 0, review: 0 };
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin'),
    refetchInterval: 300000, // Sync every 5m
    staleTime: 1000 * 60, // 1m stale time
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

  return (
    <div className="app-bg-main h-[100dvh] text-text-main flex overflow-hidden w-full relative">
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
                     <SideNavItem to="/admin/review" icon={ShieldCheck} label="Review Queue" count={adminStats.review || 0} />
                     <SideNavItem to="/admin" icon={Warehouse} label="Inventory" />
                     <SideNavItem to="/admin/lost" icon={HelpCircle} label="Lost Reports" count={adminStats.lost} />
                     <SideNavItem to="/admin/claims" icon={Stamp} label="Verify Claims" count={adminStats.claims} />
                     <SideNavItem to="/admin/witnesses" icon={Eye} label="Witness Intel" />
                     <SideNavItem to="/admin/matches" icon={Sparkles} label="Matchmaker" count={adminStats.matches} />
                     <SideNavItem to="/admin/users" icon={Trophy} label="Leaderboard" />
                     <SideNavItem to="/admin/registry" icon={Shield} label="Account Approval" />
                     <SideNavItem to="/admin/analytics" icon={PieChart} label="System Insights" />
                     <SideNavItem to="/admin/taxonomy" icon={LayoutGrid} label="Taxonomy Registry" />
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
                     {showHallOfIntegrity && (
                       <SideNavItem to="/hall-of-integrity" icon={Trophy} label="Hall of Integrity" disabled={false} isDev={true} />
                     )}
                   </SidebarMenu>
                   <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Personal</SidebarGroupLabel>
                   <SidebarMenu>
                     <SideNavItem to="/report/lost" icon={AlertTriangle} label="Report Lost" />
                     <SideNavItem to="/report/found" icon={HeartHandshake} label="Report Found" />
                     {showAssetVault && (
                       <SideNavItem to="/asset-vault" icon={Archive} label="Asset Vault" disabled={false} isDev={true} />
                     )}
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

          <div className="flex-grow flex flex-col relative h-[100dvh] overflow-hidden layout-main-container">
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
        <div className="flex-grow flex flex-col h-[100dvh] overflow-hidden relative mesh-bg-premium bg-fixed w-full text-left">
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
          <main className="flex-grow w-full overflow-y-auto custom-scrollbar transition-all duration-500">
            <div key={location.pathname}>{children}</div>
            {location.pathname === '/' && (
              <footer className="py-12 border-t border-white/5 bg-slate-950/20 w-full text-center">
                  <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
                    FindIT Registry &bull; Institutional Asset Recovery &bull; &copy; 2026
                  </p>
              </footer>
            )}
          </main>
        </div>
      )}

      {/* New Help & Tutorial System */}
      {(isAdmin && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/super'))) ? (
        <ManualIntakeButton onClick={() => setShowManualIntake(true)} />
      ) : (
        <HelpMenu 
          onStartTour={startTour} 
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          isLanding={location.pathname === '/'} 
        />
      )}

      <TutorialOverlay 
        key={tourKey}
        run={tourRun}
        steps={activeTour ? tourSteps[activeTour] : []}
        onCallback={(data) => {
          if (['finished', 'skipped'].includes(data.status)) {
            const finishedTour = activeTour;
            setTourRun(false);
            // We keep activeTour briefly for the event, then clean it
            window.dispatchEvent(new CustomEvent('tutorial-finished', { 
              detail: { id: finishedTour, status: data.status } 
            }));
            setTimeout(() => setActiveTour(null), 100);
          }
        }}
      />
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
