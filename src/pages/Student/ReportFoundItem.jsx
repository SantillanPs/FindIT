import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location_zone: '',
    safe_photo_url: '',
    private_admin_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('You must be verified by an admin to report a found item.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/found/report', formData);
      alert('Found item reported successfully!');
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h1>Report a Found Item</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Your entry will generate an AI embedding to help match with lost reports.</p>
      
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
            placeholder="E.g. Blue backpack found in hallway."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Location Zone</label>
          <input 
            type="text"
            placeholder="E.g. Library 2nd Floor"
            value={formData.location_zone}
            onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Exterior Photo (URL) (Optional)</label>
          <input 
            type="text"
            placeholder="Optional link to a photo of the item's exterior"
            value={formData.safe_photo_url}
            onChange={(e) => setFormData({...formData, safe_photo_url: e.target.value})}
          />
          <small style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>Only upload photos of the exterior. Avoid showing identifying marks or contents.</small>
        </div>

        <div className="form-group">
          <label>Private Staff Notes</label>
          <textarea 
            rows="2"
            placeholder="E.g. Contains a student ID for John Doe (Keep this private)."
            value={formData.private_admin_notes}
            onChange={(e) => setFormData({...formData, private_admin_notes: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading || !user?.is_verified}
        >
          {loading ? 'Submitting...' : !user?.is_verified ? 'Verification Required' : 'Submit Found Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportFoundItem;
