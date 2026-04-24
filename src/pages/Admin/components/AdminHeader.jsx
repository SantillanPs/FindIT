import React from 'react';
import { 
  Search, 
  RefreshCw, 
  Archive, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * AdminHeader - High Density Sticky Command Bar
 * - Minimal vertical footprint (~72px).
 * - Context-aware action buttons.
 * - Glassmorphism sticky behavior.
 */
const AdminHeader = ({ 
  currentTab, 
  searchTerm, 
  onSearchChange, 
  onSync, 
  isSyncing,
  isLoading 
}) => {

  // Map tab slugs to human-readable breadcrumbs
  const getTabLabel = (slug) => {
    const labels = {
      'found': 'All Items',
      'claims': 'Claims',
      'matches': 'Matches',
      'lost': 'Lost Reports',
      'witnesses': 'Witness Reports',
      'history': 'Activity',
      'released': 'Finished Items',
      'analytics': 'System Status',
      'users': 'Staff',
      'registry': 'Members'
    };
    return labels[slug] || 'Registry';
  };

  // Logic to hide actions on purely informational tabs
  const shouldShowActions = !['analytics', 'users', 'registry'].includes(currentTab);

  return (
    <div className={cn(
      "sticky top-2 z-[40] w-[calc(100%-1.5rem)] mx-auto rounded-[1.5rem] border border-white/10 bg-slate-950/60 backdrop-blur-3xl transition-all duration-500",
      "px-6 md:px-10 py-3 md:py-4 mb-6"
    )}>
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Breadcrumbs & Presence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <span className="hover:text-uni-400 cursor-default transition-colors">Admin</span>
            <ChevronRight size={10} className="text-slate-700" />
            <span className="text-white tracking-widest">{getTabLabel(currentTab)}</span>
          </div>
          <Badge variant="outline" className="hidden sm:flex bg-uni-500/5 text-uni-400 border-uni-500/10 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest animate-pulse">
            Live
          </Badge>
        </div>

        {/* Right: Search & Commands */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search - Shrinkable Context */}
          <div className="relative group flex-1 md:flex-none md:w-64 lg:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-uni-400 transition-colors">
              <Search size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 text-xs font-semibold text-white placeholder:text-slate-600 focus:border-uni-500/30 focus:bg-white/[0.05] outline-none transition-all shadow-inner"
            />
          </div>

          {/* Action Row - Tab specific */}
          {shouldShowActions && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onSync}
                disabled={isSyncing || isLoading}
                className={cn(
                  "flex items-center gap-2 h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                  "bg-uni-600 hover:bg-white hover:text-slate-950 text-white border border-uni-400/20 shadow-lg",
                  isSyncing && "opacity-50 grayscale pointer-events-none"
                )}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                <span className="lg:hidden">Sync</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
