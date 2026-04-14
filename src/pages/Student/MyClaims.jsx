import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ResolutionTimeline from './components/ResolutionTimeline';

// ─── Inline Sub-Components ───────────────────────────────────

const PROCESS_STEPS = [
  {
    icon: 'fa-robot',
    title: 'AI Cross-Reference',
    desc: 'Your proof is compared against the item\'s registered attributes.',
    time: 'Instant',
    color: 'uni',
  },
  {
    icon: 'fa-user-shield',
    title: 'Custodial Review',
    desc: 'A campus custodian manually verifies your ownership claim.',
    time: '1–3 business days',
    color: 'amber',
  },
  {
    icon: 'fa-bell',
    title: 'You Get Notified',
    desc: 'Email alert with result. If approved, you schedule a pickup.',
    time: 'Automatic',
    color: 'green',
  },
];

const StatusBadge = ({ status }) => {
  const config = {
    approved: { color: 'green', icon: 'fa-circle-check', label: 'Approved' },
    rejected: { color: 'red', icon: 'fa-circle-xmark', label: 'Rejected' },
    pending: { color: 'uni', icon: 'fa-clock', label: 'Under Review' },
  };
  const c = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
      ${c.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
      ${c.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
      ${c.color === 'uni' ? 'bg-uni-500/10 text-uni-400 border-uni-500/20' : ''}
    `}>
      <i className={`fa-solid ${c.icon} text-[8px]`}></i>
      {c.label}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────

const MyClaims = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [schedulingClaim, setSchedulingClaim] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  const [expandedClaim, setExpandedClaim] = useState(null);

  // Detect post-submission arrival (using initializer to avoid cascading setState)
  const [showSuccessBanner, setShowSuccessBanner] = useState(() => {
    const justSubmitted = sessionStorage.getItem('claim_just_submitted');
    if (justSubmitted === 'true') {
      sessionStorage.removeItem('claim_just_submitted');
      return true;
    }
    return false;
  });

  // 1. Data Fetching (TanStack Query + View) — compliant with Section 1 / 2.1
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['my-claims', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vmy_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Schedule Pickup Mutation — compliant with Section 2.2
  const scheduleMutation = useMutation({
    mutationFn: async ({ claimId, time }) => {
      const { error } = await supabase
        .from('claims')
        .update({
          scheduled_pickup_time: new Date(time).toISOString()
        })
        .eq('id', claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      setSchedulingClaim(null);
      setPickupTime('');
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (error) => {
      console.error('Failed to schedule pickup', error);
    }
  });

  const handleSchedulePickup = (e) => {
    e.preventDefault();
    if (!schedulingClaim || !pickupTime) return;
    scheduleMutation.mutate({ claimId: schedulingClaim.id, time: pickupTime });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Derived stats
  const stats = useMemo(() => ({
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  }), [claims]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { y: 8, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 120 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* ── Post-Submission Success Banner ── */}
      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="relative overflow-hidden bg-emerald-500/8 border border-emerald-500/15 p-5 md:p-6 rounded-2xl md:rounded-[2rem]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-11 h-11 bg-emerald-500/15 rounded-xl flex items-center justify-center text-lg border border-emerald-500/20 flex-shrink-0">
                <i className="fa-solid fa-check text-emerald-400"></i>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Claim Submitted Successfully
                </h3>
                <p className="text-[10px] font-bold text-emerald-300/70 leading-relaxed">
                  Your ownership proof is now in the verification queue. You'll receive an email
                  notification when a custodian reviews your claim. Average review time is <span className="text-white font-black">1–3 business days</span>.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.header className="space-y-4" variants={itemVariants}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              My Claims
            </h1>
            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
              Track every claim from submission to pickup. Each claim goes through AI + human verification.
            </p>
          </div>
          <div className="hidden md:flex h-12 w-12 rounded-2xl bg-uni-500/10 border border-uni-500/20 items-center justify-center text-xl text-uni-400">
            <i className="fa-solid fa-clipboard-check"></i>
          </div>
        </div>

        {/* Quick Stats (only show when there are claims) */}
        {claims.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Total', value: stats.total, color: 'text-white bg-white/5 border-white/5' },
              { label: 'Pending', value: stats.pending, color: 'text-uni-400 bg-uni-500/10 border-uni-500/15' },
              { label: 'Approved', value: stats.approved, color: 'text-green-400 bg-green-500/10 border-green-500/15' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-400 bg-red-500/10 border-red-500/15' },
            ].filter(s => s.value > 0).map(stat => (
              <div key={stat.label} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${stat.color}`}>
                <span className="opacity-60">{stat.label}</span>
                <span>{stat.value.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        )}
      </motion.header>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-36 bg-white/[0.02] rounded-2xl animate-pulse border border-white/[0.03]"></div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        /* ── Empty State: "What Happens Next" Explainer ── */
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Process Explainer */}
          {showSuccessBanner && (
            <div className="space-y-5">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-uni-500 animate-pulse"></span>
                What Happens Next
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROCESS_STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden group"
                  >
                    {/* Step Number */}
                    <div className="absolute top-3 right-3 text-[8px] font-black text-slate-700 uppercase tracking-widest">
                      Step {i + 1}
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border
                      ${step.color === 'uni' ? 'bg-uni-500/10 text-uni-400 border-uni-500/20' : ''}
                      ${step.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                      ${step.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
                    `}>
                      <i className={`fa-solid ${step.icon}`}></i>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black text-white uppercase tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className={`text-[8px] font-black uppercase tracking-widest
                      ${step.color === 'uni' ? 'text-uni-400' : ''}
                      ${step.color === 'amber' ? 'text-amber-400' : ''}
                      ${step.color === 'green' ? 'text-green-400' : ''}
                    `}>
                      <i className="fa-regular fa-clock mr-1 text-[7px]"></i>
                      {step.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Empty State */}
          {!showSuccessBanner && (
            <div className="text-center py-16 space-y-6">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-2xl mx-auto border border-white/5">
                <i className="fa-solid fa-inbox text-slate-600"></i>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  No Claims Yet
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  When you claim a found item, it will appear here so you can track its verification progress.
                </p>
              </div>
              <Link
                to="/public-feed"
                className="inline-flex items-center gap-2 px-6 py-3 bg-uni-500/10 border border-uni-500/20 rounded-xl text-[10px] font-black text-uni-400 uppercase tracking-widest hover:bg-uni-500/20 transition-all min-h-[44px]"
              >
                <i className="fa-solid fa-magnifying-glass text-[9px]"></i>
                Browse Found Items
              </Link>
            </div>
          )}
        </motion.div>
      ) : (
        /* ── Claims List ── */
        <AnimatePresence mode="popLayout">
          <div className="space-y-5">
            {claims.map((claim) => {
              const isExpanded = expandedClaim === claim.id;

              return (
                <motion.div
                  key={claim.id}
                  variants={itemVariants}
                  layout
                  className="bg-white/[0.02] rounded-2xl md:rounded-[2rem] border border-white/5 overflow-hidden group relative"
                >
                  {/* Status Accent Line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${
                    claim.status === 'approved' ? 'bg-green-500' :
                    claim.status === 'rejected' ? 'bg-red-500' :
                    'bg-uni-500'
                  }`}></div>

                  {/* ── Card Header (always visible) ── */}
                  <div
                    className="p-5 md:p-6 pl-6 md:pl-8 cursor-pointer"
                    onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Item Thumbnail */}
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-900 border border-white/5 overflow-hidden flex-shrink-0">
                        {claim.item_photo_url ? (
                          <img
                            src={claim.item_photo_url}
                            alt={claim.item_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-slate-700">
                            <i className="fa-solid fa-box"></i>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={claim.status} />
                          {claim.scheduled_pickup_time && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                              <i className="fa-solid fa-calendar-check text-green-400 text-[8px]"></i>
                              {new Date(claim.scheduled_pickup_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        <h2 className="text-sm md:text-base font-black text-white uppercase tracking-tight truncate">
                          {claim.item_title || 'Claimed Item'}
                        </h2>

                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {claim.item_category && (
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-tag text-[7px] text-slate-600"></i>
                              {claim.item_category}
                            </span>
                          )}
                          <span className="text-slate-700">•</span>
                          <span>{new Date(claim.created_at).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          {claim.tracking_id && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span className="text-uni-400">{claim.tracking_id}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand Chevron */}
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        <motion.i
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="fa-solid fa-chevron-down text-[10px] text-slate-600"
                        ></motion.i>
                      </div>
                    </div>

                    {/* Status-specific inline message */}
                    {claim.status === 'pending' && (
                      <div className="mt-4 flex items-center gap-2 pl-[72px] md:pl-[80px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-uni-500 animate-pulse"></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          In the custodial review queue — you'll be notified by email
                        </p>
                      </div>
                    )}
                    {claim.status === 'approved' && !claim.scheduled_pickup_time && (
                      <div className="mt-4 pl-[72px] md:pl-[80px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSchedulingClaim(claim);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-green-600 transition-all min-h-[36px]"
                        >
                          <i className="fa-solid fa-calendar-check text-[9px]"></i>
                          Schedule Pickup
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Expanded Details ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-6 pl-6 md:pl-8 space-y-6 border-t border-white/5 pt-5">
                          {/* Timeline */}
                          <ResolutionTimeline
                            status={claim.status}
                            isPickupReady={claim.is_pickup_ready}
                          />

                          {/* Proof + Notes Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Proof */}
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-quote-left text-[8px] text-slate-700"></i>
                                Your Proof
                              </p>
                              <div className="p-4 bg-slate-950/30 rounded-xl border border-white/5">
                                <p className="text-white font-bold italic text-xs leading-relaxed">
                                  "{claim.proof_description}"
                                </p>
                              </div>
                              {claim.proof_photo_url && (
                                <div className="w-full h-32 rounded-xl overflow-hidden border border-white/5 mt-2">
                                  <img src={claim.proof_photo_url} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>

                            {/* Admin Notes / Location */}
                            <div className="space-y-4">
                              {claim.admin_notes && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-comment-dots text-[9px]"></i>
                                    Custodian Notes
                                  </p>
                                  <div className="p-4 bg-uni-500/5 rounded-xl border border-uni-500/10">
                                    <p className="text-slate-300 text-[11px] leading-relaxed font-bold">
                                      {claim.admin_notes}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {claim.item_location && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-location-dot text-[8px] text-slate-700"></i>
                                    Item Location
                                  </p>
                                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <p className="text-white text-[11px] font-bold uppercase tracking-wider">
                                      {claim.item_location}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {!claim.admin_notes && !claim.item_location && (
                                <div className="flex items-center justify-center h-full min-h-[80px] border border-dashed border-white/5 rounded-xl">
                                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                    No additional details yet
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ── Pickup Scheduling Modal ── */}
      <AnimatePresence>
        {schedulingClaim && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !scheduleMutation.isPending && setSchedulingClaim(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] p-8 md:p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>

              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden"></div>

              <div className="text-center space-y-3 mb-8">
                <div className="h-14 w-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-green-400">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Schedule Pickup</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed max-w-[300px] mx-auto">
                  Let the Custodian know when you'll arrive to collect your item.
                </p>
              </div>

              <form onSubmit={handleSchedulePickup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Proposed Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={getMinDateTime()}
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-green-500/50 transition-colors min-h-[48px]"
                  />
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                    Must be at least 1 hour from now
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={scheduleMutation.isPending}
                    onClick={() => setSchedulingClaim(null)}
                    className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors rounded-xl bg-white/[0.03] min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleMutation.isPending}
                    className="flex-1 py-4 rounded-xl bg-green-500 text-[10px] font-black text-white hover:bg-green-600 transition-all uppercase tracking-widest min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {scheduleMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Confirm Schedule'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyClaims;
