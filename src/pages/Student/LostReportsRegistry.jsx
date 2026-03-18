import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import LostReportCard from '../../components/LostReportCard';
import WitnessReportModal from '../../components/WitnessReportModal';
import EmptyState from '../../components/EmptyState';
import { useMasterData } from '../../context/MasterDataContext';

const LostReportsRegistry = () => {
  const { categories: CATEGORIES } = useMasterData();
  const [lostReports, setLostReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [visibleItems, setVisibleItems] = useState(6);

  useEffect(() => {
    fetchLostReports();
  }, []);

  const fetchLostReports = async () => {
    try {
      const resp = await apiClient.get('/lost/public');
      setLostReports(resp.data);
    } catch (err) {
      console.error("Failed to fetch lost reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWitness = (report) => {
    setSelectedLostReport(report);
    setShowWitnessModal(true);
  };

  const filteredReports = lostReports
    .filter(report => {
      const matchesSearch = (report.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            report.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.location_zone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.last_seen_time) - new Date(a.last_seen_time));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">
          Lost Reports <span className="gradient-text not-italic">Registry</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          Help our community find their missing belongings. Scan the active reports and provide witness testimony if you've seen any of these items.
        </p>
      </header>

      {/* Filters */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
                type="text"
                placeholder="Search description, owner, location..."
                className="input-field pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <select 
            className="input-field md:w-64 font-black uppercase text-[10px] tracking-widest px-4"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
        >
            <option value="all">Every Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[2.5rem]"></div>
            ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState 
          title="No Active Reports"
          message="We couldn't find any lost reports matching your filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.slice(0, visibleItems).map(report => (
              <LostReportCard 
                key={report.id}
                report={report}
                onWitness={handleWitness}
              />
            ))}
          </div>

          {filteredReports.length > visibleItems && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setVisibleItems(prev => prev + 6)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 flex items-center gap-3 group"
              >
                Load More Reports
                <i className="fa-solid fa-chevron-down opacity-50 group-hover:translate-y-1 transition-transform"></i>
              </button>
            </div>
          )}
        </>
      )}

      {showWitnessModal && (
        <WitnessReportModal 
          isOpen={showWitnessModal}
          onClose={() => setShowWitnessModal(false)}
          lostItem={selectedLostReport}
        />
      )}
    </motion.div>
  );
};

export default LostReportsRegistry;
