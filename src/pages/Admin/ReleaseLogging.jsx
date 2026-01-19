import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';

const ReleaseLogging = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({
    released_to_id: '',
    released_by_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await apiClient.get(`/admin/found/${itemId}`);
      setItem(response.data);
    } catch (err) {
      alert('Could not fetch item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(`/admin/found/${itemId}/release`, formData);
      alert('Item release logged successfully. Status: RELEASED');
      navigate('/admin');
    } catch (err) {
      alert('Failed to log release. Ensure item is in "claimed" status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading item metadata...</div>;

  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h1>Log Item Handover</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Final step: Record the physical pickup by the student.</p>

      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
        <p><strong>Item:</strong> {item.category} (#{item.id})</p>
        <p><strong>Status:</strong> {item.status}</p>
        <p><strong>Found by:</strong> User ID {item.finder_id}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Student ID</label>
          <input 
            type="number" 
            placeholder="Matching user ID of the claimant"
            value={formData.released_to_id}
            onChange={(e) => setFormData({...formData, released_to_id: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Releasing Staff/Admin Name</label>
          <input 
            type="text" 
            placeholder="Your full name"
            value={formData.released_by_name}
            onChange={(e) => setFormData({...formData, released_by_name: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Processing...' : 'Complete Release'}
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/admin">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default ReleaseLogging;
