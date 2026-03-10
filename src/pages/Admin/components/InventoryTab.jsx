import React from 'react';
import InventoryCard from './InventoryCard';

const InventoryTab = ({ 
  inventoryFilter, 
  setInventoryFilter, 
  filteredItems, 
  matches, 
  pendingClaims, 
  navigate, 
  setSearchTerm, 
  handleStatusUpdate,
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading,
  activeFilter
}) => {
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
             onClick={() => setInventoryFilter(f.id)}
             className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
               inventoryFilter === f.id 
               ? `bg-${f.color}-600 text-white shadow-lg shadow-${f.color}-600/20` 
               : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
             }`}
           >
             <i className={`fa-solid ${f.icon} text-[10px]`}></i>
             {f.label}
           </button>
         ))}
      </div>
       {['today', 'weekly'].includes(activeFilter) && (
          <div className="bg-uni-500/10 border border-uni-500/20 rounded-xl p-4 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-calendar-day text-uni-400"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Showing items from {activeFilter === 'today' ? 'Today' : 'this Week'}
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
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default InventoryTab;
