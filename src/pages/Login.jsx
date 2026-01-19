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
      setError(err.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.75rem' }}>Welcome to FindIT</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>The campus central for lost and found reunions.</p>
        </div>

        {error && <div className="error-msg" style={{ textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Campus Email</label>
            <input 
              placeholder="e.g. name@student.edu"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              placeholder="••••••••"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New to FindIT? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
