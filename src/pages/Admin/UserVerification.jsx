import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users from Supabase', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      fetchUsers(); 
    } catch (err) {
      console.error('Failed to update verification status in Supabase', err);
    }
  };
 Josephson

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Identity Validation Console</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
           Manually review student ID uploads to authorize system permissions. Validated students can officially claim found property.
        </p>
      </motion.header>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/5">
           <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Institutional Member Registry</h2>
           <span className="text-[9px] font-black text-slate-500 bg-slate-900 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
              {users.length} Active Records
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 md:px-8 py-5">Student Identity</th>
                <th className="px-4 md:px-8 py-5 hidden sm:table-cell text-center">ID Proof</th>
                <th className="px-4 md:px-8 py-5 text-right whitespace-nowrap">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.015] transition-colors group">
                  <td className="px-4 md:px-8 py-6">
                    <div className="font-black text-white text-[11px] uppercase tracking-widest group-hover:text-uni-400 transition-colors">
                      {user.full_name || 'N/A'}
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[150px]">{user.email}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-uni-500 uppercase">{user.role}</span>
                          <span className="w-0.5 h-0.5 bg-slate-800 rounded-full"></span>
                          <span className="text-[8px] font-black text-uni-400 uppercase">{user.student_id_number || 'PENDING'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 hidden sm:table-cell text-center">
                    {user.verification_proof_url ? (
                       <a 
                        href={user.verification_proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-uni-400 hover:text-white uppercase tracking-widest border border-uni-500/20 px-4 py-2 rounded-lg bg-uni-500/5 transition-all inline-block"
                       >
                         ID ↗
                       </a>
                    ) : (
                       <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">No ID docs</span>
                    )}
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-3">
                       <span className={`inline-flex items-center px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                         user.is_verified 
                           ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                           : 'bg-white/5 text-slate-600 border-white/10'
                       }`}>
                         {user.is_verified ? 'Verified' : 'Unverified'}
                       </span>
                       <button 
                         onClick={() => toggleVerification(user.id, user.is_verified)} 
                         className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                           user.is_verified 
                           ? 'text-red-500 hover:bg-red-500/10' 
                           : 'bg-uni-600 text-white hover:bg-uni-500'
                         }`}
                       >
                         {user.is_verified ? 'Revoke Access' : 'Validate ID'}
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserVerification;
