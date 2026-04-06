import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MasterDataProvider } from './context/MasterDataContext';
import Layout from './components/Layout';
import { ProtectedRoute, GuestRoute } from './components/SafeRoute';
import { useState, useEffect } from 'react';

// Lazy Loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const GuestReportItem = lazy(() => import('./pages/GuestReportItem'));
const GuestReportFound = lazy(() => import('./pages/GuestReportFound'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/Student/StudentDashboard'));
const ReportFoundItem = lazy(() => import('./pages/Student/ReportFoundItem'));
const ReportLostItem = lazy(() => import('./pages/Student/ReportLostItem'));
const FoundPublicFeed = lazy(() => import('./pages/Student/FoundPublicFeed'));
const MatchResults = lazy(() => import('./pages/Student/MatchResults'));
const SubmitClaim = lazy(() => import('./pages/Student/SubmitClaim'));
const ClaimStatus = lazy(() => import('./pages/Student/ClaimStatus'));
const MyClaims = lazy(() => import('./pages/Student/MyClaims'));
const LostReportStatus = lazy(() => import('./pages/Student/LostReportStatus'));
const Profile = lazy(() => import('./pages/Student/Profile'));
const AssetVault = lazy(() => import('./pages/Student/AssetVault'));
const LostReportsRegistry = lazy(() => import('./pages/Student/LostReportsRegistry'));
const HallOfIntegrity = lazy(() => import('./pages/Student/HallOfIntegrity'));
const MatchReviewPage = lazy(() => import('./pages/Student/MatchReviewPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'));

// Initial Loading Fallback
const PageLoader = () => (
    <div className="h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Archiving Interface State...</p>
        </div>
    </div>
);

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [showRescueLink, setShowRescueLink] = useState(false);

  useEffect(() => {
    let timeout;
    if (loading) {
      timeout = setTimeout(() => setShowRescueLink(true), 3000);
    } else {
      setShowRescueLink(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleRescue = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };
  
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Initializing FindIT</p>
           
           {showRescueLink && (
             <button 
               onClick={handleRescue}
               className="mt-6 text-[9px] font-bold text-sky-500/40 hover:text-sky-500 uppercase tracking-widest transition-all animate-in fade-in slide-in-from-bottom-2 duration-700"
             >
               Stuck? Clear Session & Retry
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/report-lost-guest" element={<GuestReportItem />} />
          <Route path="/report-found-guest" element={<GuestReportFound />} />
          <Route path="/submit-claim/:itemId" element={<SubmitClaim />} />
          <Route path="/claim-status/:trackingId" element={<ClaimStatus />} />
          <Route path="/report/lost" element={<ReportLostItem />} />
          <Route path="/lost-report-status/:trackingId" element={<LostReportStatus />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/public-feed" element={<FoundPublicFeed />} />
              <Route path="/lost-reports" element={<LostReportsRegistry />} />
              <Route path="/hall-of-integrity" element={<HallOfIntegrity />} />
              <Route path="/my-claims" element={<MyClaims />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/asset-vault" element={<AssetVault />} />
              <Route path="/report/found" element={<ReportFoundItem />} />
              <Route path="/match-review/:lostId/:foundId" element={<MatchReviewPage />} />
            </Route>

            {/* Verified-Only Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} requireVerification={true} />}>
              <Route path="/lost/:reportId/matches" element={<MatchResults />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/lost" element={<AdminDashboard />} />
              <Route path="/admin/claims" element={<AdminDashboard />} />
              <Route path="/admin/witnesses" element={<AdminDashboard />} />
              <Route path="/admin/matches" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminDashboard />} />
              <Route path="/admin/released" element={<AdminDashboard />} />
              <Route path="/admin/profile/:userId" element={<Profile />} />
            </Route>

            {/* Super Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/super" element={<SuperAdminDashboard />} />
              <Route path="/super/staff" element={<SuperAdminDashboard />} />
              <Route path="/super/audit" element={<SuperAdminDashboard />} />
              <Route path="/super/feedback" element={<SuperAdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Layout>
  );
};


function App() {
  const isMobile = window.innerWidth < 1024;

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <MasterDataProvider>
            <MotionConfig transition={{ duration: 0 }} reducedMotion="always">
              <AppContent />
            </MotionConfig>
          </MasterDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
