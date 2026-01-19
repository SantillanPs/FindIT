import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';

const MatchResults = () => {
  const { reportId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [reportId]);

  const fetchMatches = async () => {
    try {
      const response = await apiClient.get(`/lost/${reportId}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchLabel = (score) => {
    if (score >= 0.8) return { label: 'High', color: '#166534', bg: '#dcfce7' };
    if (score >= 0.6) return { label: 'Medium', color: '#92400e', bg: '#fef3c7' };
    return { label: 'Low', color: '#991b1b', bg: '#fef2f2' };
  };

  if (loading) return <div>Analyzing database for matches...</div>;

  return (
    <div>
      <h1>AI Matching Suggestions</h1>
      <p>The system has analyzed your lost report and found the following potential matches based on semantic similarity.</p>

      {matches.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem' }}>No similarity matches found yet. Try checking back later!</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Confidence</th>
              <th>Photo</th>
              <th>Category</th>
              <th>Description</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(({ item, similarity_score }) => {
              const info = getMatchLabel(similarity_score);
              return (
                <tr key={item.id}>
                  <td>
                    <span 
                      className="badge" 
                      style={{ backgroundColor: info.bg, color: info.color }}
                    >
                      {info.label} Confidence
                    </span>
                  </td>
                  <td>
                    {item.safe_photo_url ? (
                      <img 
                        src={item.safe_photo_url} 
                        alt={item.category} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#64748b' }}>
                        No Photo
                      </div>
                    )}
                  </td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>{item.location_zone}</td>
                  <td>
                    <Link 
                      to={`/submit-claim/${item.id}`} 
                      className="btn-primary" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-block' }}
                    >
                      File Claim
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/student" className="btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default MatchResults;
