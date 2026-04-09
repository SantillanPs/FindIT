import React, { useState } from 'react';
import { getZoneIcon } from './utils';
import { Search, Plus, Filter, Package, Trash2, MapPin } from 'lucide-react';

/**
 * ZoneCatalog - Premium Professional (Pro Max)
 * - Refined glassmorphism side panel.
 * - Human-centric labels (No "Register Place").
 * - Clean, professional typography.
 */
const ZoneCatalog = ({
    actionLoading,
    newZone,
    setNewZone,
    handleCreateZone,
    zones,
    catalogZones,
    handleCatalogDragStart,
    handleDeleteZone
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredCatalog = catalogZones.filter(zone => {
        const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || zone.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <section className="w-[30%] min-w-[340px] border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-3xl">
            {/* 1. Zone Creation Form */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-[10px] font-bold text-uni-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Plus size={12} /> Add New Zone
                </h3>
                <form onSubmit={handleCreateZone} className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Zone Name (e.g., Library G/F)" 
                        required
                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white text-xs focus:border-uni-500/50 outline-none transition-all placeholder:text-slate-700"
                        value={newZone.name}
                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                        disabled={actionLoading}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-white text-[10px] font-bold uppercase tracking-widest focus:border-uni-500/50 outline-none cursor-pointer appearance-none"
                            value={newZone.type}
                            onChange={(e) => setNewZone({...newZone, type: e.target.value})}
                            disabled={actionLoading}
                        >
                            <option value="building">Building</option>
                            <option value="floor">Floor</option>
                            <option value="room">Room</option>
                            <option value="hallway">Hallway</option>
                            <option value="outdoor">Outdoor</option>
                        </select>
                        <select
                            className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-white text-[10px] font-bold uppercase tracking-widest focus:border-uni-500/50 outline-none cursor-pointer appearance-none"
                            value={newZone.parent_zone_id}
                            onChange={(e) => setNewZone({...newZone, parent_zone_id: e.target.value})}
                            disabled={actionLoading}
                        >
                            <option value="">No Parent</option>
                            {zones.filter(z => ['building', 'floor', 'hallway'].includes(z.type)).map(z => (
                                <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        disabled={actionLoading} 
                        className="w-full bg-white text-slate-950 hover:bg-uni-600 hover:text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                    >
                        {actionLoading ? "Processing..." : "Create Zone"}
                    </button>
                </form>
            </div>

            {/* 2. Search & Catalog List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unplaced Zones</h3>
                        <span className="text-[9px] font-bold text-slate-200 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                            {filteredCatalog.length} Total
                        </span>
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input 
                            type="text"
                            placeholder="Find in catalog..."
                            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-[11px] focus:border-uni-500/30 outline-none transition-all placeholder:text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredCatalog.length === 0 && (
                        <div className="text-center py-10 px-4 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                            <Package size={24} className="mx-auto text-slate-800 mb-3" />
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                {searchTerm || typeFilter !== 'all' ? "No matches found" : "Ready to populate map"}
                            </p>
                        </div>
                    )}
                    {filteredCatalog.map(zone => (
                        <div 
                            key={zone.id} 
                            draggable
                            onDragStart={(e) => handleCatalogDragStart(e, zone.id)}
                            className="group flex items-center justify-between bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-uni-500/30 rounded-xl px-4 py-4 transition-all cursor-grab active:cursor-grabbing select-none"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-uni-400 group-hover:bg-slate-800 transition-all">
                                    <i className={`fa-solid ${getZoneIcon(zone.type)} text-[10px]`}></i>
                                </div>
                                <div className="truncate">
                                    <p className="text-white font-bold text-[13px] truncate tracking-tight">{zone.name}</p>
                                    <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest mt-0.5">{zone.type}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteZone(zone.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ZoneCatalog;
