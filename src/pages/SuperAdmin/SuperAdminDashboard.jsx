import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import SystemOverview from './SystemOverview';
import StaffManagement from './StaffManagement';
import AuditLogs from './AuditLogs';
import FeedbackHub from './FeedbackHub';
import ZoneBuilderTab from '../Admin/components/ZoneBuilderTab';

const SuperAdminDashboard = () => {
  const location = useLocation();
  
  // Determine current tab from URL
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts.length > 2 ? pathParts[2] : 'overview';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <div key={currentTab}>
            {currentTab === 'overview' && <SystemOverview />}
            {currentTab === 'staff' && <StaffManagement />}
            {currentTab === 'audit' && <AuditLogs />}
            {currentTab === 'feedback' && <FeedbackHub />}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
