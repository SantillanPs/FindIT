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
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👋</span>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.75rem' }}>Join FindIT</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Create an account to start reporting and claiming items.</p>
        </div>

        {error && <div className="error-msg" style={{ textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Campus Email</label>
            <input 
              type="email" 
              placeholder="e.g. name@student.edu"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Min. 8 characters"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Campus Admin / Staff</option>
            </select>
          </div>

          {role === 'student' && (
            <div style={{ 
              padding: '1.5rem', 
              background: 'var(--primary-light)', 
              borderRadius: '12px', 
              marginBottom: '2rem', 
              border: '1px solid #dbeafe' 
            }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary-dark)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verification Details
              </h4>
              <div className="form-group">
                <label>Student ID Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2024-XXXXX"
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  required={role === 'student'} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Proof of Enrollment (URL)</label>
                <input 
                  type="text" 
                  placeholder="Link to your COR or ID photo"
                  value={proofUrl} 
                  onChange={(e) => setProofUrl(e.target.value)} 
                  required={role === 'student'} 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.4rem' }}>
                  Please provide a valid cloud link to your COR.
                </small>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
