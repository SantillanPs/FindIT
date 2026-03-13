import React, { useState } from 'react';
import { getZoneIcon } from './utils';

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
        <section className="w-[25%] min-w-[320px] border-r border-white/5 flex flex-col bg-slate-900/40">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Register New Place</h3>
                <form onSubmit={handleCreateZone} className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Place Name..." 
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                        value={newZone.name}
                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                        disabled={actionLoading}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-[10px] focus:border-emerald-500 outline-none cursor-pointer"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-[10px] focus:border-emerald-500 outline-none cursor-pointer"
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
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
                    >
                        {actionLoading ? "..." : "Add to Catalog"}
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Catalog List</h3>
                    <span className="text-[8px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {filteredCatalog.length} Unplaced
                    </span>
                </div>

                {/* FILTERS */}
                <div className="space-y-2 mb-6">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-700"></i>
                        <input 
                            type="text"
                            placeholder="Search catalog..."
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-white text-[10px] focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 text-white text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer focus:border-emerald-500/50"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="building">Buildings</option>
                            <option value="floor">Floors</option>
                            <option value="room">Rooms</option>
                            <option value="location">Locations</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredCatalog.length === 0 && (
                        <div className="text-center py-8 px-4 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                                {searchTerm || typeFilter !== 'all' ? "No matches found" : "No unplaced zones"}
                            </p>
                        </div>
                    )}
                    {filteredCatalog.map(zone => (
                        <div 
                            key={zone.id} 
                            draggable
                            onDragStart={(e) => handleCatalogDragStart(e, zone.id)}
                            className="group flex items-center justify-between bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] rounded-xl px-4 py-3 transition-all cursor-grab active:cursor-grabbing hover:border-emerald-500/30 select-none"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <i className={`fa-solid ${getZoneIcon(zone.type)} text-[10px] text-slate-600 group-hover:text-emerald-400`}></i>
                                <div className="truncate">
                                    <p className="text-white font-bold text-[11px] truncate">{zone.name}</p>
                                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{zone.type}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteZone(zone.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all"
                            >
                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ZoneCatalog;
