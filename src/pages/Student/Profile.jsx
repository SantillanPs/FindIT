import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';
import { 
  ArrowLeft,
  Smartphone,
  Mail,
  User,
  Hash,
  Building2,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Trophy,
  AlertCircle,
  Clock,
  Edit3,
  CheckCircle2,
  Lock,
  Camera,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const { colleges } = useMasterData();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    student_id_number: '',
    department: ''
  });

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetId = userId || currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles_v1')
          .select('*')
          .eq('id', targetId)
          .single();
          
        if (userError) throw userError;
        setProfileUser(userData);
        
        setEditForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          student_id_number: userData.student_id_number || '',
          department: userData.department || ''
        });

      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchProfile();
  }, [targetId]);

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
      setProfileUser(data);
      setIsEditing(false);
      refreshUser();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-12 relative z-10">
      {/* Header Section: Professional Split/Compact Layout */}
      <div className="px-6 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 border-b border-white/5 mb-8">
        
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center text-4xl font-bold text-white overflow-hidden border border-white/10 shadow-xl relative z-10 transition-transform active:scale-95">
            {profileUser.photo_url ? (
              <img src={profileUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold tracking-tight text-white/40">{profileUser.first_name?.charAt(0) || 'U'}</span>
            )}
          </div>
          {isOwnProfile && (
            <button className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-900 rounded-xl shadow-lg border border-white/50 z-20 hover:scale-110 active:scale-90 transition-transform">
              <Camera size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
            <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[11px] font-medium uppercase tracking-widest rounded-md border border-sky-500/20">
              {profileUser.role.replace('_', ' ')}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[11px] font-medium uppercase tracking-widest rounded-md border border-violet-500/20">
              {profileUser.department || 'General'}
            </span>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight uppercase leading-none">
              {profileUser.first_name} <br className="hidden md:block" /> {profileUser.last_name}
            </h2>
            
            {/* Status Badge: Top-Right (Rule #55) */}
            <div className="absolute -top-12 md:top-0 right-0 md:-right-4">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${profileUser.is_verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'} shadow-lg backdrop-blur-md`}>
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {profileUser.is_verified ? 'Verified' : 'Provisionary'}
                </span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="mt-6 flex justify-center md:justify-start gap-2">
              <button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saveLoading}
                className="h-10 px-6 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all hover:bg-slate-100"
              >
                {saveLoading ? <RefreshCw className="animate-spin" size={14} /> : isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="px-3 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs - Pro Max Pill Selector */}
      <div className="px-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 flex gap-1 relative overflow-hidden shadow-2xl">
          {['personal', 'registry', 'verification'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-medium uppercase tracking-widest transition-all relative z-10 ${
                activeTab === tab ? 'text-black font-bold' : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab === 'personal' ? 'Personal Info' : tab === 'registry' ? 'Standing' : 'Verification'}
              {activeTab === tab && (
                <motion.div 
                  layoutId="tabSelector" 
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 space-y-8">
          {activeTab === 'personal' && (
            <div key="personal" className="space-y-8">
              <div>
                <SectionTitle title="Identity Foundations" />
                <div className="mt-6 space-y-2">
                  <InfoRow icon={Mail} label="Official Email" value={profileUser.email} type="badge" accent="sky" />
                  <InfoRow 
                    icon={User} 
                    label="Legal Identity" 
                    value={`${profileUser.first_name || ''} ${profileUser.last_name || ''}`}
                    isEditing={isEditing}
                    editContent={
                      <div className="flex gap-2">
                        <input 
                          value={editForm.first_name} 
                          onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                          className="w-1/2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-white/30 transition-colors"
                          placeholder="First"
                        />
                        <input 
                          value={editForm.last_name} 
                          onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                          className="w-1/2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-white/30 transition-colors"
                          placeholder="Last"
                        />
                      </div>
                    }
                  />
                  <InfoRow 
                    icon={Hash} 
                    label="Institutional ID" 
                    value={profileUser.student_id_number || 'Not Provided'} 
                    type="badge"
                    accent="violet"
                    isEditing={isEditing}
                    editContent={
                      <input 
                        value={editForm.student_id_number} 
                        onChange={e => setEditForm({...editForm, student_id_number: e.target.value})}
                        className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-white/30 transition-colors"
                        placeholder="ID Number"
                      />
                    }
                  />
                  <InfoRow 
                    icon={Building2} 
                    label="Designated Dept" 
                    value={profileUser.department || 'General'} 
                    isEditing={isEditing}
                    editContent={
                      <select
                        value={editForm.department}
                        onChange={e => setEditForm({...editForm, department: e.target.value})}
                        className="w-full h-10 px-4 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:border-white/30 transition-colors"
                      >
                        <option value="">Select Dept</option>
                        {colleges.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    }
                  />
                </div>
              </div>

              <div>
                <SectionTitle title="Security Status" />
                <div className="mt-6">
                  <div className="p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 p-6 opacity-5 blur-xl group-hover:opacity-10 transition-opacity">
                      <ShieldCheck size={100} className={profileUser.is_verified ? 'text-emerald-400' : 'text-slate-400'} />
                    </div>
                    
                    <div className="relative z-10 flex items-start gap-5">
                      <div className={`mt-1 p-2.5 rounded-xl ${profileUser.is_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'} border border-white/10`}>
                        <ShieldCheck size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                          {profileUser.is_verified ? 'Authorized Member' : 'Guest Identity'}
                        </h4>
                        <p className="mt-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                          Status: <span className={profileUser.is_verified ? 'text-emerald-400' : 'text-sky-400'}>
                            {profileUser.verification_status?.replace('_', ' ') || 'Provisionary'}
                          </span>
                        </p>
                        <p className="mt-3 text-[11px] text-slate-400 font-medium max-w-sm leading-relaxed">
                          Your profile has been synchronized with the institutional core. Verified members enjoy priority handling for lost assets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registry' && (
            <div key="registry" className="space-y-8">
              <div>
                <SectionTitle title="Engagement Analytics" />
                <div className="mt-6 space-y-2">
                  <InfoRow icon={Trophy} label="Integrity Score" value={`${profileUser.integrity_points || 0} Units`} accent="emerald" />
                  <InfoRow icon={AlertCircle} label="Risk Index" value={`${profileUser.fraud_strikes || 0} Strikes`} accent="rose" />
                  <InfoRow 
                    icon={CheckCircle2} 
                    label="Honor Standing" 
                    value={profileUser.is_certificate_eligible ? 'QUALIFIED' : 'PENALIZED'} 
                    accent={profileUser.is_certificate_eligible ? 'emerald' : 'rose'}
                  />
                </div>
              </div>

              <div className="p-6 bg-sky-500/5 backdrop-blur-2xl rounded-3xl border border-sky-500/20 shadow-xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-500/30">
                    <Trophy size={18} className="text-sky-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">Institutional Registry Note</h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-left">
                  Your integrity metrics are recalculated every 168 hours based on verified returns and claim resolutions. 
                  Maintaining high standing grants access to the Community Honor Roll and premium claim features.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div key="verification" className="space-y-8">
              <div>
                <SectionTitle title="Credential Evidence" />
                <div className="mt-6 space-y-2">
                  <InfoRow icon={ShieldCheck} label="Account Clearance" value={profileUser.verification_status?.toUpperCase() || 'UNKNOWN'} accent="sky" />
                  <InfoRow icon={Clock} label="Last Modification" value={new Date(profileUser.updated_at).toLocaleDateString()} accent="violet" />
                </div>
              </div>

              <div className="space-y-6 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500 px-2">Document Proof Archetype</p>
                <div className="aspect-video bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden flex items-center justify-center relative group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60" />
                  {profileUser.verification_proof_url ? (
                    <img src={profileUser.verification_proof_url} alt="Proof" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="text-center p-8 relative z-20">
                      <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
                        <Smartphone size={32} className="text-slate-500 opacity-50" />
                      </div>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Digital duplicate unavailable</p>
                    </div>
                  )}
                </div>
                
                {isOwnProfile && (profileUser.verification_status === 'rejected' || !profileUser.verification_proof_url) && (
                  <div className="mt-8">
                    <ImageUpload 
                      label="Provision Digital Evidence"
                      onUploadSuccess={async (url) => {
                        const { error } = await supabase
                          .from('user_profiles_v1')
                          .update({ verification_proof_url: url, verification_status: 'pending' })
                          .eq('id', currentUser.id);
                        if (!error) refreshUser();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-4 px-2 mt-4">
    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{title}</h3>
    <div className="h-[1px] bg-white/5 w-full" />
  </div>
);

const InfoRow = ({ icon: Icon, label, value, type, isEditing, editContent, accent = 'sky' }) => {
  const accentColors = {
    sky: 'sky-500',
    violet: 'violet-500',
    emerald: 'emerald-500',
    rose: 'rose-500'
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 rounded-xl hover:bg-white/[0.02] transition-all group relative border border-transparent hover:border-white/5 gap-3 sm:gap-6">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-${accentColors[accent]}/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hidden sm:block`} />
      
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
          <Icon size={14} strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      
      <div className="w-full sm:flex-1 sm:max-w-[400px] flex justify-start sm:justify-end sm:pl-0 pl-12">
        {isEditing && editContent ? (
          <div className="w-full">{editContent}</div>
        ) : type === 'badge' ? (
          <span className={`px-3 py-1 bg-${accentColors[accent].split('-')[0]}-500/10 text-${accentColors[accent].split('-')[0]}-400 text-[9px] font-bold rounded-full border border-${accentColors[accent].split('-')[0]}-500/20 tracking-wider truncate`}>
            {value}
          </span>
        ) : (
          <span className="text-sm font-semibold text-white tracking-tight break-all">
            {value || <span className="text-slate-600 font-normal">Unspecified</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default Profile;
