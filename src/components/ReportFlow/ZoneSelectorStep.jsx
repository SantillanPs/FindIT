import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

const ZoneSelectorStep = ({ 
  stepLabel, 
  title, 
  description, 
  formData, 
  setFormData, 
  onNext 
}) => {
  const [zonesTree, setZonesTree] = useState([]);
  const [zoneStats, setZoneStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Navigation State
  const [navigationPath, setNavigationPath] = useState([]); // Array of selected zone objects
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherLocation, setOtherLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, statsRes] = await Promise.all([
          apiClient.get('/zones'),
          apiClient.get('/zones/stats')
        ]);
        setZonesTree(zonesRes.data);
        setZoneStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch zone data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    let glow = 'group-hover:shadow-uni-500/20';
    let bg = 'bg-uni-500/5';

    if (name.includes('ict') || name.includes('engineering') || name.includes('cite') || name.includes('computer')) {
      icon = 'fa-microchip';
      color = 'text-cyan-400';
      glow = 'group-hover:shadow-cyan-500/30';
      bg = 'bg-cyan-500/10';
    } else if (name.includes('midwifery') || name.includes('medical') || name.includes('clinic') || name.includes('health')) {
      icon = 'fa-heart-pulse';
      color = 'text-rose-400';
      glow = 'group-hover:shadow-rose-500/30';
      bg = 'bg-rose-500/10';
    } else if (name.includes('gym') || name.includes('court') || name.includes('sports')) {
      icon = 'fa-dumbbell';
      color = 'text-orange-400';
      glow = 'group-hover:shadow-orange-500/30';
      bg = 'bg-orange-500/10';
    } else if (name.includes('canteen') || name.includes('food') || name.includes('cafe')) {
      icon = 'fa-utensils';
      color = 'text-amber-400';
      glow = 'group-hover:shadow-amber-500/30';
      bg = 'bg-amber-500/10';
    } else if (name.includes('law') || name.includes('justice')) {
      icon = 'fa-scale-balanced';
      color = 'text-slate-400';
      glow = 'group-hover:shadow-slate-500/30';
      bg = 'bg-slate-500/10';
    } else if (name.includes('library')) {
      icon = 'fa-book';
      color = 'text-emerald-400';
      glow = 'group-hover:shadow-emerald-500/30';
      bg = 'bg-emerald-500/10';
    } else if (name.includes('cas') || name.includes('science') || name.includes('lab')) {
      icon = 'fa-flask';
      color = 'text-purple-400';
      glow = 'group-hover:shadow-purple-500/30';
      bg = 'bg-purple-500/10';
    } else if (name.includes('cbm') || name.includes('business') || name.includes('admin')) {
      icon = 'fa-briefcase';
      color = 'text-blue-400';
      glow = 'group-hover:shadow-blue-500/30';
      bg = 'bg-blue-500/10';
    } else if (name.includes('cte') || name.includes('education') || name.includes('teaching')) {
      icon = 'fa-apple-whole';
      color = 'text-yellow-400';
      glow = 'group-hover:shadow-yellow-500/30';
      bg = 'bg-yellow-500/10';
    } else if (name.includes('graduate') || name.includes('research')) {
      icon = 'fa-graduation-cap';
      color = 'text-indigo-400';
      glow = 'group-hover:shadow-indigo-500/30';
      bg = 'bg-indigo-500/10';
    } else if (type === 'outdoor' || name.includes('quad') || name.includes('field')) {
      icon = 'fa-tree';
      color = 'text-green-400';
      glow = 'group-hover:shadow-green-500/30';
      bg = 'bg-green-500/10';
    } else if (type === 'building' || name.includes('building')) {
      icon = 'fa-university';
    }

    return { icon, color, glow, bg };
  };

  const handleZoneSelect = (zone) => {
    const newPath = [...navigationPath, zone];
    setNavigationPath(newPath);
    
    // Update form data with the full breadcrumb path
    const fullPath = newPath.map(z => z.name).join(' - ');
    setFormData({
      ...formData,
      zone_id: zone.id,
      location_zone: fullPath
    });

    // If no children, it's a leaf node, proceed
    if (!zone.children || zone.children.length === 0) {
      setTimeout(onNext, 400);
    }
  };

  const goBack = () => {
    if (showOtherInput) {
      setShowOtherInput(false);
      return;
    }
    const newPath = navigationPath.slice(0, -1);
    setNavigationPath(newPath);
    
    if (newPath.length > 0) {
      const lastZone = newPath[newPath.length - 1];
      const fullPath = newPath.map(z => z.name).join(' - ');
      setFormData({
        ...formData,
        zone_id: lastZone.id,
        location_zone: fullPath
      });
    } else {
      setFormData({
        ...formData,
        zone_id: null,
        location_zone: ''
      });
    }
  };

  const handleManualEntry = () => {
    setFormData({
      ...formData,
      zone_id: null,
      location_zone: otherLocation
    });
    onNext();
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

      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumbs / Back button */}
        {(navigationPath.length > 0 || showOtherInput) && (
          <div className="flex items-center justify-between px-4">
            <button 
              onClick={goBack}
              className="px-6 py-2 rounded-full bg-white/5 text-[10px] font-black text-uni-400 uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Back
            </button>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {navigationPath.map((z, idx) => (
                <React.Fragment key={z.id}>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{z.name}</span>
                  {idx < navigationPath.length - 1 && <span className="text-slate-700 text-[10px]">/</span>}
                </React.Fragment>
              ))}
            </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {featuredZones.map((zone) => {
                  const theme = getZoneTheme(zone);
                  const isSelected = formData.zone_id === zone.id;
                  
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone)}
                      className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-6 group relative overflow-hidden h-[200px] shadow-xl ${
                        isSelected 
                          ? `${theme.bg.replace('/10', '/30')} border-white/20 text-white ring-2 ring-white/10` 
                          : `bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:scale-[1.02] active:scale-95 ${theme.bg}`
                      } ${theme.glow}`}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-[40px] -z-10 ${theme.bg.replace('/10', '/5')}`}></div>
                      
                      <div className={`text-5xl transition-all duration-500 group-hover:scale-110 ${isSelected ? 'scale-110' : ''} ${theme.color}`}>
                        <i className={`fa-solid ${theme.icon}`}></i>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center block px-2 leading-tight group-hover:text-white transition-colors">{zone.name}</span>
                        {zone.children?.length > 0 && (
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
                          const isSelected = formData.zone_id === zone.id;
                          
                          return (
                            <button
                              key={zone.id}
                              onClick={() => handleZoneSelect(zone)}
                              className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${
                                isSelected 
                                  ? 'bg-uni-500 border-white/20 text-white shadow-xl' 
                                  : `bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 ${theme.bg}`
                              }`}
                            >
                              <i className={`fa-solid ${theme.icon} text-2xl group-hover:scale-110 transition-transform ${theme.color}`}></i>
                              <span className="text-[9px] font-black uppercase tracking-widest">{zone.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Other option at the end of the root list */}
              {navigationPath.length === 0 && (
                <div className="pt-6">
                  <button
                    onClick={() => setShowOtherInput(true)}
                    className="p-10 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 text-slate-500 hover:border-uni-500/50 hover:text-white transition-all flex flex-col items-center justify-center gap-6 group h-[200px] w-full"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-map-pin"></i>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em]">Other Location</p>
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
              className="max-w-2xl mx-auto w-full glass-panel p-12 rounded-[3rem] border border-white/5 space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto text-3xl text-uni-400 border border-uni-500/20">📍</div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Where exactly?</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Type the building, room, or specific area name.</p>
              </div>

              <input 
                type="text"
                placeholder="e.g. Near the Law Faculty bench..."
                className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-xl font-black text-white text-center focus:border-uni-500 transition-all outline-none placeholder:text-slate-800"
                value={otherLocation}
                onChange={(e) => setOtherLocation(e.target.value)}
                autoFocus
              />

              <button 
                onClick={handleManualEntry}
                disabled={!otherLocation || otherLocation.length < 3}
                className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 hover:bg-uni-500 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                Confirm Location →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Indicator for leaf nodes that didn't auto-proceed */}
        {navigationPath.length > 0 && sortedCurrentZones.length > 0 && !showOtherInput && (
          <div className="pt-8">
            <button 
              onClick={onNext}
              className="px-12 py-5 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-xl"
            >
              Confirm Selection →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneSelectorStep;
