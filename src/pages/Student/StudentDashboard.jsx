import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const [lostReports, setLostReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const response = await apiClient.get('/lost/my-reports');
      setLostReports(response.data);
    } catch (error) {
      console.error('Failed to fetch my reports', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 fade-in">
      <header className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">University Lost & Found Registry</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Official student portal for reporting and identifying personal property on campus.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg border-l-4 border-blue-900 shadow-sm transition-all hover:shadow-md border border-slate-200">
          <div className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2">Service A: Missing Property</div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">File a Lost Report</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Provide a detailed description of your missing item for cross-reference in our central database.
          </p>
          <Link 
            to="/report/lost" 
            className={`block w-full text-center py-3 px-4 rounded font-bold transition-all shadow-sm ${!user?.is_verified ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-800 hover:-translate-y-0.5'}`}
          >
            Submit Official Report
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg border-l-4 border-emerald-600 shadow-sm transition-all hover:shadow-md border border-slate-200">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Service B: Found Property</div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Register a Found Item</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Report an item you have recovered to initiate the identification and return workflow.
          </p>
          <Link 
            to="/report/found" 
            className={`block w-full text-center py-3 px-4 rounded font-bold transition-all shadow-sm ${!user?.is_verified ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5'}`}
          >
            Complete Found Registry
          </Link>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Property Reports</h2>
          <Link to="/my-claims" className="text-sm font-bold text-blue-900 hover:underline flex items-center gap-1">
            VIEW CLAIM HISTORY <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
          </div>
        ) : lostReports.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center shadow-sm">
            <div className="text-4xl mb-4 opacity-20">📦</div>
            <p className="text-slate-400 font-medium">You haven't reported any lost items yet. Submissions will appear here for tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lostReports.map(report => (
              <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-inner">
                    📦
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg leading-tight">{report.category}</div>
                    <div className="text-sm text-slate-400 font-medium mt-1 truncate max-w-[200px] md:max-w-md">{report.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Status</div>
                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'matched' ? 'bg-indigo-100 text-indigo-700' :
                      report.status === 'claimed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <Link 
                    to={`/lost/${report.id}/matches`} 
                    className="bg-slate-800 text-white px-5 py-2.5 rounded text-xs font-black shadow-sm hover:bg-black transition-all active:scale-95 no-underline"
                  >
                    CROSS-REFERENCE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
