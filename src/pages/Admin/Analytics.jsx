import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Download, Filter, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, Package, FileText, ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

const Analytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [reportData, setReportData] = useState({ found: [], lost: [] });
  const [claimData, setClaimData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [reportsRes, claimsRes, insightsRes] = await Promise.all([
        apiClient.get(`/analytics/reports/stats?period=${period}`),
        apiClient.get(`/analytics/claims/stats?period=${period}`),
        apiClient.get('/analytics/insights')
      ]);
      setReportData(reportsRes.data);
      setClaimData(claimsRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type = 'all') => {
    setExporting(true);
    try {
      const response = await apiClient.get(`/analytics/export?data_type=${type}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `findit_export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setExporting(false);
    }
  };

  // Helper to transform raw periodic stats into recharts-ready data
  const processChartData = (rawList) => {
    const grouped = {};
    rawList.forEach(item => {
      if (!grouped[item.period]) grouped[item.period] = { period: item.period };
      grouped[item.period][item.category] = item.count;
    });
    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  };

  const chartFoundData = processChartData(reportData.found);
  const chartLostData = processChartData(reportData.lost);
  const chartClaimData = processChartData(claimData);

  const categories = [...new Set([
    ...reportData.found.map(i => i.category),
    ...reportData.lost.map(i => i.category),
    ...claimData.map(i => i.category)
  ])];

  const COLORS = ['#6366f1', '#eab308', '#a855f7', '#ec4899', '#22c55e', '#f97316'];

  if (loading && !insights) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Intelligence</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Advanced reporting and data analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
            {['today', 'weekly', 'monthly', '6months', 'yearly', 'all_time'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-uni-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {p.replace('today', 'Today').replace('6months', '6 Months').replace('all_time', 'All Time')}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleExport()}
            disabled={exporting}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            {exporting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <Download size={14} />
            )}
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Activity Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <ActivityCard label="Today's Found" value={insights?.today?.found} color="text-uni-400" />
        <ActivityCard label="Today's Lost" value={insights?.today?.lost} color="text-amber-500" />
        <ActivityCard label="Weekly Found" value={insights?.weekly?.found} color="text-uni-400" />
        <ActivityCard label="Weekly Lost" value={insights?.weekly?.lost} color="text-amber-500" />
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard 
          icon={<TrendingUp className="text-amber-500" />}
          label="Most Lost Type"
          value={insights?.most_lost?.category || 'N/A'}
          subValue={`${insights?.most_lost?.count || 0} total reports`}
          color="gold"
        />
        <InsightCard 
          icon={<AlertTriangle className="text-red-500" />}
          label="Hardest to Claim"
          value={insights?.hardest_to_claim?.category || 'None'}
          subValue={insights?.hardest_to_claim ? `${(insights.hardest_to_claim.rate * 100).toFixed(0)}% Rejection Rate` : 'Insufficient data'}
          color="red"
        />
        <InsightCard 
          icon={<CheckCircle className="text-green-500" />}
          label="Best Recovery Type"
          value={insights?.best_recovery?.category || 'None'}
          subValue={insights?.best_recovery ? `${(insights.best_recovery.rate * 100).toFixed(0)}% Success Rate` : 'Insufficient data'}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Comparison */}
        <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Found vs Lost Reports</h3>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-uni-500"></div> Found
                </div>
                <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div> Lost
                </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combineFoundLost(chartFoundData, chartLostData)}>
                <defs>
                    <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="period" 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight="900" 
                    tickFormatter={(v) => v.split('-').pop()}
                />
                <YAxis stroke="#475569" fontSize={10} fontWeight="900" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="foundTotal" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFound)" />
                <Area type="monotone" dataKey="lostTotal" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorLost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Claim Activity */}
        <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Claim Activity by Category</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartClaimData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="#475569" fontSize={10} fontWeight="900" />
                <YAxis stroke="#475569" fontSize={10} fontWeight="900" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                {categories.map((cat, i) => (
                  <Bar 
                    key={cat} 
                    dataKey={cat} 
                    stackId="a" 
                    fill={COLORS[i % COLORS.length]} 
                    radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Category Distribution (Bottom) */}
      <section className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Recovery Funnel</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 leading-relaxed">
                        Analyzing the distribution of reported found items across various institutional categories. 
                        Use this and match with claim data to identify bottlenecks.
                    </p>
                </div>
                <div className="space-y-4">
                    {calculateCategoryDistribution(reportData.found).slice(0, 4).map((item, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                               <span className="text-slate-400">{item.name}</span>
                               <span className="text-white">{item.value}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-uni-500" style={{ width: `${item.value}%` }}></div>
                           </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={calculateCategoryDistribution(reportData.found)}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {calculateCategoryDistribution(reportData.found).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </section>
    </div>
  );
};

// --- Helper Components & Functions ---

const combineFoundLost = (found, lost) => {
    const combined = {};
    found.forEach(item => {
        if(!combined[item.period]) combined[item.period] = { period: item.period, foundTotal: 0, lostTotal: 0 };
        Object.keys(item).forEach(key => {
            if(key !== 'period') combined[item.period].foundTotal += item[key];
        });
    });
    lost.forEach(item => {
        if(!combined[item.period]) combined[item.period] = { period: item.period, foundTotal: 0, lostTotal: 0 };
        Object.keys(item).forEach(key => {
            if(key !== 'period') combined[item.period].lostTotal += item[key];
        });
    });
    return Object.values(combined).sort((a,b) => a.period.localeCompare(b.period));
};

const calculateCategoryDistribution = (data) => {
    const counts = {};
    let total = 0;
    data.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + item.count;
        total += item.count;
    });
    return Object.keys(counts).map(name => ({
        name,
        value: total > 0 ? Math.round((counts[name] / total) * 100) : 0
    })).sort((a,b) => b.value - a.value);
};

const ActivityCard = ({ label, value, color }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-center items-center text-center space-y-2">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <h4 className={`text-2xl font-black ${color} tracking-tight`}>{value || 0}</h4>
    </div>
);

const InsightCard = ({ icon, label, value, subValue, color }) => {
    const borders = {
        gold: 'border-amber-500/20 group-hover:border-amber-500/40',
        red: 'border-red-500/20 group-hover:border-red-500/40',
        green: 'border-green-500/20 group-hover:border-green-500/40'
    };
    return (
        <div className={`glass-panel p-8 rounded-3xl border border-white/5 relative group ${borders[color]} transition-all overflow-hidden`}>
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-950 border border-white/5 rounded-2xl">
                    {icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-white/40"></div>
            </div>
            <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{value}</h4>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{subValue}</p>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex justify-between gap-8 mb-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.name}:</span>
                        <span className="text-[9px] font-black text-white">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950 border border-white/10 px-4 py-2 rounded-xl shadow-2xl">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{payload[0].name}: {payload[0].value}%</span>
            </div>
        );
    }
    return null;
};

export default Analytics;
