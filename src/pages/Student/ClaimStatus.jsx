import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import ResolutionTimeline from './components/ResolutionTimeline';

const ClaimStatus = () => {
    const { trackingId } = useParams();
    const [copied, setCopied] = useState(false);

    // 1. Data Fetching (TanStack Query) — compliant with Section 2.1
    const { data: claim, isLoading, error: queryError } = useQuery({
        queryKey: ['claim-status', trackingId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('claims')
                .select(`
                    *,
                    found_items (
                        title,
                        category,
                        photo_url,
                        location
                    )
                `)
                .eq('tracking_id', trackingId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!trackingId,
        retry: 1,
    });

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verifying Link Protocol...</p>
            </div>
        );
    }

    if (queryError || !claim) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 text-2xl border border-red-500/20">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-white uppercase italic">Access Denied</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-xs">
                        Tracking ID not found or may have expired. Please verify your claim URL.
                    </p>
                </div>
                <Link to="/" className="text-uni-400 text-[10px] font-black uppercase tracking-widest hover:underline">
                    Return to Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
            {/* Header / Tracking Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-uni-500/5 blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-magnifying-glass-location text-uni-400 text-sm"></i>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Live Claim Tracker</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                            {claim.found_items?.title || 'Claim Status'}
                        </h1>
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                               ID: {trackingId}
                           </div>
                           <span className="text-slate-500 text-[10px] sm:text-xs">|</span>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                               Started {new Date(claim.created_at).toLocaleDateString()}
                           </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex gap-3">
                        <button 
                            onClick={handleCopyLink}
                            className="bg-white text-black px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-black/40 min-h-[48px]"
                        >
                            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-link'}`}></i>
                            {copied ? 'Link Copied' : 'Share Link'}
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ── Status Timeline ── */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Verification Audit</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-uni-400 animate-pulse"></div>
                                <span className="text-[8px] font-black text-uni-400 uppercase tracking-widest italic">Live Status</span>
                            </div>
                        </div>
                        
                        <ResolutionTimeline 
                          status={claim.status} 
                          isPickupReady={claim.is_pickup_ready}
                          scheduledPickupTime={claim.scheduled_pickup_time}
                        />
                    </div>

                    {/* Admin Message */}
                    {claim.admin_notes && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 bg-uni-500/5 border border-uni-500/10 rounded-[2rem] space-y-3"
                        >
                            <div className="flex items-center gap-2 text-uni-400">
                                <i className="fa-solid fa-comment-dots text-sm"></i>
                                <span className="text-[9px] font-black uppercase tracking-widest">Message from Custodian</span>
                            </div>
                            <p className="text-white text-sm font-bold leading-relaxed italic uppercase tracking-tight">
                                "{claim.admin_notes}"
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* ── Item Info Sidebar ── */}
                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-6 overflow-hidden relative">
                        {claim.found_items?.photo_url ? (
                            <img 
                                src={claim.found_items.photo_url} 
                                className="w-full aspect-square object-cover rounded-2xl opacity-70 mb-4" 
                                alt="Item" 
                            />
                        ) : (
                            <div className="w-full aspect-square bg-white/5 flex items-center justify-center text-4xl mb-4 rounded-2xl">
                                📦
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Item Category</p>
                                <p className="text-xs font-black text-white uppercase italic">{claim.found_items?.category || 'General'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Last Seen At</p>
                                <p className="text-xs font-black text-white uppercase italic">{claim.found_items?.location || 'Campus'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sign Up Upsell */}
                    <div className="bg-gradient-to-br from-uni-500/20 to-transparent border border-uni-500/30 rounded-[2rem] p-8 space-y-5">
                        <div className="w-10 h-10 bg-uni-500/20 rounded-xl flex items-center justify-center text-uni-400 mb-2">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic">Lost another item?</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                            Register now to sync your claims and post "Lost" alerts to the student dashboard.
                        </p>
                        <Link 
                            to="/register" 
                            className="block w-full text-center py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all min-h-[44px] flex items-center justify-center"
                        >
                            Join Registry →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimStatus;
