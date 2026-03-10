import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, CheckCircle, XCircle, Clock, User, Mail, Camera } from 'lucide-react';
import apiClient from '../../../api/client';

const WitnessReportsTab = ({ setPreviewImage, refreshTrigger, setIsSyncing }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchWitnessReports(refreshTrigger > 0);
  }, [refreshTrigger]);

  const fetchWitnessReports = async (isSync = false) => {
    if (isSync) setIsSyncing(true);
    try {
      const response = await apiClient.get('/admin/witness-reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch witness reports', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleUpdateStatus = async (reportId, status) => {
    setActionLoading(reportId);
    try {
      await apiClient.put(`/admin/witness-reports/${reportId}/status`, { status });
      await fetchWitnessReports();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(r => r.status === filter);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 md:p-12 space-y-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Witness Intelligence</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Community reports on lost item sightings</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
          {['pending', 'approved', 'dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === status 
                  ? 'bg-uni-500 text-white shadow-lg shadow-uni-500/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="py-32 text-center glass-panel rounded-[3rem] border border-white/5 bg-white/[0.02]">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-slate-700">
            <Shield size={40} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No {filter} reports</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">System looks clear for now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 space-y-6 relative group overflow-hidden"
            >
              {/* Report Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Report ID</span>
                    <span className="text-[9px] font-black text-uni-400 uppercase tracking-widest">#{report.id.toString().padStart(4, '0')}</span>
                    {report.is_anonymous && (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">Anonymous</span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1">
                    Witness Report for Lost #{report.lost_item_id}
                  </h3>
                </div>
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
                  <Clock size={10} />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Witness Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Reporter</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400">
                      <User size={14} />
                    </div>
                    <p className="text-[10px] font-black text-white uppercase truncate">
                      {report.is_anonymous ? 'Concealed' : (report.guest_name || `Student ID: ${report.reporter_id}`)}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Contact</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400">
                      <Mail size={14} />
                    </div>
                    <p className="text-[10px] font-black text-white truncate">
                      {report.is_anonymous ? 'Concealed' : (report.guest_email || 'Linked Account')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statement */}
              <div className="p-6 rounded-3xl bg-black/40 border border-white/5 italic">
                <p className="text-slate-300 text-xs font-bold leading-relaxed uppercase tracking-wide">
                  "{report.witness_description}"
                </p>
              </div>

              {/* Evidence Photo */}
              {report.witness_photo_url && (
                <div 
                  className="relative h-48 rounded-3xl overflow-hidden border border-white/5 cursor-zoom-in group-hover:border-uni-500/50 transition-all shadow-2xl"
                  onClick={() => setPreviewImage(report.witness_photo_url)}
                >
                  <img src={report.witness_photo_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" alt="Witness Evidence" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                       <Camera size={14} />
                       View Snapshot
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {report.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'approved')}
                    disabled={actionLoading === report.id}
                    className="flex-grow py-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading === report.id ? <div className="w-3 h-3 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" /> : <CheckCircle size={14} />}
                    Approve & Award Points
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                    disabled={actionLoading === report.id}
                    className="w-20 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center transition-all"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WitnessReportsTab;
