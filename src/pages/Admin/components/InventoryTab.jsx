import React, { useState, useMemo } from 'react';
import InventoryCard from './InventoryCard';
import { Filter, Search, CheckSquare, Square, XCircle, PlusCircle, Vault, Clock, HandHelping, ListFilter, Activity, Loader2, Zap, ChevronRight, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const InventoryTab = ({ 
  inventoryFilter, 
  setInventoryFilter, 
  filteredItems, 
  handleItemClick, 
  categoryTotals,
  activeFilter,
  searchQuery,
  setSearchQuery,
  matches, 
  pendingClaims, 
  navigate, 
  setSearchTerm, 
  handleStatusUpdate,
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading,
  handleBulkStatusUpdate
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const pendingIntakeIds = useMemo(() => 
    selectedIds.filter(id => filteredItems.find(i => i.id === id)?.status === 'reported'),
    [selectedIds, filteredItems]
  );

  const filters = [
    { id: 'all', label: 'All Items', icon: ListFilter, color: 'hover:bg-white/5 border-white/5' },
    { id: 'pending', label: 'Pending Secure', icon: Clock, color: 'hover:bg-amber-500/10 border-amber-500/10 text-amber-500' },
    { id: 'vault', label: 'In Inventory', icon: Vault, color: 'hover:bg-uni-500/10 border-uni-500/10 text-uni-400' },
    { id: 'ready', label: 'Ready to Return', icon: HandHelping, color: 'hover:bg-green-500/10 border-green-500/10 text-green-400' }
  ];

  return (
    <div className="space-y-8 pb-32 relative">
      
      {/* Inventory Header & Navigation */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
           {/* Navigation - Mobile Scrollable */}
           <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar mask-fade-right pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {filters.map(f => (
                <Button 
                  key={f.id}
                  variant={inventoryFilter === f.id ? "default" : "outline"}
                  onClick={() => {
                    setInventoryFilter(f.id);
                    setSelectedIds([]);
                  }}
                  className={`h-10 md:h-12 rounded-xl text-[11px] md:text-[12px] font-bold tracking-tight transition-all px-5 md:px-6 shrink-0 border-white/5 shadow-xl ${
                    inventoryFilter === f.id 
                    ? "bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20" 
                    : `bg-slate-900/40 text-slate-400 hover:text-white backdrop-blur-3xl`
                  }`}
                >
                  <f.icon size={14} className="mr-2.5" />
                  <span className="whitespace-nowrap uppercase tracking-wider">{f.label}</span>
                </Button>
              ))}
           </div>
           
           <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={selectAll}
                className="h-12 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 px-6 border border-white/5"
              >
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                  <CheckSquare size={16} className="mr-2.5 text-uni-400" />
                ) : (
                  <Square size={16} className="mr-2.5" />
                )}
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Clear Selection' : 'Select Page'}
              </Button>
           </div>
        </div>

        {/* Status Context Summary */}
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-uni-500"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {filteredItems.length} Total Items in View
              </p>
           </div>
           {selectedIds.length > 0 && (
             <button 
               onClick={() => setSelectedIds([])}
               className="text-[10px] font-bold text-uni-400 uppercase tracking-widest hover:bg-uni-500/10 px-3 py-1 rounded-lg transition-all"
             >
                Reset Selection
             </button>
           )}
        </div>
      </div>

      {activeFilter && !['today', 'weekly', 'all', 'pending', 'vault', 'ready'].includes(activeFilter) && (
         <div className="flex items-center gap-3 px-2 relative z-10">
            <Badge className="bg-uni-500/10 text-uni-400 border-uni-500/10 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Filter size={12} />
              Category: {activeFilter}
            </Badge>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Clear
            </button>
         </div>
      )}

      {/* Grid Rendering */}
      <div className="relative z-10 space-y-4 md:space-y-6">
      {filteredItems.length === 0 ? (
        <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl">
              <PackageSearch size={32} className="text-slate-800" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Items Found</p>
              <p className="text-[11px] text-slate-600 font-medium max-w-xs mx-auto">Try adjusting your filters or search query.</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <InventoryCard 
              key={item.id}
              item={item}
              matches={matches}
              pendingClaims={pendingClaims}
              navigate={navigate}
              setSearchTerm={setSearchTerm}
              handleStatusUpdate={handleStatusUpdate}
              setShowReleaseModal={setShowReleaseModal}
              setReleaseForm={setReleaseForm}
              actionLoading={actionLoading}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
            />
          ))}
        </div>
      )}
      </div>

      {/* Bulk Management Bar - Premium Sleek */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6"
          >
            <div className="bg-slate-950 border border-white/10 p-4 md:p-5 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-3xl shadow-2xl">
               <div className="flex items-center gap-4 pl-2">
                  <div className="w-12 h-12 rounded-xl bg-uni-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedIds.length}
                  </div>
                  <div className="text-left">
                     <p className="text-xs font-bold text-white uppercase tracking-wider">Bulk Actions</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Items</p>
                  </div>
               </div>

               <div className="flex items-center gap-2 pr-1">
                  {pendingIntakeIds.length > 0 && (
                    <Button 
                      onClick={() => {
                        handleBulkStatusUpdate(pendingIntakeIds, 'in_custody');
                        setSelectedIds([]);
                      }}
                      disabled={actionLoading === 'bulk'}
                      className="bg-white text-slate-950 hover:bg-uni-600 hover:text-white px-6 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl"
                    >
                      {actionLoading === 'bulk' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        `Secure ${pendingIntakeIds.length}`
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                    className="hover:bg-red-500/10 hover:text-red-400 text-slate-500 px-4 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryTab;
