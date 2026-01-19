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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="pb-6 border-b-2 border-blue-900">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Found Property Registry</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Official database of property recovered on university grounds. Verification of ownership is required for all returns.
        </p>
      </header>
      
      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <p className="text-slate-400 font-medium font-sans">No found items are currently public. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col md:flex-row items-stretch shadow-sm hover:border-slate-300 transition-all group">
              <div className="w-full md:w-64 h-48 bg-slate-100 flex items-center justify-center p-2 border-b md:border-b-0 md:border-r border-slate-100 relative overflow-hidden">
                {item.safe_photo_url ? (
                  <img src={item.safe_photo_url} alt={item.category} className="w-full h-full object-cover rounded shadow-inner transition-transform group-hover:scale-105" />
                ) : (
                  <div className="text-4xl opacity-20">📦</div>
                )}
              </div>
              
              <div className="flex-grow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase group-hover:text-blue-900 transition-colors uppercase">{item.category}</h3>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">ID: #REG-{item.id}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2 italic font-serif">"{item.description}"</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-tighter font-sans">
                    <div className="text-slate-400">
                      <span className="block text-[8px] font-black opacity-60 mb-1">Location Found</span>
                      <span className="text-slate-600 border-b border-slate-100">{item.location}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="block text-[8px] font-black opacity-60 mb-1">Registry Date</span>
                      <span className="text-slate-600 border-b border-slate-100">{new Date(item.found_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                  <Link 
                    to={`/claim/${item.id}`} 
                    className="bg-blue-900 text-white px-8 py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-black transition-all active:scale-95 no-underline"
                  >
                    Initiate Recovery Claim
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
