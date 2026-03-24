import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import apiClient from '../api/client';
import ThemeToggle from './ThemeToggle';
import FeedbackModal from './FeedbackModal';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminStatsFetched, setIsAdminStatsFetched] = useState(false);
  const [adminStats, setAdminStats] = useState({ claims: 0, matches: 0, lost: 0, feedbacks: 0 });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Listen for custom trigger events
  useEffect(() => {
    const handleOpenFeedback = () => setIsFeedbackOpen(true);
    window.addEventListener('open-feedback', handleOpenFeedback);
    return () => window.removeEventListener('open-feedback', handleOpenFeedback);
  }, []);

  // Fetch admin stats if user is admin or super_admin
  useEffect(() => {
    if ((user?.role === 'admin' || user?.role === 'super_admin') && !isAdminStatsFetched) {
      setIsAdminStatsFetched(true);
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const endpoints = [
        apiClient.get('/admin/claims/pending'),
        apiClient.get('/admin/matches/all'),
        apiClient.get('/admin/lost/all')
      ];

      if (user?.role === 'super_admin') {
        endpoints.push(apiClient.get('/feedbacks'));
      }

      const results = await Promise.all(endpoints);
      
      setAdminStats({
        claims: results[0].data.length,
        matches: results[1].data.length,
        lost: results[2].data.length,
        feedbacks: user?.role === 'super_admin' ? results[3].data.filter(f => f.status === 'pending').length : 0
      });
    } catch (error) {
      console.error('Failed to fetch admin sidebar stats', error);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-bg-main h-screen text-text-main flex overflow-hidden transition-colors duration-300">
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="ambient-uni opacity-30"></div>
        <div className="ambient-accent opacity-20"></div>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />

      {user ? (
        <>
          {/* Mobile Sidebar Backdrop */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-[60] w-72 flex-shrink-0 bg-bg-surface border-r border-border-main flex flex-col h-full overflow-hidden transition-all duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="p-8 pb-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group no-underline">
                  <div className="w-10 h-10 bg-gradient-to-br from-uni-600 to-uni-400 rounded-xl flex items-center justify-center text-white text-xl group-hover:rotate-6 transition-transform border border-white/5">
                    <i className="fa-solid fa-compass"></i>
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-xl tracking-tight text-text-header leading-none">FindIT</h1>
                    <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mt-0.5">Lost & Found</p>
                  </div>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white p-2">
                   <i className="fa-solid fa-xmark"></i>
                </button>
             </div>

             <nav className="flex-grow px-4 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-5 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Main Navigation</p>
                {location.pathname.startsWith('/super') && user.role === 'super_admin' ? (
                  <>
                    <p className="px-5 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 mt-8">Super Admin Workspace</p>
                    <SideNavLink to="/super" icon="fa-globe" label="System Overview" />
                    <SideNavLink to="/super/zones" icon="fa-route" label="Map Builder" />
                    <SideNavLink to="/super/feedback" icon="fa-comments" label="Feedback Hub" count={adminStats.feedbacks} />
                    <SideNavLink to="/super/staff" icon="fa-users-gear" label="Staff Management" />
                    <SideNavLink to="/super/audit" icon="fa-shield-halved" label="Security Audit Logs" />
                    <div className="h-px bg-white/5 mx-4 my-4"></div>
                    <SideNavLink to="/admin" icon="fa-warehouse" label="Exit to Admin Panel" />
                  </>
                ) : ['admin', 'super_admin'].includes(user.role) ? (
                  <>
                    <p className="px-5 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 mt-8">Command Center</p>
                    <SideNavLink to="/admin" icon="fa-warehouse" label="Inventory" />
                    <SideNavLink to="/admin/lost" icon="fa-file-circle-question" label="Lost Reports" count={adminStats.lost} />
                    <SideNavLink to="/admin/claims" icon="fa-stamp" label="Verify Claims" count={adminStats.claims} />
                    <SideNavLink to="/admin/witnesses" icon="fa-eye" label="Witness Intel" />
                    <SideNavLink to="/admin/matches" icon="fa-wand-magic-sparkles" label="Matchmaker" count={adminStats.matches} />
                    <SideNavLink to="/admin/users" icon="fa-trophy" label="Leaderboard" />
                    <SideNavLink to="/admin/analytics" icon="fa-chart-pie" label="System Insights" />
                    <div className="h-px bg-white/5 mx-4 my-4"></div>
                    <SideNavLink to="/admin/released" icon="fa-history" label="History" />
                    
                    {user.role === 'super_admin' && (
                      <>
                        <div className="h-px bg-white/5 mx-4 my-4"></div>
                        <SideNavLink to="/super" icon="fa-user-shield" label="Super Admin Workspace" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="px-5 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Terminal</p>
                    <SideNavLink to="/student" icon="fa-house" label="Mission Control" />
                    <SideNavLink to="/my-claims" icon="fa-clipboard-check" label="My Claims" />
                    
                    <p className="px-5 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-6">Registry</p>
                    <SideNavLink to="/public-feed" icon="fa-magnifying-glass" label="Found Inventory" />
                    <SideNavLink to="/lost-reports" icon="fa-file-circle-question" label="Lost Reports" />
                    <SideNavLink to="/hall-of-integrity" icon="fa-trophy" label="Hall of Integrity" />
                    
                    <p className="px-5 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-6">Personal</p>
                    <SideNavLink to="/report/lost" icon="fa-triangle-exclamation" label="Report Lost" />
                    <SideNavLink to="/report/found" icon="fa-hand-holding-heart" label="Report Found" />
                    <SideNavLink to="/asset-vault" icon="fa-box-archive" label="Asset Vault" />
                  </>
                )}
             </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-grow flex flex-col relative z-10 overflow-hidden w-full">
             <header className="h-20 flex-shrink-0 border-b border-border-main flex items-center justify-between px-6 md:px-10 bg-bg-surface/80 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-400"
                   >
                      <i className="fa-solid fa-bars-staggered"></i>
                   </button>
                   <div>
                      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1">
                         {location.pathname === '/student' ? 'dashboard overview' : location.pathname.split('/').pop()?.replace('-', ' ') || 'overview'}
                      </h2>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-uni-500' : 'bg-brand-gold'}`}></div>
                         <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">
                           {user.is_verified ? 'Verified' : 'Pending Review'}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                   <ThemeToggle />
                   {user?.role === 'student' && <NotificationCenter />}
                   <div className="hidden sm:block h-8 w-px bg-white/10 mx-2"></div>
                   
                   <div className="hidden md:flex flex-col items-end mr-2">
                       <span className="text-[10px] font-black text-text-header uppercase tracking-widest truncate max-w-[120px]">{user.email.split('@')[0]}</span>
                       <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">{user.role}</span>
                   </div>

                   <button 
                     onClick={handleLogout}
                     className="w-10 h-10 md:w-auto md:px-5 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20"
                     title="Sign Out"
                   >
                     <i className="fa-solid fa-sign-out text-xs"></i>
                     <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Sign Out</span>
                   </button>
                </div>
             </header>

             <main className="flex-grow overflow-y-auto p-4 md:p-10 custom-scrollbar">
                <div className={`${location.pathname === '/super/zones' ? 'max-w-[1600px] w-full' : 'max-w-6xl'} mx-auto`}>
                    <AnimatePresence mode="wait">
                    {user.role === 'student' && !user.is_verified && (
                        <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8 app-card border-brand-gold/30 bg-brand-gold/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md"
                        >
                        <div className="flex items-start sm:items-center gap-3 text-left">
                            <span className="text-xl">🏛️</span>
                            <div>
                               <p className="font-black text-[9px] text-brand-gold uppercase tracking-widest mb-0.5">Verification Status: Pending</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Your student identity is currently in the queue. An administrator will review your documents shortly.</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[8px] font-black uppercase tracking-[0.2em] flex-shrink-0 w-full sm:w-auto text-center">
                           Awaiting Admin Approval
                        </div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {children}
                    </motion.div>
                    </AnimatePresence>
                </div>
             </main>
          </div>
        </>

      ) : (
        /* Guest Layout (Landing Page) */
        <div className="flex-grow flex flex-col h-screen overflow-y-auto custom-scrollbar relative mesh-bg-premium bg-fixed">
          <BackgroundEffects />
          
          <header className="glass-header sticky top-0 z-[60] h-14 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between h-full items-center">
                <Link to="/" className="flex items-center gap-3 group no-underline">
                  <div className="w-10 h-10 bg-gradient-to-br from-uni-600 to-uni-400 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-uni-500/30 group-hover:rotate-6 transition-transform">
                    <i className="fa-solid fa-compass"></i>
                  </div>
                  <div className="hidden sm:block text-left">
                    <h1 className="font-display font-bold text-xl tracking-tight text-text-header leading-none">FindIT</h1>
                    <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mt-0.5">Lost & Found</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-3 md:gap-6">
                  <ThemeToggle />
                  <Link to="/login" className="text-slate-500 hover:text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] transition-colors">Sign In</Link>
                  <Link to="/register" className="bg-uni-600 hover:bg-uni-500 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-wide md:tracking-widest transition-all whitespace-nowrap border border-black/5">Register</Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          
          <footer className="py-16 border-t border-brand-border mt-16 bg-slate-950/20 relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 text-center">
               <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">
                  FindIT &bull; Institutional Recovery Platform &bull; &copy; 2026
               </p>
            </div>
          </footer>
        </div>
      )}
      {/* Floating Feedback Trigger */}
      <motion.button
        onClick={() => setIsFeedbackOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-8 right-8 z-[70] group"
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-uni-500 blur-xl opacity-20 group-hover:opacity-60 transition-opacity"></div>
          <motion.div 
            animate={{ width: isHovered ? '160px' : '48px' }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className={`relative flex items-center bg-bg-surface border border-uni-500/30 group-hover:border-uni-500 h-12 rounded-xl backdrop-blur-xl overflow-hidden ${isHovered ? 'px-4 justify-start' : 'justify-center'}`}
          >
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-uni-500 text-white flex items-center justify-center border border-white/5">
              <i className="fa-solid fa-comment-dots text-sm"></i>
            </div>
            <motion.span 
              initial={false}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.3 }}
              className={`text-[9px] font-black text-text-header uppercase tracking-widest whitespace-nowrap ml-3 ${!isHovered && 'hidden'}`}
            >
              Feedback
            </motion.span>
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
};

const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Grid Layer */}
    <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
    
    {/* Institutional Ambient Glows */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-uni-500/10 blur-[120px] rounded-full"></div>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-uni-500/15 blur-[120px] rounded-full"></div>

    {/* Dynamic Blobs */}
    <div className="absolute inset-0">
      <motion.div 
        animate={{ 
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-uni-500/10 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          x: [0, -120, 80, 0],
          y: [0, 120, -60, 0],
          scale: [1, 0.8, 1.1, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-default/10 rounded-full blur-[120px]"
      />
    </div>

    {/* Grain Overlay */}
    <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
  </div>
);

const SideNavLink = ({ to, icon, label, count }) => {
  const location = useLocation();
  // Exact match for base routes to prevent highlighting when at sub-routes
  const isActive = (to === '/admin' || to === '/super')
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  return (
    <Link 
      to={to} 
      className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest no-underline transition-all group ${
        isActive ? 'bg-uni-500/10 text-white border border-uni-500/50' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-uni-500 text-white' : 'bg-slate-900 border border-white/5 text-slate-600 group-hover:text-slate-400'}`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <span className="flex-grow">{label}</span>
      
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${isActive ? 'bg-white text-uni-600' : 'bg-uni-500/20 text-uni-400'}`}>
          {count}
        </span>
      )}

      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute -left-1 w-1 h-6 rounded-r-full bg-uni-400 border border-uni-400/50"
        />
      )}
    </Link>
  );
};

export default Layout;
