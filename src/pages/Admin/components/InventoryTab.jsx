import React, { useState, useMemo } from 'react';
import InventoryCard from './InventoryCard';
import { Filter, Search, XCircle, PlusCircle, Vault, Clock, HandHelping, ListFilter, Activity, ChevronRight, PackageSearch } from "lucide-react";
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
  onReviewItem
}) => {
  const filters = [
    { id: 'all', label: 'All Items', icon: ListFilter, color: 'hover:bg-white/5 border-white/5' },
    { id: 'pending', label: 'Needs Review', icon: Clock, color: 'hover:bg-amber-500/10 border-amber-500/10 text-amber-500' },
    { id: 'vault', label: 'In Storage', icon: Vault, color: 'hover:bg-uni-500/10 border-uni-500/10 text-uni-400' },
    { id: 'ready', label: 'Ready to Give', icon: HandHelping, color: 'hover:bg-green-500/10 border-green-500/10 text-green-400' }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Inventory Header & Navigation */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
           {/* Navigation - Mobile Scrollable */}
           <div className="flex flex-wrap items-center gap-2 pb-2">
              {filters.map(f => (
                <Button 
                  key={f.id}
                  variant={inventoryFilter === f.id ? "default" : "outline"}
                  onClick={() => {
                    setInventoryFilter(f.id);
                  }}
                  className={`h-10 md:h-12 rounded-xl text-[10px] md:text-[11px] font-bold tracking-tight transition-all px-4 md:px-6 shrink-0 border-white/5 shadow-xl ${
                    inventoryFilter === f.id 
                    ? "bg-uni-600 text-white hover:bg-uni-700 shadow-uni-600/20" 
                    : `bg-slate-900/40 text-slate-400 hover:text-white backdrop-blur-3xl`
                  }`}
                >
                  <f.icon size={12} className="mr-2" />
                  <span className="whitespace-nowrap uppercase tracking-wider">{f.label}</span>
                </Button>
              ))}
           </div>
        </div>

        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-uni-500"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {filteredItems.length} Total
              </p>
           </div>
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
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nothing found</p>
              <p className="text-[11px] text-slate-600 font-medium max-w-xs mx-auto">Try different filters or search terms.</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
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
                onReviewItem={onReviewItem}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      </div>
    </div>
  );
};

export default InventoryTab;
