import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Components
import SystemOverview from './SystemOverview';
import StaffManagement from './StaffManagement';
import AuditLogs from './AuditLogs';
import FeedbackHub from './FeedbackHub';
import LandingTab from '../Admin/components/LandingTab';
import ZoneBuilderTab from '../Admin/components/ZoneBuilderTab';
import MemberRegistry from '../Admin/MemberRegistry';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Determine current tab from URL
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts.length > 2 ? pathParts[2] : 'overview';

  const handleTabChange = (tab) => {
    if (tab === 'overview') {
      navigate('/super');
    } else {
      navigate(`/super/${tab}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: 'fa-globe' },
    { id: 'landing', label: 'Landing Page', icon: 'fa-desktop' },
    { id: 'feedback', label: 'Feedback Hub', icon: 'fa-comments' },
    { id: 'staff', label: 'Staff Management', icon: 'fa-users-gear' },
    { id: 'audit', label: 'Audit Logs', icon: 'fa-shield-halved' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'overview' && <SystemOverview />}
            {currentTab === 'landing' && <LandingTab />}
            {currentTab === 'staff' && <StaffManagement />}
            {currentTab === 'audit' && <AuditLogs />}
            {currentTab === 'feedback' && <FeedbackHub />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
