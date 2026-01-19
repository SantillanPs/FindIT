import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ReportLostItem = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location_zone: '',
    private_proof_details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('You must be verified by an admin to report a lost item.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/lost/report', formData);
      alert('Lost item reported successfully!');
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h1>Report a Lost Item</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Tell us what you lost. We'll use AI to find matching reports from our database.</p>
      
      {error && <div className="error-msg">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Wallets & Keys">Wallets & Keys</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Public Description</label>
          <textarea 
            rows="3"
            placeholder="E.g. Red iPhone 13 with a cracked screen."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Seen Location</label>
          <input 
            type="text"
            placeholder="E.g. Cafeteria or Main Lobby"
            value={formData.location_zone}
            onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Confidential Proof Details</label>
          <textarea 
            rows="3"
            placeholder="E.g. Wallpaper is a picture of my dog. Serial number ends in ..."
            value={formData.private_proof_details}
            onChange={(e) => setFormData({...formData, private_proof_details: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading || !user?.is_verified}
        >
          {loading ? 'Submitting...' : !user?.is_verified ? 'Verification Required' : 'Submit Lost Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportLostItem;
