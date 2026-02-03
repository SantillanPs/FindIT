import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
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
      role,
      full_name: fullName,
      student_id_number: role === 'student' ? studentId : null,
      verification_proof_url: role === 'student' ? proofUrl : null
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
        className="glass-panel w-full max-w-xl p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 relative overflow-hidden z-10 my-10"
      >
        <div className="text-left mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-default rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl text-white shadow-lg shadow-accent-default/20">
                <i className="fa-solid fa-user-plus"></i>
             </div>
             <h1 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tighter">Create Account</h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Join the university lost & found network. Register your account to start reporting and claiming items.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl"
            >
               {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                placeholder="id@univ.edu"
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

          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
            <input 
              placeholder="e.g. Juan De La Cruz"
              type="text" 
              className="input-field"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button 
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${role === 'student' ? 'bg-uni-600 border-uni-500 text-white shadow-lg shadow-uni-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                    Student
                </button>
                <button 
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${role === 'admin' ? 'bg-uni-600 border-uni-500 text-white shadow-lg shadow-uni-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                    Staff / Admin
                </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {role === 'student' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-4 text-left"
              >
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-id-card text-uni-400"></i>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Student Verification</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] md:text-[10px] font-black text-slate-700 md:text-slate-600 uppercase tracking-widest ml-1">Student ID Number</label>
                    <input 
                      placeholder="e.g. 2026-0001"
                      type="text" 
                      className="input-field bg-black/20"
                      value={studentId} 
                      onChange={(e) => setStudentId(e.target.value)} 
                      required={role === 'student'} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Photo of Identification (URL)</label>
                    <input 
                      placeholder="Link to your ID photo"
                      type="text" 
                      className="input-field bg-black/20"
                      value={proofUrl} 
                      onChange={(e) => setProofUrl(e.target.value)} 
                      required={role === 'student'} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-accent-default hover:bg-accent-light text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-accent-default/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                Initialize Account
                <i className="fa-solid fa-check"></i>
              </>
            )}
          </button>
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
