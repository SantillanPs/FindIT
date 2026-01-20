import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      // Fetch concurrently but handle individually to avoid one fail blocking the other
      const [lostRes, foundRes] = await Promise.allSettled([
        apiClient.get('/lost/my-reports'),
        apiClient.get('/found/my-reports')
      ]);
      
      if (lostRes.status === 'fulfilled') {
        setLostReports(lostRes.value.data);
      } else {
        console.error('Lost reports sync failed', lostRes.reason);
      }

      if (foundRes.status === 'fulfilled') {
        setFoundReports(foundRes.value.data);
      } else {
        console.error('Findings sync failed', foundRes.reason);
      }
    } catch (error) {
      console.error('Fatal dashboard sync error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {user?.email.split('@')[0]}
        </h1>
        <p className="text-slate-400 mt-2 text-base font-medium">
          Manage your reports and help the community recover lost assets.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="app-card p-6 flex flex-col group border-l-4 border-l-brand-primary">
          <div className="mb-4">
            <span className="inline-block p-3 bg-brand-primary/10 text-brand-primary rounded-xl text-2xl group-hover:scale-110 transition-transform">
              🎒
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Report Lost Item</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
            Lost something? Provide some details and we'll check our registry for possible matches.
          </p>
          <Link 
            to="/report/lost" 
            className={`btn-primary text-center ${!user?.is_verified ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Report Loss
          </Link>
        </div>

        <div className="app-card p-6 flex flex-col group border-l-4 border-l-brand-secondary">
          <div className="mb-4">
            <span className="inline-block p-3 bg-brand-secondary/10 text-brand-secondary rounded-xl text-2xl group-hover:scale-110 transition-transform">
              ✨
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Report Found Item</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
            Found something? Register it here so the rightful owner can claim it back.
          </p>
          <Link 
            to="/report/found" 
            className={`btn-accent text-center ${!user?.is_verified ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Register Item
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Your Findings Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Your Findings <span className="text-xs bg-brand-secondary/20 text-brand-secondary px-2 py-0.5 rounded-full">{foundReports.length}</span>
              </h2>
            </div>

            {foundReports.length === 0 ? (
              <div className="app-card p-12 text-center bg-slate-900/40 border-dashed border-slate-800">
                <p className="text-slate-500 font-medium text-sm italic">You haven't reported any found items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {foundReports.map(item => (
                  <div key={item.id} className="app-card p-4 flex items-center justify-between group app-card-hover border-l-2 border-l-brand-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900/50 border border-brand-border flex items-center justify-center text-lg">
                        🔍
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{item.category}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2">
                          <span className="text-brand-secondary">REF-{item.id.toString().padStart(4, '0')}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className={
                            item.status === 'reported' ? 'text-amber-500' : 
                            item.status === 'in_custody' ? 'text-sky-400' : 
                            'text-emerald-500'
                          }>{item.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Your Reports Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Your Lost Reports <span className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">{lostReports.length}</span>
              </h2>
              <Link to="/my-claims" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors">
                View Claims
              </Link>
            </div>

            {lostReports.length === 0 ? (
              <div className="app-card p-12 text-center bg-slate-900/40 border-dashed border-slate-800">
                <p className="text-slate-500 font-medium text-sm italic">No active loss reports found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {lostReports.map(report => (
                  <div key={report.id} className="app-card p-4 flex items-center justify-between group app-card-hover border-l-2 border-l-brand-primary/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900/50 border border-brand-border flex items-center justify-center text-lg">
                        📁
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{report.category}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2">
                          <span className="text-brand-primary">#{report.id.toString().padStart(4, '0')}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span>{report.status}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/lost/${report.id}/matches`} 
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      Check Matches
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
