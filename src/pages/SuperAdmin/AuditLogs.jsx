import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading, error: queryError } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const error = queryError ? 'Could not load system logs. Please check your permissions.' : null;

  const filteredLogs = logs.filter(log => 
    log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (actionType) => {
    const typeLower = actionType.toLowerCase();
    
    if (typeLower.includes('promotion') || typeLower.includes('demotion')) {
      return <span className="bg-uni-500/20 text-uni-400 border border-uni-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-users-gear text-[8px]"></i> Role Change</span>;
    }
    if (typeLower.includes('claim')) {
      return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-stamp text-[8px]"></i> Claim Review</span>;
    }
    if (typeLower.includes('release')) {
      return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-hand-holding-heart text-[8px]"></i> Release</span>;
    }
    if (typeLower.includes('match')) {
      return <span className="bg-uni-500/20 text-uni-400 border border-uni-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-wand-magic-sparkles text-[8px]"></i> System Match</span>;
    }
    if (typeLower.includes('reputation') || typeLower.includes('certificate')) {
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-scale-balanced text-[8px]"></i> Reputation</span>;
    }
    
    return <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><i className="fa-solid fa-terminal text-[8px]"></i> System</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 pb-32">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Security Audit Logs</h2>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Track administrative actions and system modifications</p>
        </div>
        
        <div className="w-full sm:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-slate-500"></i>
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-uni-500/50 focus:ring-1 focus:ring-uni-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      ) : (
        <div className="app-card overflow-hidden border-white/5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Details & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-white">{format(new Date(log.timestamp), 'MMM d, yyyy')}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{format(new Date(log.timestamp), 'h:mm a')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-white font-bold text-xs">
                          {log.admin_name?.charAt(0) || log.admin_email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[150px]">{log.admin_name || 'Unknown User'}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[150px] mt-0.5">{log.admin_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action_type)}
                    </td>
                    <td className="px-6 py-4 min-w-[250px]">
                      <p className="text-xs text-slate-300 leading-relaxed break-words">{log.notes || 'No additional details provided.'}</p>
                      
                      {/* Context Pills */}
                      <div className="flex flex-wrap gap-2 mt-2">
                          {log.item_id && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400">Item #{log.item_id}</span>}
                          {log.claim_id && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400">Claim #{log.claim_id}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-xs font-black uppercase tracking-widest">
                      {logs.length === 0 ? "No audit logs found in the system yet." : "No logs match your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
