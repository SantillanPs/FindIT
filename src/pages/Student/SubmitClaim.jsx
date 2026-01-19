import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proof, setProof] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      // Students use the public feed endpoint to see basic info
      const response = await apiClient.get('/found/public');
      const foundItem = response.data.find(i => i.id === parseInt(itemId));
      if (foundItem) {
        setItem(foundItem);
      } else {
        setError('Item not found or no longer available for claiming.');
      }
    } catch (err) {
      setError('Could not fetch item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_verified) {
      setError('You must be verified by an admin to submit a claim.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/claims/submit', {
        found_item_id: parseInt(itemId),
        proof_description: proof,
        proof_photo_url: proofPhotoUrl
      });
      alert('Claim submitted successfully! Staff will review your proof.');
      navigate('/my-claims');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit claim. Does the item have "in_custody" status?');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading item details...</div>;
  if (error && !item) return <div className="alert alert-warning">{error} <Link to="/student">Back</Link></div>;

  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h1>Submit Ownership Claim</h1>
      
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
        <p><strong>Item:</strong> {item.category}</p>
        <p><strong>Found At:</strong> {item.location_zone}</p>
        <p><strong>Public Description:</strong> {item.description}</p>
      </div>

      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
        Provide detailed proof that this item belongs to you. Mention specific marks, settings, or contents that only the owner would know.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Proof of Ownership</label>
          <textarea 
            rows="5"
            placeholder="E.g. It has a 'Home' sticker on the back left corner. The lock code is 1234."
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Proof Photo (URL) (Optional)</label>
          <input 
            type="text"
            placeholder="Optional link to a photo for proof (e.g., you holding the item)"
            value={proofPhotoUrl}
            onChange={(e) => setProofPhotoUrl(e.target.value)}
          />
          <small style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>This photo will only be visible to admin staff.</small>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting || !user?.is_verified}>
          {submitting ? 'Submitting Claim...' : !user?.is_verified ? 'Verification Required' : 'Submit Claim'}
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/public-feed" style={{ fontSize: '0.9rem' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default SubmitClaim;
