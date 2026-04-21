import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const ZoneSelectorStep = ({ 
  stepLabel, 
  title, 
  description, 
  formData, 
  setFormData, 
  onNext,
  multiSelect = false,
  aiHints = []
}) => {
  const [zonesTree, setZonesTree] = useState([]);
  const [zoneStats, setZoneStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Navigation State
  const [navigationPath, setNavigationPath] = useState([]); // Array of selected zone objects for navigation/drilling down
  const [selectedZones, setSelectedZones] = useState([]); // Array of {id, name} objects for the "Trace Your Steps" feature
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherLocation, setOtherLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all zones
        const { data: allZones, error: zonesError } = await supabase
          .from('zones')
          .select('*');
        
        if (zonesError) throw zonesError;

        // 2. Fetch zone stats (hit counts from found_items)
        const { data: statsData, error: statsError } = await supabase
          .from('found_items')
          .select('zone_id');
        
        if (statsError) throw statsError;

        // Build stats map
        const statsMap = (statsData || []).reduce((acc, item) => {
          if (item.zone_id) {
            acc[item.zone_id] = (acc[item.zone_id] || 0) + 1;
          }
          return acc;
        }, {});

        const formattedStats = Object.keys(statsMap).map(id => ({
          zone_id: parseInt(id),
          hit_count: statsMap[id]
        }));
        setZoneStats(formattedStats);

        // 3. Build tree
        const buildTree = (nodes, parentId = null) => {
          return nodes
            .filter(node => node.parent_zone_id === parentId)
            .map(node => ({
              ...node,
              children: buildTree(nodes, node.id)
            }));
        };

        const tree = buildTree(allZones || []);
        setZonesTree(tree);

      } catch (err) {
        console.error("Failed to fetch zone data from Supabase", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Initialize selectedZones from formData if they exist
    if (formData.potential_zone_ids?.length > 0 && formData.location) {
        const names = formData.location.split(', ');
        const initial = formData.potential_zone_ids.map((id, i) => ({
            id,
            name: names[i] || 'Unknown Location'
        }));
        setSelectedZones(initial);
    }
  }, []);

  // Determine current display list based on navigation path and sort by stats
  const sortedCurrentZones = useMemo(() => {
    let baseZones = [];
    if (navigationPath.length === 0) {
      baseZones = zonesTree;
    } else {
      const current = navigationPath[navigationPath.length - 1];
      baseZones = current.children || [];
    }

    const statsMap = zoneStats.reduce((acc, curr) => ({
      ...acc, [curr.zone_id]: curr.hit_count
    }), {});

    return [...baseZones].sort((a, b) => (statsMap[b.id] || 0) - (statsMap[a.id] || 0));
  }, [navigationPath, zonesTree, zoneStats]);

  const featuredZones = useMemo(() => sortedCurrentZones.slice(0, 6), [sortedCurrentZones]);
  const hiddenZones = useMemo(() => sortedCurrentZones.slice(6), [sortedCurrentZones]);

  const getZoneTheme = (zone) => {
    const name = zone.name.toLowerCase();
    const type = zone.type.toLowerCase();

    // Icon Mapping
    let icon = 'fa-location-dot';
    let color = 'text-uni-400';
    let glow = '';
    let bg = 'bg-uni-500/5';

    if (name.includes('ict') || name.includes('engineering') || name.includes('cite') || name.includes('computer')) {
      icon = 'fa-microchip';
      color = 'text-cyan-400';
      bg = 'bg-cyan-500/10';
    } else if (name.includes('midwifery') || name.includes('medical') || name.includes('clinic') || name.includes('health')) {
      icon = 'fa-heart-pulse';
      color = 'text-rose-400';
      bg = 'bg-rose-500/10';
    } else if (name.includes('gym') || name.includes('court') || name.includes('sports')) {
      icon = 'fa-dumbbell';
      color = 'text-orange-400';
      bg = 'bg-orange-500/10';
    } else if (name.includes('canteen') || name.includes('food') || name.includes('cafe')) {
      icon = 'fa-utensils';
      color = 'text-amber-400';
      bg = 'bg-amber-500/10';
    } else if (name.includes('law') || name.includes('justice')) {
      icon = 'fa-scale-balanced';
      color = 'text-slate-400';
      bg = 'bg-slate-500/10';
    } else if (name.includes('library')) {
      icon = 'fa-book';
      color = 'text-emerald-400';
      bg = 'bg-emerald-500/10';
    } else if (name.includes('cas') || name.includes('science') || name.includes('lab')) {
      icon = 'fa-flask';
      color = 'text-purple-400';
      bg = 'bg-purple-500/10';
    } else if (name.includes('cbm') || name.includes('business') || name.includes('admin')) {
      icon = 'fa-briefcase';
      color = 'text-blue-400';
      bg = 'bg-blue-500/10';
    } else if (name.includes('cte') || name.includes('education') || name.includes('teaching')) {
      icon = 'fa-apple-whole';
      color = 'text-yellow-400';
      bg = 'bg-yellow-500/10';
    } else if (name.includes('graduate') || name.includes('research')) {
      icon = 'fa-graduation-cap';
      color = 'text-indigo-400';
      bg = 'bg-indigo-500/10';
    } else if (type === 'outdoor' || name.includes('quad') || name.includes('field')) {
      icon = 'fa-tree';
      color = 'text-green-400';
      bg = 'bg-green-500/10';
    } else if (type === 'building' || name.includes('building')) {
      icon = 'fa-university';
    }

    return { icon, color, glow, bg };
  };

  const handleZoneSelect = (zone) => {
    // 1. If it has children, just drill down (same for both modes)
    if (zone.children && zone.children.length > 0) {
        setNavigationPath([...navigationPath, zone]);
        return;
    }

    // 2. Behavioral split based on multiSelect
    if (!multiSelect) {
        // Found Item flow (or single select mode): 
        // Just set the data and move to the next step
        const fullName = [...navigationPath.map(p => p.name), zone.name].join(' - ');
        setFormData({
            ...formData,
            location: fullName,
            zone_id: zone.id,
            potential_zone_ids: [zone.id] // Keep array for backend consistency
        });
        setTimeout(onNext, 400); // Slight delay for feedback
    } else {
        // Lost Report flow (Multi-selection / Tracing steps):
        if (!selectedZones.find(z => z.id === zone.id)) {
            const fullName = [...navigationPath.map(p => p.name), zone.name].join(' - ');
            const newSelected = [...selectedZones, { id: zone.id, name: fullName }];
            setSelectedZones(newSelected);
            
            // Sync to formData
            setFormData({
                ...formData,
                potential_zone_ids: newSelected.map(z => z.id),
                location: newSelected.map(z => z.name).join(', '),
                zone_id: newSelected[0]?.id || null
            });
        }
        // Reset navigation to root for potentially adding another "step"
        setNavigationPath([]);
    }
  };

  const handleSelectCurrentArea = () => {
    const parent = navigationPath[navigationPath.length - 1];
    if (!parent) return;

    const fullName = navigationPath.map(p => p.name).join(' - ');
    
    // Resolve all child IDs for matching engine coverage (including parent itself)
    const getAllChildIds = (node) => {
        let ids = [node.id];
        if (node.children) {
            node.children.forEach(child => {
                ids = [...ids, ...getAllChildIds(child)];
            });
        }
        return ids;
    };
    const allRelevantIds = getAllChildIds(parent);

    if (!multiSelect) {
        setFormData({
            ...formData,
            location: fullName,
            zone_id: parent.id,
            potential_zone_ids: allRelevantIds
        });
        setTimeout(onNext, 400);
    } else {
        if (!selectedZones.find(z => z.id === parent.id)) {
            const newSelected = [...selectedZones, { id: parent.id, name: fullName }];
            setSelectedZones(newSelected);
            
            // Sync to formData with expanded IDs for the entire area
            setFormData({
                ...formData,
                // We flatten all potential zones from all selected steps
                potential_zone_ids: Array.from(new Set([
                    ...formData.potential_zone_ids, 
                    ...allRelevantIds
                ])),
                location: newSelected.map(z => z.name).join(', '),
                zone_id: newSelected[0]?.id || parent.id
            });
        }
        setNavigationPath([]);
    }
  };

  const removeSelectedZone = (id) => {
    const newSelected = selectedZones.filter(z => z.id !== id);
    setSelectedZones(newSelected);
    setFormData({
        ...formData,
        potential_zone_ids: newSelected.map(z => z.id),
        location: newSelected.map(z => z.name).join(', '),
        zone_id: newSelected[0]?.id || null
    });
  };

  const goBack = () => {
    if (showOtherInput) {
      setShowOtherInput(false);
      return;
    }
    const newPath = navigationPath.slice(0, -1);
    setNavigationPath(newPath);
  };

  const handleManualEntry = () => {
    // 1. Prepare the location entry name
    const manualLocationName = `Manual: ${otherLocation}`;
    
    if (!multiSelect) {
        // Single Select (Found Item Flow): Set data and go next
        setFormData({
            ...formData,
            location: manualLocationName,
            zone_id: null, // manual entry has no zone ID
            potential_zone_ids: []
        });
        onNext();
    } else {
        // Multi-select (Lost Report Flow): Add to the path
        const newSelected = [...selectedZones, { id: null, name: manualLocationName }];
        setSelectedZones(newSelected);
        setFormData({
          ...formData,
          location: newSelected.map(z => z.name).join(', '),
          potential_zone_ids: newSelected.map(z => z.id).filter(id => id !== null)
        });
    }
    
    setOtherLocation('');
    setShowOtherInput(false);
  };

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-uni-500/10 border border-uni-500/20 text-[10px] font-black text-uni-400 uppercase tracking-widest mb-2 italic">{stepLabel}</span>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">{title}</h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">{description}</p>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Selected Locations Sidebar (Tracing Steps) - Only for Multi-select */}
        {multiSelect && (
            <div className="w-full md:w-72 shrink-0 space-y-6 text-left">
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <i className="fa-solid fa-shoe-prints text-uni-400 text-sm transform -rotate-90"></i>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Your Path</h3>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                        <AnimatePresence initial={false}>
                            {selectedZones.length === 0 ? (
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic py-4">No locations added yet...</p>
                            ) : (
                                selectedZones.map((z, i) => (
                                    <motion.div 
                                        key={z.id || i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="p-4 bg-white/5 rounded-2xl border border-white/5 group flex items-center justify-between gap-3"
                                    >
                                        <div className="flex-grow">
                                            <p className="text-[8px] font-black text-slate-600 mb-0.5 uppercase tracking-tighter italic">Step {i + 1}</p>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">{z.name}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeSelectedZone(z.id)}
                                            className="w-6 h-6 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors flex items-center justify-center"
                                        >
                                            <i className="fa-solid fa-xmark text-[10px]"></i>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
    
                    {selectedZones.length > 0 && (
                        <button 
                            onClick={onNext}
                            className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-uni-400 hover:text-white transition-all active:scale-95 border border-black/5"
                        >
                            Confirm Path →
                        </button>
                    )}
                </div>
    
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] grayscale-[0.5]">
                    <p className="text-[9px] font-bold text-blue-400/60 leading-relaxed uppercase tracking-widest">
                        Tip: Add multiple locations to trace your steps. This helps our AI narrow down where your item might be!
                    </p>
                </div>
            </div>
        )}

        {/* Main Selection Area */}
        <div className="flex-grow w-full space-y-8">
            {/* Navigation Breadcrumbs / Back button */}
            {(navigationPath.length > 0 || showOtherInput) && (
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={goBack}
                        className="px-6 py-2 rounded-full bg-white/5 text-[10px] font-black text-uni-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group"
                    >
                        <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        Back
                    </button>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-[200px] md:max-w-md">
                        {navigationPath.map((z, idx) => (
                            <React.Fragment key={z.id}>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{z.name}</span>
                            {idx < navigationPath.length - 1 && <span className="text-slate-700 text-[10px]">/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Option B: Fast-Path Parent Selection */}
                {navigationPath.length > 0 && !showOtherInput && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={handleSelectCurrentArea}
                        className="px-6 py-2 rounded-full bg-uni-500 text-[10px] font-black text-white uppercase tracking-widest hover:bg-uni-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(var(--uni-500-rgb),0.3)]"
                    >
                        <i className="fa-solid fa-check"></i>
                        Confirm {navigationPath[navigationPath.length - 1].name}
                    </motion.button>
                )}
            </div>
            )}

            <AnimatePresence mode="wait">
            {!showOtherInput ? (
                <motion.div 
                key={navigationPath.length}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                >
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {featuredZones.map((zone) => {
                    const theme = getZoneTheme(zone);
                    const isPicked = selectedZones.find(s => s.id === zone.id);
                    const isHinted = aiHints.some(hint => 
                        zone.name.toLowerCase().includes(hint.toLowerCase()) || 
                        hint.toLowerCase().includes(zone.name.toLowerCase())
                    );
                    
                    return (
                        <button
                        key={zone.id}
                        onClick={() => handleZoneSelect(zone)}
                        className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-4 group relative overflow-hidden h-[180px] ${
                            isPicked 
                            ? `border-uni-500/50 bg-uni-500/10 text-white` 
                            : isHinted
                            ? `border-blue-500/30 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-slate-400 hover:border-blue-500/50 hover:scale-[1.02]`
                            : `bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:scale-[1.02] active:scale-95 ${theme.bg}`
                        } ${theme.glow}`}
                        >
                        {isPicked && (
                            <div className="absolute top-4 right-4 text-uni-400">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                        )}
                        {isHinted && !isPicked && (
                            <div className="absolute top-4 right-4 text-blue-400 animate-pulse">
                                <i className="fa-solid fa-sparkles"></i>
                            </div>
                        )}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10 ${isHinted ? 'bg-blue-500/5' : theme.bg.replace('/10', '/5')}`}></div>
                        
                        <div className={`text-5xl transition-all duration-500 group-hover:scale-110 ${isPicked ? 'scale-110 text-uni-400' : isHinted ? 'text-blue-400' : theme.color}`}>
                            <i className={`fa-solid ${theme.icon}`}></i>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center block px-2 leading-tight group-hover:text-white transition-colors">{zone.name}</span>
                            {isHinted && !isPicked && (
                                <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest block italic animate-pulse">Story Hint</span>
                            )}
                            {zone.children?.length > 0 && !isHinted && (
                                <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest block">{zone.children.length} sub-areas</span>
                            )}
                        </div>
                        </button>
                    );
                    })}
                </div>

                {hiddenZones.length > 0 && (
                    <div className="space-y-6 pt-4">
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-4 text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-all bg-white/5 rounded-2xl border border-white/10"
                    >
                        {showAll ? '− Show Simple View' : `+ Show All (${hiddenZones.length} More)`}
                    </button>

                    <AnimatePresence>
                        {showAll && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 overflow-hidden pb-10"
                        >
                            {hiddenZones.map((zone) => {
                            const theme = getZoneTheme(zone);
                            const isPicked = selectedZones.find(s => s.id === zone.id);
                            
                            return (
                                <button
                                key={zone.id}
                                onClick={() => handleZoneSelect(zone)}
                                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${
                                    isPicked 
                                    ? 'bg-uni-500/20 border-uni-500/40 text-white' 
                                    : `bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 ${theme.bg}`
                                }`}
                                >
                                <i className={`fa-solid ${theme.icon} text-2xl group-hover:scale-110 transition-transform ${isPicked ? 'text-uni-400' : theme.color}`}></i>
                                <span className="text-[9px] font-black uppercase tracking-widest">{zone.name}</span>
                                </button>
                            );
                            })}
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                )}

                {/* Other option */}
                {navigationPath.length === 0 && (
                    <div className="pt-6">
                    <button
                        onClick={() => setShowOtherInput(true)}
                        className="p-10 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 text-slate-500 hover:border-uni-500/50 hover:text-white transition-all flex flex-col items-center justify-center gap-6 group h-[180px] w-full"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-map-pin"></i>
                        </div>
                        <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Other Area</p>
                        <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-1">Manual Entry</p>
                        </div>
                    </button>
                    </div>
                )}
                </motion.div>
            ) : (
                <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full glass-panel p-12 rounded-[3rem] border border-white/5 space-y-8"
                >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto text-3xl text-uni-400 border border-uni-500/20">
                        <i className="fas fa-location-crosshairs"></i>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                        {multiSelect ? 'Trace this step' : 'Pin your discovery'}
                    </h3>
                    <label 
                        htmlFor="manual-location-input"
                        className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed block"
                    >
                        {multiSelect 
                            ? 'Type the building, room, or specific area you passed by.' 
                            : 'Specify exactly where you found the item (e.g., under the library stairs).'}
                    </label>
                </div>

                <input 
                    id="manual-location-input"
                    name="manual-location"
                    type="text"
                    placeholder={multiSelect ? "e.g. Near the Law Faculty bench..." : "e.g. Center lobby, near the water fountain..."}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-xl font-black text-white text-center focus:border-uni-500 transition-all outline-none placeholder:text-slate-800"
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    autoFocus
                />

                <button 
                    onClick={handleManualEntry}
                    disabled={!otherLocation || otherLocation.length < 3}
                    className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-uni-500 hover:text-white transition-all active:scale-95 border border-black/5"
                >
                    {multiSelect ? 'Add to Path →' : 'Confirm Location →'}
                </button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ZoneSelectorStep;
