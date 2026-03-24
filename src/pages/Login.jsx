import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';
    
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await apiClient.post('/auth/login', formData);
      login(response.data.access_token, response.data.user);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-uni-500/10 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/3 w-32 md:w-64 h-32 md:h-64 bg-accent-default/10 rounded-full pointer-events-none"></div>

      <div 
        className="glass-panel w-full max-w-md p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 relative overflow-hidden z-10 my-8"
      >
        <div className="text-left mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-uni-600 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl text-white">
                <i className="fa-solid fa-lock"></i>
             </div>
             <h1 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tighter">FindIT Login</h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Welcome back. Please sign in to access your reports and manage your belongings.
          </p>
        </div>

        {error && (
            <div 
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl"
            >
               {error}
            </div>
          )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1">Email Address</label>
            <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input 
                  placeholder="yourname@email.com"
                  type="email" 
                  className="input-field pl-12"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
            </div>
          </div>
          
          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-black text-slate-500 tracking-widest ml-1">Secure Password</label>
            <div className="relative">
                <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input 
                  placeholder="••••••••••••"
                  type="password" 
                  className="input-field pl-12"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-uni-600 hover:bg-uni-500 text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              <>
                Continue to Dashboard
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            Identity registry not yet initialized? <br />
            <Link to="/register" className="text-uni-400 hover:text-white transition-colors font-bold mt-3 inline-block">Create Private Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
