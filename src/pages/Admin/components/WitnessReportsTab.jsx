import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, CheckCircle, XCircle, Clock, User, Mail, Camera, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const filters = [
  { id: 'pending', label: 'Pending Review', icon: Clock },
  { id: 'approved', label: 'Verified', icon: CheckCircle },
  { id: 'dismissed', label: 'Dismissed', icon: XCircle }
];

const WitnessReportsTab = ({ setPreviewImage, refreshTrigger }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  const { data: reports = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin_witness_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('internal')
        .from('witness_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData
  });

  const handleUpdateStatus = async (reportId, status) => {
    setActionLoading(reportId);
    try {
      const { error } = await supabase
        .schema('internal')
        .from('witness_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_witness_reports'] });
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(r => r.status === filter);

  if (isLoading && reports.length === 0) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Witness Reports</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Community reported sightings and item intelligence</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pb-4 md:pb-0 w-full md:w-auto mt-4 md:mt-0">
           <div className="flex flex-wrap items-center gap-2 pb-2">
              {filters.map(f => (
                <Button 
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  onClick={() => setFilter(f.id)}
                  className={`h-10 md:h-12 rounded-xl text-[10px] md:text-[11px] font-bold tracking-tight transition-all px-4 md:px-6 shrink-0 border-white/5 shadow-xl ${
                    filter === f.id 
                    ? "bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20" 
                    : `bg-slate-900/40 text-slate-400 hover:text-white backdrop-blur-3xl`
                  }`}
                >
                  <f.icon size={12} className="mr-2" />
                  <span className="whitespace-nowrap uppercase tracking-wider">{f.label}</span>
                </Button>
              ))}
           </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="py-32 text-center rounded-[2rem] border border-white/5 bg-slate-900/20 backdrop-blur-xl relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-slate-700">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1">No pending reports</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Everything is currently up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 relative z-10">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-slate-900/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] border border-white/5 p-6 md:p-8 space-y-6 relative overflow-hidden hover:bg-slate-900/60 transition-all duration-300"
            >
              {/* Report Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-uni-400 uppercase tracking-widest">Report Ref</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{report.id.toString().slice(-4)}</span>
                    {report.is_anonymous && (
                      <Badge className="bg-slate-950/60 border-white/10 text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 py-0.5">Anonymous</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                    Sighting for Lost Item #{report.lost_item_id.slice(0, 8)}
                  </h3>
                </div>
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Clock size={12} />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Witness Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Reporter</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400">
                      <User size={14} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 uppercase truncate">
                      {report.is_anonymous ? 'Private' : (report.guest_name || `ID: ${report.reporter_id?.slice(0, 8)}`)}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Contact Info</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-uni-500/10 flex items-center justify-center text-uni-400">
                      <Mail size={14} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 truncate">
                      {report.is_anonymous ? 'Concealed' : (report.guest_email || 'Verified Institutional')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statement */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Witness Statement</p>
                <p className="text-slate-300 text-xs font-medium leading-relaxed italic">
                  "{report.witness_description}"
                </p>
              </div>

              {/* Evidence Photo */}
              {report.witness_photo_url && (
                <div 
                  className="relative h-44 rounded-2xl overflow-hidden border border-white/5 cursor-zoom-in hover:border-uni-500/50 transition-all group/photo"
                  onClick={() => setPreviewImage(report.witness_photo_url)}
                >
                  <img src={report.witness_photo_url} className="w-full h-full object-cover opacity-60 group-hover/photo:opacity-100 transition-all duration-700" alt="Witness Evidence" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                       <Camera size={14} />
                       Evidence Photo
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {report.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'approved')}
                    disabled={actionLoading === report.id}
                    className="flex-grow h-14 rounded-xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 px-4"
                  >
                    {actionLoading === report.id ? <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <ShieldCheck size={16} />}
                    <span className="truncate">Verify & Award Points</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                    disabled={actionLoading === report.id}
                    className="sm:w-20 h-14 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 flex items-center justify-center transition-all px-6 py-3"
                  >
                    <XCircle size={18} className="mr-2 sm:mr-0" />
                    <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest">Dismiss</span>
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
