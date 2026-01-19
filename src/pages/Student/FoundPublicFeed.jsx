import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const FoundPublicFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicFeed();
  }, []);

  const fetchPublicFeed = async () => {
    try {
      const response = await apiClient.get('/found/public');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch public feed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Recent Finds
        </h1>
        <p className="text-slate-400 mt-2 text-base font-medium max-w-2xl">
          Browse items recovered across campus. If you recognize something, you can initiate a recovery claim.
        </p>
      </header>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="app-card p-12 text-center bg-slate-900/40 border-dashed">
          <p className="text-slate-500 font-medium">The registry is currently clear.</p>
          <p className="text-xs text-slate-600 mt-1">Newly found items will appear here after verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map(item => (
            <div key={item.id} className="app-card group overflow-hidden flex flex-col sm:flex-row items-stretch min-h-[160px] app-card-hover">
              <div className="w-full sm:w-48 bg-slate-900 flex items-center justify-center relative shrink-0">
                {item.safe_photo_url ? (
                  <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-20">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-brand-primary text-slate-950 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="flex-grow p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{item.category}</h3>
                    <div className="text-right">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Logged On</span>
                      <span className="text-[10px] font-semibold text-slate-400">{new Date(item.found_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm italic mb-4 line-clamp-1">
                    "{item.description}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-sm">📍</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.location_zone}</span>
                  </div>

                  <Link 
                    to={`/submit-claim/${item.id}`} 
                    className="btn-primary py-2 px-4 text-xs w-full sm:w-auto text-center"
                  >
                    Claim Item
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};




export default FoundPublicFeed;
