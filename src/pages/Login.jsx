import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await apiClient.post('/auth/login', formData);
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background bg-modern flex items-center justify-center p-6 pb-24">
      <div className="app-card w-full max-w-md p-8 sm:p-10 bg-brand-surface/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-primary text-slate-950 rounded-2xl mb-4 shadow-lg shadow-brand-primary/20">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign In
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Access your FindIT account
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <input 
              placeholder="e.g. name@university.edu"
              type="email" 
              className="input-field"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
              Password
            </label>
            <input 
              placeholder="••••••••"
              type="password" 
              className="input-field"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
            ) : (
              <>Sign In <span>→</span></>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-brand-border text-center">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account? <Link to="/register" className="text-brand-primary font-bold hover:text-brand-secondary transition-colors">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
