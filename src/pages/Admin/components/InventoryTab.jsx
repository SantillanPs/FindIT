import React, { useState, useMemo } from 'react';
import InventoryCard from './InventoryCard';
import { Filter, Search, CheckSquare, Square, XCircle, PlusCircle, Vault, Clock, HandHelping, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    { id: 'all', label: 'Complete Catalog', icon: ListFilter, color: 'hover:bg-uni-500/10 hover:text-uni-400 border-uni-500/10' },
    { id: 'pending', label: 'Discovery Pending', icon: Clock, color: 'hover:bg-amber-500/10 hover:text-amber-500 border-amber-500/10' },
    { id: 'vault', label: 'In Office Vault', icon: Vault, color: 'hover:bg-sky-500/10 hover:text-sky-400 border-sky-500/10' },
    { id: 'ready', label: 'Ready for Release', icon: HandHelping, color: 'hover:bg-green-500/10 hover:text-green-400 border-green-500/10' }
  ];

  return (
    <div className="space-y-10">
      {/* Inventory Filter Nav */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
           {filters.map(f => (
             <Button 
               key={f.id}
               variant={inventoryFilter === f.id ? "default" : "outline"}
               onClick={() => {
                 setInventoryFilter(f.id);
                 setSelectedIds([]);
               }}
               className={`h-12 rounded-xl text-[13px] font-bold tracking-tight transition-all px-6 border-white/5 shadow-xl active:scale-95 ${
                 inventoryFilter === f.id 
                 ? "bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20" 
                 : `bg-slate-900/50 text-slate-300 ${f.color} backdrop-blur-md`
               }`}
             >
               <f.icon size={14} className="mr-3" />
               {f.label}
             </Button>
           ))}
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
             variant="ghost"
             onClick={selectAll}
             className="h-12 rounded-xl text-[13px] font-bold text-slate-300 hover:text-white hover:bg-white/5 px-6"
           >
             {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
               <CheckSquare size={16} className="mr-2.5 text-uni-400" />
             ) : (
               <Square size={16} className="mr-2.5" />
             )}
             {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
           </Button>
        </div>
      </div>

      {activeFilter && !['today', 'weekly', 'all', 'pending', 'vault', 'ready'].includes(activeFilter) && (
         <div className="flex items-center gap-4 px-2">
            <Badge className="bg-uni-500/10 text-uni-400 border-uni-500/20 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2">
              <Filter size={14} />
              Results for: "{activeFilter}"
            </Badge>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-uni-400 transition-colors"
            >
              Clear Filter ✕
            </button>
         </div>
      )}

      {/* Inventory Grid */}
      <div className="space-y-4">
      {filteredItems.length === 0 ? (
        <div className="py-24 text-center space-y-4 opacity-40">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto border border-white/5">
              <PlusCircle size={32} className="text-slate-700" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Empty Inventory</p>
              <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1">No reported items match your search criteria</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(item => (
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

      {/* Bulk Action Bar - Premium Float */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/90 border-t border-white/10 p-5 rounded-[2.5rem] flex items-center justify-between gap-8 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border-x border-b">
            <div className="flex items-center gap-5 pl-4">
               <div className="w-12 h-12 rounded-2xl bg-uni-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-uni-600/30">
                 {selectedIds.length}
               </div>
               <div className="text-left space-y-1">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Items Selected</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-uni-400"></span>
                    Management Mode Active
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
               {pendingIntakeIds.length > 0 && (
                 <Button 
                  onClick={() => {
                    handleBulkStatusUpdate(pendingIntakeIds, 'in_custody');
                    setSelectedIds([]);
                  }}
                  disabled={actionLoading === 'bulk'}
                  className="bg-uni-600 hover:bg-uni-700 text-white px-8 h-12 rounded-2xl font-black text-[9px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-uni-600/20 active:scale-95"
                 >
                   {actionLoading === 'bulk' ? 'Processing...' : (
                     <>
                        <PlusCircle size={14} className="mr-2.5" />
                        Secure {pendingIntakeIds.length} Items
                     </>
                   )}
                 </Button>
               )}
               
               <Button 
                variant="ghost"
                onClick={() => setSelectedIds([])}
                className="hover:bg-red-500/10 hover:text-red-400 text-slate-400 px-6 h-12 rounded-2xl font-black text-[9px] uppercase tracking-widest"
               >
                 Cancel
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
