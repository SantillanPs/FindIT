import React, { useState, useMemo } from 'react';
import InventoryCard from './InventoryCard';

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
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const pendingIntakeIds = useMemo(() => 
    selectedIds.filter(id => filteredItems.find(i => i.id === id)?.status === 'reported'),
    [selectedIds, filteredItems]
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Inventory Filter Nav */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6 overflow-x-auto scrollbar-hide">
         {[
           { id: 'all', label: 'Complete Catalog', icon: 'fa-list-ul', color: 'uni' },
           { id: 'pending', label: 'Discovery Pending', icon: 'fa-clock', color: 'amber' },
           { id: 'vault', label: 'In Office Vault', icon: 'fa-vault', color: 'sky' },
           { id: 'ready', label: 'Ready for Release', icon: 'fa-hand-holding-heart', color: 'green' }
         ].map(f => (
           <button 
             key={f.id}
             onClick={() => {
               setInventoryFilter(f.id);
               setSelectedIds([]);
             }}
             className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
               inventoryFilter === f.id 
               ? `bg-${f.color}-600 text-white border-2 border-${f.color}-400/50` 
               : `bg-white/5 text-slate-400 border-2 border-${f.color}-500/10 hover:text-white hover:bg-white/10 hover:border-${f.color}-500/40`
             }`}
           >
             <i className={`fa-solid ${f.icon} text-[12px]`}></i>
             {f.label}
           </button>
         ))}
         
         <div className="ml-auto pl-4 border-l border-white/5">
            <button 
              onClick={selectAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <i className={`fa-solid ${selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'fa-check-square' : 'fa-square'} text-[11px]`}></i>
              {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
         </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-uni-400 text-slate-500">
          <i className="fa-solid fa-magnifying-glass text-xs"></i>
        </div>
        <input 
          type="text"
          value={activeFilter === 'today' || activeFilter === 'weekly' ? '' : activeFilter}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="SEARCH BY ITEM NAME, ID, OR LOCATION..."
          className="w-full bg-slate-900/50 border-2 border-white/10 focus:border-uni-500/50 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none transition-all focus:bg-slate-900/80"
        />
        {activeFilter && !['today', 'weekly'].includes(activeFilter) && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-5 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-circle-xmark text-xs"></i>
          </button>
        )}
      </div>

       {activeFilter && (
          <div className="bg-uni-500/10 border border-uni-500/20 rounded-xl p-4 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <i className={`fa-solid ${activeFilter === 'today' ? 'fa-calendar-day' : activeFilter === 'weekly' ? 'fa-calendar-week' : 'fa-search'} text-uni-400 text-xs`}></i>
              <span className="text-[12px] font-black text-white uppercase tracking-widest">
                {activeFilter === 'today' ? 'Showing items from Today' : 
                 activeFilter === 'weekly' ? 'Showing items from this Week' : 
                 `Showing results for "${activeFilter}"`}
              </span>
            </div>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[9px] font-black text-uni-400 uppercase tracking-widest hover:underline"
            >
              Clear Filter ✕
            </button>
          </div>
       )}

      <div className="space-y-4">
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center opacity-50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Empty Inventory</p>
            <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest text-center mt-2">No reported items match your search criteria</p>
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 pointer-events-none">
          <div className="glass-panel bg-slate-900/90 border-t-2 border-uni-500/30 p-4 rounded-[2rem] pointer-events-auto flex items-center justify-between gap-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 pl-4">
               <div className="w-10 h-10 rounded-xl bg-uni-500 flex items-center justify-center text-white font-black text-sm">
                 {selectedIds.length}
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Items Selected</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management Mode Active</p>
               </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
               {pendingIntakeIds.length > 0 && (
                 <button 
                  onClick={() => {
                    handleBulkStatusUpdate(pendingIntakeIds, 'in_custody');
                    setSelectedIds([]);
                  }}
                  disabled={actionLoading === 'bulk'}
                  className="bg-uni-600 hover:bg-uni-500 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-3"
                 >
                   {actionLoading === 'bulk' ? 'Processing...' : (
                     <>
                        <i className="fa-solid fa-plus-circle"></i>
                        Secure {pendingIntakeIds.length} Reported Items
                     </>
                   )}
                 </button>
               )}
               
               <button 
                onClick={() => setSelectedIds([])}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
