import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proof, setProof] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState(''); // Added missing state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('Email'); // Email, Facebook, Phone
  const [contactInfo, setContactInfo] = useState('');
  const [courseDepartment, setCourseDepartment] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await apiClient.get('/found/public');
      const foundItem = response.data.find(i => i.id === parseInt(itemId));
      if (foundItem) {
        setItem(foundItem);
      } else {
        setError('Registry entry not found or no longer available.');
      }
    } catch (err) {
      setError('System error retrieving item context.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        found_item_id: parseInt(itemId),
        proof_description: proof,
        proof_photo_url: proofPhotoUrl
      };

      if (!user) {
        payload.guest_full_name = guestName;
        payload.guest_email = guestEmail || null;
        payload.contact_method = contactMethod;
        payload.contact_info = contactInfo;
        payload.course_department = courseDepartment;
      }

      const response = await apiClient.post('/claims/submit', payload);
      
      if (!user && response.data.tracking_id) {
        setTrackingId(response.data.tracking_id);
      } else {
        navigate('/my-claims');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failure. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (trackingId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto glass-panel p-12 md:p-20 text-center space-y-10 rounded-[2.5rem] border-uni-500/20 shadow-2xl shadow-uni-500/10"
      >
        <div className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-uni-500/20">
            <i className="fa-solid fa-check text-4xl text-uni-400"></i>
        </div>
        <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Claim Submitted Successfully</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-sm mx-auto">
                {guestEmail 
                  ? <>We've sent a tracking link to <span className="text-white">{guestEmail}</span>.</>
                  : <>We will notify you via <span className="text-white">{contactMethod}</span> once your claim is reviewed.</>
                } Please save the link below to check your status manually.
            </p>
        </div>

        <div className="p-6 bg-slate-950 rounded-2xl border border-white/10 space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Your Magic Tracking Link</span>
            <p className="text-uni-400 font-black tracking-widest text-[11px] break-all select-all">
                {window.location.origin}/claim-status/{trackingId}
            </p>
        </div>

        <div className="pt-6">
            <Link to="/" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all">
                Return to Registry
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto space-y-10"
    >
      <motion.header className="space-y-4 text-left" variants={itemVariants}>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Submit Claim</h1>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
          Provide identification and proof of ownership to recover your item.
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {error && !item ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-red-500/5 border border-red-500/20 text-red-500 text-center font-black uppercase tracking-widest text-[11px] rounded-[2rem]"
          >
            {error}
          </motion.div>
        ) : (
          <motion.div className="space-y-10" variants={containerVariants}>
            {/* Item Preview - Clean Logic */}
            <motion.div 
              variants={itemVariants}
              className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col sm:flex-row gap-8 items-center text-left"
            >
               <div className="w-24 h-24 bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                  {item.safe_photo_url ? (
                    <img src={item.safe_photo_url} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <span className="text-4xl opacity-20">📦</span>
                  )}
               </div>
               <div className="text-center sm:text-left space-y-1">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.item_name}</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   Found near {item.location_zone} • {new Date(item.found_time).toLocaleDateString()}
                 </p>
               </div>
            </motion.div>

            {/* Claim Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              variants={itemVariants}
              className="p-8 md:p-12 space-y-10 rounded-[2.5rem] bg-slate-900/40 border border-white/10 text-left backdrop-blur-sm"
            >
              {/* Guest Identity & Identification Section */}
              {!user && (
                <div className="space-y-10 group">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="Your real name"
                                className="input-field py-4 text-[11px] font-bold tracking-widest"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">College Course / Department</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. BSIT - College of Engineering"
                                className="input-field py-4 text-[11px] font-bold tracking-widest uppercase"
                                value={courseDepartment}
                                onChange={(e) => setCourseDepartment(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Preferred Contact Method</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                              { id: 'Email', icon: 'fa-envelope', label: 'Email' },
                              { id: 'Facebook', icon: 'fa-facebook', label: 'Facebook' },
                              { id: 'Phone', icon: 'fa-phone', label: 'Phone' }
                            ].map(method => (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setContactMethod(method.id)}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                                  contactMethod === method.id 
                                    ? 'bg-uni-500 border-uni-500 text-white shadow-lg' 
                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                                }`}
                              >
                                <i className={`fa-brands ${method.icon.startsWith('fa-f') ? 'fa-facebook' : 'fa-solid ' + method.icon} text-lg`}></i>
                                <span className="text-[9px] font-black uppercase tracking-tighter">{method.label}</span>
                              </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {contactMethod} Details <span className="text-uni-400">*</span>
                                </label>
                                <input 
                                    type={contactMethod === 'Email' ? 'email' : 'text'}
                                    required
                                    placeholder={
                                        contactMethod === 'Facebook' ? 'FB Link or Handle' :
                                        contactMethod === 'Phone' ? 'Contact Number' : 'Personal or School Email'
                                    }
                                    className="input-field py-4 text-[11px] font-bold tracking-widest"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Secondary Email (Optional)
                                </label>
                                <input 
                                    type="email"
                                    placeholder="Alternative contact email"
                                    className="input-field py-4 text-[11px] font-bold tracking-widest opacity-60 focus:opacity-100 transition-opacity"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic pt-2">
                             * This is how we will notify you once your claim is reviewed.
                        </p>
                    </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  How do you know this is yours?
                </label>
                <textarea 
                  rows="4"
                  placeholder="Describe unique details (e.g., lock screen photo, internal contents, stickers, serial numbers)..."
                  className="input-field min-h-[140px] text-[11px] font-bold tracking-widest pt-4 resize-none"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Supporting Photo (Receipt/Old item photo)
                </label>
                <ImageUpload 
                  value={proofPhotoUrl}
                  onUploadSuccess={(url) => setProofPhotoUrl(url)}
                />
              </div>

              {error && (
                <p className="text-[10px] font-bold text-red-500 bg-red-500/5 px-4 py-3 rounded-lg border border-red-500/10 uppercase tracking-widest">
                  {error}
                </p>
              )}

              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <Link to="/" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">
                    Cancel
                </Link>
                <button 
                    type="submit" 
                    disabled={submitting} 
                    className="bg-white text-black px-12 py-5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-uni-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-30 w-full md:w-auto"
                >
                    {submitting ? 'Submitting Claim...' : 'Submit Claim'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubmitClaim;
