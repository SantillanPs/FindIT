import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Components
import SystemOverview from './SystemOverview';
import StaffManagement from './StaffManagement';
import AuditLogs from './AuditLogs';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
            {currentTab === 'staff' && <StaffManagement />}
            {currentTab === 'audit' && <AuditLogs />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
