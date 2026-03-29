import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const ClaimStatus = () => {
  const { trackingId } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, [trackingId]);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          found_items (
            id,
            category,
            description,
            location_zone
          )
        `)
        .eq('tracking_id', trackingId)
        .single();
      
      if (error) throw error;
      
      // Flatten the data for easier consumption in the existing UI
      const formattedClaim = {
        ...data,
        found_item_category: data.found_items?.category,
        found_item_description: data.found_items?.description
      };
      
      setClaim(formattedClaim);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Invalid or expired tracking link.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <i className="fa-solid fa-link-slash text-4xl text-slate-700"></i>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">{error}</h2>
        <Link to="/" className="text-[10px] font-black text-uni-400 uppercase tracking-widest hover:text-white transition-colors">
            Return to Home
        </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Claim Status</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Tracking ID: <span className="text-slate-300 font-mono">{trackingId.slice(0, 8)}...</span>
        </p>
      </header>

      <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] bg-slate-900/40 border border-white/10 space-y-10">
        {/* Status Timeline */}
        <div className="flex flex-col gap-8 relative">
            {/* Connecting Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/5"></div>

            {/* Step 1: Submitted */}
            <div className="flex items-start gap-6 relative">
                <div className="w-8 h-8 bg-uni-500 rounded-full flex items-center justify-center shrink-0 border-4 border-slate-900 z-10">
                    <i className="fa-solid fa-check text-[10px] text-white"></i>
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Claim Submitted</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {new Date(claim.created_at).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Step 2: Review */}
            <div className="flex items-start gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-slate-900 z-10 transition-colors ${
                    claim.status === 'pending' 
                    ? 'bg-amber-500' 
                    : 'bg-uni-500'
                }`}>
                    {claim.status === 'pending' ? (
                        <i className="fa-solid fa-hourglass text-[10px] text-black"></i>
                    ) : (
                        <i className="fa-solid fa-check text-[10px] text-white"></i>
                    )}
                </div>
                <div className="space-y-1">
                    <h3 className={`text-sm font-black uppercase tracking-tight ${
                        claim.status === 'pending' ? 'text-amber-400' : 'text-white'
                    }`}>Staff Review</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {claim.status === 'pending' ? 'In Progress...' : 'Completed'}
                    </p>
                </div>
            </div>

            {/* Step 3: Decision */}
            <div className="flex items-start gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-slate-900 z-10 ${
                    claim.status === 'pending' ? 'bg-slate-800' :
                    claim.status === 'approved' ? 'bg-green-500' :
                    'bg-red-500'
                }`}>
                    {claim.status === 'approved' && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    {claim.status === 'rejected' && <i className="fa-solid fa-xmark text-[10px] text-white"></i>}
                </div>
                <div className="space-y-2">
                    <h3 className={`text-sm font-black uppercase tracking-tight ${
                         claim.status === 'pending' ? 'text-slate-600' :
                         claim.status === 'approved' ? 'text-green-400' :
                         'text-red-400'
                    }`}>
                        {claim.status === 'pending' ? 'Decision Pending' : 
                         claim.status === 'approved' ? 'Approved - Ready for Pickup' : 
                         'Claim Rejected'}
                    </h3>
                    
                    {claim.status === 'approved' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-[10px] font-bold text-green-300 leading-relaxed">
                                Please visit the Student Affairs Office (Room 101) with your student ID to collect your <strong>{claim.found_item_category}</strong>.
                            </p>
                        </div>
                    )}

                    {claim.status === 'rejected' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-[10px] font-bold text-red-300 leading-relaxed">
                                {claim.admin_notes || 'We could not verify your ownership at this time.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Claim Info */}
        <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block font-mono">Claimant</span>
                <p className="text-[11px] font-black text-white uppercase tracking-tight">{claim.guest_full_name || 'Verified Student'}</p>
                <p className="text-[9px] text-uni-400 font-bold uppercase">{claim.course_department || 'Student Profile'}</p>
            </div>
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block font-mono">Contact Via</span>
                <div className="flex items-center gap-2">
                    <i className={`fa-brands ${claim.contact_method === 'Facebook' ? 'fa-facebook' : 'fa-solid ' + (claim.contact_method === 'Phone' ? 'fa-phone' : 'fa-envelope')} text-slate-400 text-[10px]`}></i>
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{claim.contact_info || 'Account Details'}</p>
                </div>
            </div>
        </div>

        {/* Item Details (Context) */}
        <div className="pt-8 border-t border-white/5 space-y-4">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block font-mono">Claiming Item</span>
            <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl">
                <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center text-xl overflow-hidden border border-white/5">
                   {claim.found_item_description ? '📦' : '📷'}
                </div>
                <div>
                    <p className="text-white font-black uppercase text-sm tracking-tight">{claim.found_item_category}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 italic">
                        "{claim.proof_description}"
                    </p>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClaimStatus;
