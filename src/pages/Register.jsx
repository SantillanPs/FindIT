import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
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
    <div className="min-h-screen bg-modern bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="app-card w-full max-w-lg p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Join the FindIT community
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <input 
                type="email" 
                placeholder="university.edu"
                className="input-field"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="input-field"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Account Type
            </label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="input-field font-semibold"
            >
              <option value="student">Student</option>
              <option value="admin">Staff / Faculty</option>
            </select>
          </div>

          {role === 'student' && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                Student Verification
              </h4>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 ml-1">ID Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2026-10293"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  required={role === 'student'} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 ml-1">ID Proof (URL)</label>
                <input 
                  type="text" 
                  placeholder="Link to ID photo"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary/10"
                  value={proofUrl} 
                  onChange={(e) => setProofUrl(e.target.value)} 
                  required={role === 'student'} 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Create Account <span>→</span></>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};



export default Register;
