import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, Package, FileText, ChevronDown, BarChart3, PieChart as PieIcon, LineChart as LineIcon, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

/**
 * Analytics - Premium Professional (Pro Max)
 * - Clean, actionable data visualization.
 * - Human-centric labeling (No "System Intelligence").
 * - Sleek, breathable chart layouts.
 */
const Analytics = ({ onNavigateToTab, onSetSearchTerm, refreshTrigger, setIsSyncing }) => {
  const [period, setPeriod] = useState('today');
  const [reportData, setReportData] = useState({ found: [], lost: [] });
  const [claimData, setClaimData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData(refreshTrigger > 0);
  }, [period, refreshTrigger]);

  const fetchAnalyticsData = async (isSync = false) => {
    if (isSync) setIsSyncing(true);
    else setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_analytics_stats', {
        time_period: period
      });

      if (error) throw error;

      setReportData(data.reports || { found: [], lost: [] });
      setClaimData(data.claims || []);
      setInsights(data.insights || null);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleExport = async (type = 'all') => {
    setExporting(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (type === 'all' || type === 'found') {
        const { data: foundItems } = await supabase.from('found_items').select('*');
        if (foundItems && foundItems.length > 0) {
          const headers = Object.keys(foundItems[0]).join(",");
          const rows = foundItems.map(item => Object.values(item).map(v => `"${v}"`).join(",")).join("\n");
          csvContent += "FOUND ITEMS\n" + headers + "\n" + rows + "\n\n";
        }
      }

      if (type === 'all' || type === 'lost') {
        const { data: lostItems } = await supabase.from('lost_items').select('*');
        if (lostItems && lostItems.length > 0) {
          const headers = Object.keys(lostItems[0]).join(",");
          const rows = lostItems.map(item => Object.values(item).map(v => `"${v}"`).join(",")).join("\n");
          csvContent += "LOST ITEMS\n" + headers + "\n" + rows + "\n\n";
        }
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `findit_export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setExporting(false);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">System Analytics</h2>
          <p className="text-[13px] text-slate-400 font-medium">Daily traffic and recovery performance analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl shadow-xl">
            {['today', 'weekly', 'monthly', 'all_time'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  period === p ? 'bg-uni-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {p.replace('today', 'Today').replace('all_time', 'Lifecycle')}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleExport()}
            disabled={exporting}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white h-14 px-8 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            {exporting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
                <Download size={16} />
            )}
            Batch Export
          </button>
        </div>
      </div>
      
      {/* Activity Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <ActivityCard label="Today Found" value={insights?.today?.found} color="text-uni-400" onClick={() => { onNavigateToTab('found'); onSetSearchTerm('today'); }} />
        <ActivityCard label="Today Lost" value={insights?.today?.lost} color="text-amber-500" onClick={() => { onNavigateToTab('lost'); onSetSearchTerm('today'); }} />
        <ActivityCard label="Weekly Volume" value={insights?.weekly?.found} color="text-uni-400" onClick={() => { onNavigateToTab('found'); onSetSearchTerm('weekly'); }} />
        <ActivityCard label="Pending Claims" value={insights?.today?.claims || 0} color="text-emerald-400" onClick={() => onNavigateToTab('claims')} />
      </div>

      {/* Insight Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard 
          icon={<TrendingUp size={20} className="text-amber-500" />}
          label="Top Lost Category"
          value={insights?.most_lost?.category || 'N/A'}
          subValue={`${insights?.most_lost?.count || 0} recent reports`}
          accent="amber"
        />
        <InsightCard 
          icon={<AlertTriangle size={20} className="text-red-500" />}
          label="Highest Friction"
          value={insights?.hardest_to_claim?.category || 'None'}
          subValue={insights?.hardest_to_claim ? `${(insights.hardest_to_claim.rate * 100).toFixed(0)}% rejection rate` : 'Stability optimal'}
          accent="red"
        />
        <InsightCard 
          icon={<CheckCircle size={20} className="text-emerald-500" />}
          label="Best Recovery Rate"
          value={insights?.best_recovery?.category || 'None'}
          subValue={insights?.best_recovery ? `${(insights.best_recovery.rate * 100).toFixed(0)}% success rate` : 'Pending data'}
          accent="emerald"
        />
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-10 shadow-inner">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <LineIcon size={14} className="text-uni-400" /> Report Volume Over Time
            </h3>
            <div className="flex gap-5">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-uni-500"></div> Found
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Lost
                </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combineFoundLost(chartFoundData, chartLostData)}>
                <defs>
                    <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="period" stroke="#475569" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="foundTotal" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFound)" />
                <Area type="monotone" dataKey="lostTotal" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorLost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-10 shadow-inner">
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <BarChart3 size={14} className="text-emerald-400" /> Claims by Category
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartClaimData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="period" stroke="#475569" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                {categories.map((cat, i) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={4} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Distribution Overview */}
      <section className="bg-slate-950/40 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Recovery Performance</h3>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                        Distribution of recovered items across key university categories. 
                        Optimize workflows based on the most active inventory sectors.
                    </p>
                </div>
                <div className="space-y-6">
                    {calculateCategoryDistribution(reportData.found).slice(0, 4).map((item, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                               <span className="text-slate-400">{item.name}</span>
                               <span className="text-white">{item.value}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden shadow-inner">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-uni-500 shadow-[0_0_15px_rgba(var(--uni-500-rgb),0.3)]" />
                           </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center group">
                    <PieIcon size={40} className="text-white/10 group-hover:text-uni-400 transition-colors mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Sector Analysis</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={calculateCategoryDistribution(reportData.found)}
                            cx="50%"
                            cy="50%"
                            innerRadius={90}
                            outerRadius={130}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {calculateCategoryDistribution(reportData.found).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
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

// --- Sub-components ---

const ActivityCard = ({ label, value, color, onClick }) => (
    <button onClick={onClick} className="bg-slate-900/30 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-3 hover:bg-slate-900/50 hover:border-white/10 transition-all active:scale-[0.98] group">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
        <h4 className={`text-3xl font-bold ${color} tracking-tight`}>{value || 0}</h4>
        <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pt-2">
          View <ArrowRight size={10} />
        </div>
    </button>
);

const InsightCard = ({ icon, label, value, subValue, accent }) => {
    const accents = {
        amber: 'border-amber-500/10 group-hover:border-amber-500/30 shadow-amber-500/5',
        red: 'border-red-500/10 group-hover:border-red-500/30 shadow-red-500/5',
        emerald: 'border-emerald-500/10 group-hover:border-emerald-500/30 shadow-emerald-500/5'
    };
    return (
        <div className={`bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 relative group ${accents[accent]} transition-all overflow-hidden shadow-xl hover:shadow-2xl`}>
            <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                    {icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:animate-pulse" />
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <h4 className="text-xl font-bold text-white tracking-tight truncate">{value}</h4>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2">{subValue}</p>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/20 p-5 rounded-2xl shadow-3xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex justify-between items-center gap-10 mb-2 last:mb-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{p.name}</span>
                        </div>
                        <span className="text-xl font-bold text-white">{p.value}</span>
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
            <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/20 px-5 py-3 rounded-2xl shadow-3xl">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                  {payload[0].name}: {payload[0].value}%
                </span>
            </div>
        );
    }
    return null;
};

// --- Utilities ---
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

export default Analytics;
