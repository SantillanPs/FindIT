import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  Handshake, 
  Link as LinkIcon, 
  User, 
  Clock, 
  ShieldCheck,
  Search,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * ActivityFeed - High Fidelity Timeline
 * - Professional left-aligned timeline.
 * - Dynamic iconography based on action_type.
 * - Premium hover states and motion.
 */
const ActivityFeed = ({ activities = [], loading, searchTerm, onSearchChange }) => {
  
  const getActionConfig = (type) => {
    const typeLower = (type || '').toLowerCase();
    
    if (typeLower.includes('release') || typeLower.includes('fulfillment')) {
      return {
        icon: <Handshake className="w-4 h-4" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        label: 'Item Released'
      };
    }
    if (typeLower.includes('claim') && typeLower.includes('approve')) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-uni-400',
        bg: 'bg-uni-500/10',
        border: 'border-uni-500/20',
        label: 'Claim Approved'
      };
    }
    if (typeLower.includes('intake') || typeLower.includes('add') || typeLower.includes('create')) {
      return {
        icon: <Package className="w-4 h-4" />,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        label: 'Stock Intake'
      };
    }
    if (typeLower.includes('match')) {
      return {
        icon: <LinkIcon className="w-4 h-4" />,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
        label: 'System Match'
      };
    }
    
    return {
      icon: <ShieldCheck className="w-4 h-4" />,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
      label: 'Staff Action'
    };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-white/5 rounded w-1/4" />
              <div className="h-20 bg-white/5 rounded w-full shadow-inner" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-12">
      {/* Search Bar - Internal Feed specific */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-uni-400 transition-colors">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          placeholder="Filter history by admin, title, or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 text-xs font-bold text-white placeholder:text-slate-600 focus:border-uni-500/30 outline-none transition-all"
        />
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700">
            <Clock size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-loose">No Activity Recorded</p>
            <p className="text-[10px] text-slate-600 font-medium max-w-[200px]">Perform administrative actions like Intakes or Claim Reviews to populate this feed.</p>
          </div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="relative space-y-8"
        >
          {/* Vertical Timeline Line */}
          <div className="absolute left-[1.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

          {activities.map((activity, idx) => {
            const config = getActionConfig(activity.action_type || activity.status);
            const date = activity.timestamp || activity.released_at || activity.created_at;

            return (
              <motion.div 
                key={activity.id || idx} 
                variants={itemAnim}
                className="relative flex gap-6 group"
              >
                {/* Timeline Node */}
                <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} border ${config.border} flex items-center justify-center ${config.color} shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {config.icon}
                </div>

                {/* Content Card */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(date).toLocaleDateString()}</span>
                       <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">•</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="bg-slate-950/40 border border-white/5 rounded-[1.5rem] p-5 md:p-6 hover:bg-slate-950/60 transition-all duration-300 shadow-xl group-hover:border-white/10">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                       <div className="space-y-4 flex-1">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors">
                              {activity.item_title || activity.title}
                            </h4>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reference #{activity.item_id?.toString().slice(-4) || activity.id?.toString().slice(-4)}</span>
                               {activity.student_name && (
                                 <>
                                   <span className="w-1 h-1 rounded-full bg-slate-800" />
                                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Linked to: {activity.student_name}</span>
                                 </>
                               )}
                            </div>
                          </div>

                          {activity.notes && (
                            <div className="flex gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                               <MessageSquare size={14} className="text-slate-600 shrink-0 mt-0.5" />
                               <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                                 "{activity.notes}"
                               </p>
                            </div>
                          )}
                       </div>

                       <div className="flex flex-col items-start md:items-end justify-between shrink-0 h-full border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden">
                               {activity.admin_photo_url ? (
                                 <img src={activity.admin_photo_url} className="w-full h-full object-cover" />
                               ) : (
                                 <User size={14} className="text-slate-600" />
                               )}
                            </div>
                            <div className="space-y-0.5 text-left md:text-right">
                              <p className="text-[10px] font-bold text-slate-300 leading-none">{activity.admin_name || activity.released_by_name || 'System Auto'}</p>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Authorized Staff</p>
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ActivityFeed;
