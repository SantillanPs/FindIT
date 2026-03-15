import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import ImageUpload from '../components/ImageUpload';
import { useMasterData } from '../context/MasterDataContext';

const Register = () => {
  const { colleges: COLLEGES, loading: metadataLoading } = useMasterData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'student';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { 
      email, 
      password, 
      role: 'student',
      first_name: firstName,
      last_name: lastName,
      student_id_number: studentId,
      department: department,
      verification_proof_url: proofUrl
    };

    try {
      await apiClient.post('/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-20 relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-accent-default/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-uni-500/10 blur-[60px] md:blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-4xl p-8 sm:p-12 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden z-10 my-10"
      >
        <div className="text-left mb-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-accent-default rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-accent-default/20">
                <i className="fa-solid fa-user-plus"></i>
             </div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Create Account</h1>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed max-w-2xl">
            Join the university lost & found network. Register your account to start reporting and claiming items.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest text-center rounded-3xl"
            >
               {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Identity Group */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Personal Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    placeholder="Juan"
                    type="text" 
                    className="input-field"
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    placeholder="Cruz"
                    type="text" 
                    className="input-field"
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  placeholder="juan.cruz@university.edu"
                  type="email" 
                  className="input-field"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <input 
                  placeholder="••••••••"
                  type="password" 
                  className="input-field"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Academic Info Group */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-uni-400 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Academic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID Number</label>
                  <input 
                    placeholder="2024-123456"
                    type="text" 
                    className="input-field"
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">College/Dept</label>
                  <select 
                    className="input-field font-black uppercase text-[10px] tracking-widest px-4"
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    required
                  >
                    <option value="">Select Dept</option>
                    {COLLEGES.map(college => (
                        <option key={college.id} value={college.label}>{college.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Proof (ID Photo)</label>
                <ImageUpload 
                  label="Snap a photo of your school ID"
                  value={proofUrl}
                  onChange={setProofUrl}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <button 
              type="submit" 
              className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.5em] hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "PROVISIONING..." : "ACTIVATE ACCOUNT →"}
            </button>
          </div>
        </form>
        
        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            Already registered in the system? <br />
            <Link to="/login" className="text-accent-default hover:text-white transition-colors font-bold mt-3 inline-block">Secure Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
