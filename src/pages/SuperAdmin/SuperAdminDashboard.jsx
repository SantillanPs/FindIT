import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Components
import SystemOverview from './SystemOverview';
import StaffManagement from './StaffManagement';
import AuditLogs from './AuditLogs';
import FeedbackHub from './FeedbackHub';
import ZoneBuilderTab from '../Admin/components/ZoneBuilderTab';
import TaxonomyTab from '../Admin/components/TaxonomyTab';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Determine current tab from URL
  const pathParts = location.pathname.split('/');
  const currentTab = pathParts.length > 2 ? pathParts[2] : 'overview';

  const taxonomyMutation = useMutation({
    mutationFn: async ({ action, data }) => {
      if (action === 'add_type') {
        const { error } = await supabase.from('master_types').insert([data]);
        if (error) throw error;
      } else if (action === 'delete_type') {
        const { error } = await supabase.from('master_types').delete().eq('id', data.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['master_types'] })
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <div key={currentTab}>
            {currentTab === 'overview' && <SystemOverview />}
            {currentTab === 'staff' && <StaffManagement />}
            {currentTab === 'audit' && <AuditLogs />}
            {currentTab === 'feedback' && <FeedbackHub />}
            {currentTab === 'taxonomy' && (
              <div className="p-8 md:p-12 pb-32">
                <TaxonomyTab mutation={taxonomyMutation} />
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
