import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '../../hooks/useUserProfile';
import { imageCache } from '../../lib/imageCache';
import { 
  Smartphone,
  Mail,
  User,
  Hash,
  Building2,
  ShieldCheck,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Camera,
  Save,
  X,
  RefreshCw,
  Clock,
  Edit3,
  Loader2
} from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { useProfileUpload } from '../../hooks/useProfileUpload';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { colleges } = useMasterData();
  const queryClient = useQueryClient();
  
  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetId = userId || currentUser?.id;

  const { data: profileUser, isLoading: loading, error: profileError } = useUserProfile(targetId);
  
  const [avatarError, setAvatarError] = useState(false);
  const [proofError, setProofError] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);  
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { uploadAvatar, uploading: avatarUploading } = useProfileUpload();
  const avatarInputRef = React.useRef(null);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    student_id_number: '',
    department: ''
  });


  useEffect(() => {
    if (profileUser) {
      setEditForm({
        first_name: profileUser.first_name || '',
        last_name: profileUser.last_name || '',
        student_id_number: profileUser.student_id_number || '',
        department: profileUser.department || ''
      });
      
      // Initialize error states based on cache
      if (profileUser.photo_url) setAvatarError(imageCache.isFailed(profileUser.photo_url));
      if (profileUser.verification_proof_url) setProofError(imageCache.isFailed(profileUser.verification_proof_url));
    }
  }, [profileUser]);

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles_v1')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          student_id_number: editForm.student_id_number,
          department: editForm.department
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      // Standard: Invalidate queries after mutation
      await queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
      
      setIsEditing(false);
      refreshUser();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadAvatar(file);
    if (url) {
      // Standard: Invalidate queries after mutation
      await queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto pb-32 relative z-10 w-full">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-10 pb-8 px-6 text-center">
        <div className="relative group mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-2 border-white/10 shadow-2xl relative z-10">
            {profileUser.photo_url && !avatarError ? (
              <img 
                src={profileUser.photo_url} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                onError={() => {
                  imageCache.markFailed(profileUser.photo_url);
                  setAvatarError(true);
                }}
              />
            ) : (
              <span className="font-bold tracking-tight text-white/30 uppercase">
                {profileUser.first_name?.charAt(0) || 'U'}
              </span>
            )}
            
            {avatarUploading && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                <Loader2 size={24} className="text-uni-400 animate-spin" />
              </div>
            )}
          </div>
          
          {isOwnProfile && (
            <>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarSelect}
                disabled={avatarUploading}
              />
              <button 
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                title="Change Profile Picture"
                className="absolute -bottom-1 -right-1 p-2.5 bg-slate-800 text-white rounded-full shadow-lg border border-white/10 z-20 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                <Camera size={14} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-2">
          {profileUser.first_name || 'Anonymous'} {profileUser.last_name || 'User'}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          {profileUser.department || 'General'} • <span className="capitalize">{profileUser.role.replace('_', ' ')}</span>
        </p>

        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${profileUser.is_verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} shadow-sm`}>
          <ShieldCheck size={14} strokeWidth={2.5} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            {profileUser.is_verified ? 'Verified Member' : 'Provisionary'}
          </span>
        </div>
      </div>

      {/* Main Content (Apple Settings Style) */}
      <div className="px-5 sm:px-6 space-y-8">
        
        {/* Group 1: Personal Details */}
        <SettingsGroup title="Personal Details">
          <SettingsRow 
            icon={Mail} 
            label="Email Address" 
            value={profileUser.email} 
            accent="slate" 
          />
          <SettingsRow 
            icon={User} 
            label="First Name" 
            value={profileUser.first_name} 
            accent="sky"
            isEditing={isEditing}
            editContent={
              <input 
                value={editForm.first_name} 
                onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                className="w-full h-11 px-4 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-uni-500 focus:outline-none transition-colors"
                placeholder="First Name"
              />
            }
          />
          <SettingsRow 
            icon={User} 
            label="Last Name" 
            value={profileUser.last_name} 
            accent="sky"
            isEditing={isEditing}
            editContent={
              <input 
                value={editForm.last_name} 
                onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                className="w-full h-11 px-4 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-uni-500 focus:outline-none transition-colors"
                placeholder="Last Name"
              />
            }
          />
          <SettingsRow 
            icon={Hash} 
            label="ID Number" 
            value={profileUser.student_id_number} 
            accent="violet"
            isEditing={isEditing}
            editContent={
              <input 
                value={editForm.student_id_number} 
                onChange={e => setEditForm({...editForm, student_id_number: e.target.value})}
                className="w-full h-11 px-4 bg-slate-950/50 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-uni-500 focus:outline-none transition-colors"
                placeholder="Student/Staff ID"
              />
            }
          />
          <SettingsRow 
            icon={Building2} 
            label="Department" 
            value={profileUser.department} 
            accent="rose"
            isEditing={isEditing}
            editContent={
              <select
                value={editForm.department}
                onChange={e => setEditForm({...editForm, department: e.target.value})}
                className="w-full h-11 px-4 bg-slate-950 border border-white/10 rounded-xl text-sm font-medium text-white focus:border-uni-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select Department</option>
                {colleges.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
            }
          />
        </SettingsGroup>

        {/* Group 2: Platform Standing */}
        <SettingsGroup title="Platform Standing">
          <SettingsRow 
            icon={Trophy} 
            label="Integrity Score" 
            value={`${profileUser.integrity_points || 0} Points`} 
            accent="emerald" 
          />
          <SettingsRow 
            icon={AlertCircle} 
            label="Account Strikes" 
            value={`${profileUser.fraud_strikes || 0} Infractions`} 
            accent="rose" 
            valueColor={profileUser.fraud_strikes > 0 ? 'text-rose-400' : 'text-slate-300'}
          />
          <SettingsRow 
            icon={CheckCircle2} 
            label="Honor Standing" 
            value={profileUser.is_certificate_eligible ? 'Excellent' : 'Needs Review'} 
            accent={profileUser.is_certificate_eligible ? 'emerald' : 'amber'}
            valueColor={profileUser.is_certificate_eligible ? 'text-emerald-400 font-bold' : 'text-amber-400'}
          />
        </SettingsGroup>

        {/* Group 3: Verification Details */}
        <SettingsGroup title="Verification Credentials">
          <SettingsRow 
            icon={ShieldCheck} 
            label="Clearance Status" 
            value={profileUser.verification_status?.toUpperCase() || 'UNKNOWN'} 
            accent="sky" 
          />
          <SettingsRow 
            icon={Clock} 
            label="Last Updated" 
            value={new Date(profileUser.updated_at).toLocaleDateString()} 
            accent="slate" 
          />
          
          {isOwnProfile && (
            <div className="p-5 sm:p-6 bg-transparent border-t border-white/10">
              {(profileUser.verification_status === 'rejected' || !profileUser.verification_proof_url) ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-rose-400 mb-1 flex items-center gap-1.5"><AlertCircle size={14} /> Action Required</p>
                    <p className="text-xs text-rose-300 font-medium">{profileUser.verification_status === 'rejected' ? 'Your verification was denied.' : 'Please upload a valid institutional ID to get verified.'}</p>
                  </div>
                  <button onClick={() => setIsVerificationModalOpen(true)} className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs tracking-wide rounded-xl transition-all whitespace-nowrap shadow-lg shadow-rose-500/20 active:scale-95">
                    Resolve Issue
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                  <div className="mt-0.5 p-1.5 bg-sky-500/10 rounded-lg">
                     <ShieldCheck size={16} className="text-sky-400" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-white tracking-wide">Document Secured</p>
                     <p className="text-[11px] text-slate-400 mt-0.5">Your identity proof is stored securely and is not publicly visible.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SettingsGroup>
        
      </div>

      {/* Sticky Bottom Thumb-Zone CTAs */}
      {isOwnProfile && (
        <AnimatePresence>
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 px-6 sm:px-0 sm:max-w-md sm:mx-auto flex justify-center pointer-events-none"
          >
            <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-2 rounded-3xl shadow-2xl flex gap-2 w-full pointer-events-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full h-12 sm:h-14 bg-white text-slate-950 rounded-2xl text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form
                      setEditForm({
                        first_name: profileUser.first_name || '',
                        last_name: profileUser.last_name || '',
                        student_id_number: profileUser.student_id_number || '',
                        department: profileUser.department || ''
                      });
                    }}
                    className="w-12 sm:w-14 h-12 sm:h-14 bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shrink-0"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    className="flex-1 h-12 sm:h-14 bg-uni-500 text-white rounded-2xl text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-uni-600 active:scale-95 transition-all shadow-lg shadow-uni-500/25 disabled:opacity-50"
                  >
                    {saveLoading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Verification Resolution Modal */}
      <AnimatePresence>
        {isVerificationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsVerificationModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-uni-400" size={18} /> Verification Center
                </h3>
                <button onClick={() => setIsVerificationModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>
              
              <div className="p-6">
                {profileUser.verification_status === 'rejected' && profileUser.verification_feedback && (
                  <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2 flex items-center gap-1.5"><AlertCircle size={14} /> Admin Feedback</p>
                    <p className="text-[13px] text-rose-200 leading-relaxed italic font-medium">"{profileUser.verification_feedback}"</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Upload New ID Proof</p>
                  <ImageUpload 
                    label="Select Official ID"
                    onUploadSuccess={async (url) => {
                      const { error } = await supabase
                        .from('user_profiles_v1')
                        .update({ verification_proof_url: url, verification_status: 'pending' })
                        .eq('id', currentUser.id);
                      if (!error) {
                         await queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
                         refreshUser();
                         setIsVerificationModalOpen(false);
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-500 text-center mt-2 px-4 leading-relaxed">Ensure all details are clearly visible. Blurry or cropped images will be rejected.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Reusable Settings Components ---

const SettingsGroup = ({ title, children }) => (
  <div className="space-y-3 mb-8">
    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1.5">{title}</h3>
    <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 shadow-xl">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon: Icon, label, value, isEditing, editContent, accent = 'slate', valueColor = 'text-slate-300' }) => {
  const accentColors = {
    sky: 'text-sky-400 bg-sky-400/10',
    violet: 'text-violet-400 bg-violet-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    rose: 'text-rose-400 bg-rose-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    slate: 'text-slate-400 bg-white/5'
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 min-h-[4.5rem] gap-3 sm:gap-6 bg-transparent transition-colors hover:bg-white/[0.01]">
      <div className="flex items-center gap-4 shrink-0">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${accentColors[accent]}`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <span className="text-[13px] sm:text-sm font-semibold tracking-wide text-slate-200">{label}</span>
      </div>
      
      <div className="w-full sm:flex-1 flex sm:justify-end justify-start sm:pl-0 pl-[52px]">
        {isEditing && editContent ? (
          <div className="w-full max-w-sm">{editContent}</div>
        ) : (
          <span className={`text-[13px] sm:text-sm font-medium tracking-wide ${valueColor} text-left sm:text-right w-full sm:w-auto break-all`}>
            {value || <span className="text-slate-600 italic">Not provided</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default Profile;
