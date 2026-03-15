import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [showFullName, setShowFullName] = useState(false);

  const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;
  const targetId = userId || currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get(`/auth/user/${targetId}/profile`);
        setProfileUser(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchProfile();
  }, [targetId]);

  useEffect(() => {
    if (profileUser) {
      setShowFullName(profileUser.show_full_name);
    }
  }, [profileUser]);

  const handleTogglePrivacy = async () => {
    setPrivacyLoading(true);
    try {
      const res = await apiClient.put('/auth/me/preference', { show_full_name: !showFullName });
      setShowFullName(res.data.show_full_name);
    } catch (err) {
      console.error('Failed to update privacy preference', err);
    } finally {
      setPrivacyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-xl font-black uppercase tracking-widest opacity-50">Profile not found</p>
      </div>
    );
  }

  const stats = [
    { label: 'Integrity Points', value: profileUser.integrity_points, icon: 'fa-shield-halved', color: 'uni' },
    { label: 'Fraud Strikes', value: profileUser.fraud_strikes, icon: 'fa-triangle-exclamation', color: 'rose' },
    { label: 'Items Found', value: profileUser.found_items.length, icon: 'fa-box-open', color: 'sky' },
    { label: 'Active Claims', value: profileUser.claims.length, icon: 'fa-hand-holding-heart', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[3rem] p-10 md:p-16 border border-white/5 relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-uni-500/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-slate-900 border-2 border-white/10 flex items-center justify-center text-6xl shadow-2xl relative">
                {profileUser.first_name?.charAt(0) || 'U'}
                {profileUser.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-uni-500 text-white text-xl w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-xl">
                    <i className="fa-solid fa-check-double"></i>
                  </div>
                )}
              </div>
            </div>

            {/* Identity Section */}
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {profileUser.first_name} {profileUser.last_name}
                </h1>
                <p className="text-[12px] md:text-[14px] font-black text-uni-400 uppercase tracking-[0.4em]">
                  {profileUser.department || 'Student Affiliate'}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                  <i className="fa-solid fa-id-badge text-slate-500"></i>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profileUser.student_id_number || 'Guest Account'}</span>
                </div>
                {profileUser.is_certificate_eligible && (
                    <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                        <i className="fa-solid fa-medal text-amber-500"></i>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Certificate Eligible</span>
                    </div>
                )}
                {isOwnProfile && (
                    <motion.button 
                      onClick={handleTogglePrivacy}
                      disabled={privacyLoading}
                      className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${
                        showFullName 
                        ? 'bg-uni-500/10 border-uni-500/30 text-uni-400' 
                        : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className={`fa-solid ${showFullName ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {showFullName ? 'Name Public' : 'Name Masked'}
                      </span>
                    </motion.button>
                )}
              </div>
            </div>

            {/* Quick Actions (Admin only) */}
            {currentUser?.role !== 'student' && !isOwnProfile && (
                <div className="md:ml-auto flex items-center gap-3">
                    <button className="bg-white text-black px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all shadow-xl shadow-black/20">
                        Issue Strike
                    </button>
                    <button className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                        Blacklist
                    </button>
                </div>
            )}
          </div>
        </motion.div>

        {/* Reputation Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 rounded-[2rem] border border-white/5 space-y-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500 border border-${s.color}-500/20`}>
                <i className={`fa-solid ${s.icon} text-lg`}></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-white italic tracking-tighter mt-1">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed History */}
        <div className="space-y-8">
            <div className="flex items-center gap-8 border-b border-white/5 pb-4">
                {['reports', 'claims'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[12px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative ${
                            activeTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-uni-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === 'reports' ? profileUser.found_items : profileUser.claims).length === 0 ? (
                    <div className="col-span-2 py-20 text-center glass-panel border border-white/5 rounded-[2.5rem]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No persistent record found</p>
                    </div>
                ) : (
                    (activeTab === 'reports' ? profileUser.found_items : profileUser.claims).map((item, id) => (
                        <motion.div 
                            key={id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-panel p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl">
                                    {item.found_item_category || item.category || '📦'}
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">
                                        {item.item_name || item.found_item_description || 'Surrendered Item'}
                                    </p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                                        {new Date(item.created_at || item.found_time).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                item.status === 'released' || item.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                item.status === 'reported' || item.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}>
                                {item.status.replace('_', ' ')}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
