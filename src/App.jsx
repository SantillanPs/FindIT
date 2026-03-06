import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { ProtectedRoute, GuestRoute } from './components/SafeRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import GuestReportItem from './pages/GuestReportItem';
import GuestReportFound from './pages/GuestReportFound';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import ReportFoundItem from './pages/Student/ReportFoundItem';
import ReportLostItem from './pages/Student/ReportLostItem';
import FoundPublicFeed from './pages/Student/FoundPublicFeed';
import MatchResults from './pages/Student/MatchResults';
import SubmitClaim from './pages/Student/SubmitClaim';
import ClaimStatus from './pages/Student/ClaimStatus';
import MyClaims from './pages/Student/MyClaims';
import LostReportStatus from './pages/Student/LostReportStatus';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

const AppContent = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Initializing FindIT</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
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
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/public-feed" element={<FoundPublicFeed />} />
            <Route path="/my-claims" element={<MyClaims />} />
          </Route>

          {/* Verified-Only Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} requireVerification={true} />}>
            <Route path="/report/found" element={<ReportFoundItem />} />
            <Route path="/lost/:reportId/matches" element={<MatchResults />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/lost" element={<AdminDashboard />} />
            <Route path="/admin/claims" element={<AdminDashboard />} />
            <Route path="/admin/witnesses" element={<AdminDashboard />} />
            <Route path="/admin/matches" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/released" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
