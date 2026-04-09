import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import ZoneCatalog from './zone-builder/ZoneCatalog';
import ZoneCanvas from './zone-builder/ZoneCanvas';
import { Layout, Map, Settings2, ShieldCheck, Activity, ChevronRight, RefreshCw, PenTool } from "lucide-react";

/**
 * ZoneBuilderTab - Premium Professional (Pro Max)
 * - Refined workbench layout.
 * - Human-centric labels (No "Blueprint Workbench").
 * - Clean typography (No aggressive italics).
 */
const ZoneBuilderTab = ({ refreshTrigger, setIsSyncing }) => {
  const [zones, setZones] = useState([]);
  const [adjacencies, setAdjacencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  // Create Zone State
  const [newZone, setNewZone] = useState({ name: '', type: 'room', parent_zone_id: '' });
  
  // Create Edge State
  const [newEdge, setNewEdge] = useState({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
  
  // Canvas Transform State (Zoom/Pan)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [canvasMode, setCanvasMode] = useState('select'); // 'select', 'pan', 'link'
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [draggingZoneId, setDraggingZoneId] = useState(null);

  useEffect(() => {
    fetchGraphData();
  }, [refreshTrigger]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
        const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            if (canvasMode !== 'pan') setCanvasMode('pan');
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'v': setCanvasMode('select'); break;
            case 'c': 
                setCanvasMode('link'); 
                setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
                break;
            case 'escape':
                setSelectedEdge(null);
                setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
                if (canvasMode === 'link') setCanvasMode('select');
                break;
            default: break;
        }
    };

    const handleKeyUp = (e) => {
        const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

        if (e.code === 'Space') {
            e.preventDefault();
            setCanvasMode('select');
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    }
  }, [canvasMode]);

  const fetchGraphData = async () => {
    const isInitialLoad = zones.length === 0;
    if (isInitialLoad) setLoading(true);
    else setActionLoading(true);
    
    try {
      const [zonesRes, edgesRes] = await Promise.all([
        supabase.from('zones').select('*'),
        supabase.from('adjacencies').select('*')
      ]);

      if (zonesRes.error) throw zonesRes.error;
      if (edgesRes.error) throw edgesRes.error;

      setZones(zonesRes.data || []);
      setAdjacencies(edgesRes.data || []);
    } catch (err) {
      console.error('Failed to load map data', err);
    } finally {
      setLoading(false);
      setActionLoading(false);
    }
  };

  const updateZonePosition = async (zoneId, x, y) => {
    try {
      const { error } = await supabase
        .from('zones')
        .update({ pos_x: Math.round(x), pos_y: Math.round(y) })
        .eq('id', zoneId);

      if (error) throw error;
      setZones(prev => prev.map(z => z.id === zoneId ? { ...z, pos_x: x, pos_y: y } : z));
    } catch (err) {
      console.error('Failed to update zone position', err);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZone.name) return;
    
    setActionLoading(true);
    try {
      const payload = { ...newZone, pos_x: 0, pos_y: 0 };
      if (!payload.parent_zone_id) payload.parent_zone_id = null;
      else payload.parent_zone_id = parseInt(payload.parent_zone_id);

      const { error } = await supabase.from('zones').insert([payload]);
      if (error) throw error;

      setNewZone(prev => ({ ...prev, name: '' }));
      fetchGraphData();
    } catch (err) {
      console.error('Failed to create zone', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm("Delete this zone and all its path connections?")) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (error) throw error;
      fetchGraphData();
    } catch (err) {
      console.error('Failed to delete zone', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEdge = async (e, forceIds = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const zoneAId = forceIds ? forceIds.zone_a_id : newEdge.zone_a_id;
    const zoneBId = forceIds ? forceIds.zone_b_id : newEdge.zone_b_id;

    if (!zoneAId || !zoneBId) return;
    if (zoneAId === zoneBId) return;
    
    setActionLoading(true);
    try {
      let weight = parseInt(newEdge.distance_weight);
      const zA = zones.find(z => z.id === parseInt(zoneAId));
      const zB = zones.find(z => z.id === parseInt(zoneBId));
      
      if (zA && zB) {
        const dx = (zA.pos_x - zB.pos_x);
        const dy = (zA.pos_y - zB.pos_y);
        const dist = Math.sqrt(dx*dx + dy*dy);
        weight = Math.max(1, Math.min(10, Math.round(dist / 50)));
      }

      const { error } = await supabase.from('adjacencies').insert([{
        zone_a_id: parseInt(zoneAId),
        zone_b_id: parseInt(zoneBId),
        distance_weight: weight
      }]);

      if (error) throw error;
      setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
      fetchGraphData();
    } catch (err) {
      console.error('Failed to create path', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEdge = async (edgeId) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('adjacencies').delete().eq('id', edgeId);
      if (error) throw error;
      setSelectedEdge(null);
      fetchGraphData();
    } catch (err) {
      console.error('Failed to delete path', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-center mx-auto text-slate-700">
           <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Only administrators can manage the campus map.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  const handleCatalogDragStart = (e, zoneId) => {
    e.dataTransfer.setData("zoneId", zoneId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const zoneId = parseInt(e.dataTransfer.getData("zoneId"));
    if (!zoneId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = (clientX - transform.x) / transform.scale;
    const y = (clientY - transform.y) / transform.scale;
    
    updateZonePosition(zoneId, x, y);
  };

  const handleCanvasWheel = (e) => {
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = Math.max(0.2, Math.min(3, transform.scale * zoomFactor));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleZoom = (delta) => {
    const newScale = Math.max(0.2, Math.min(3, transform.scale * delta));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const resetTransform = () => setTransform({ x: 0, y: 0, scale: 1 });

  const handleCanvasMouseDown = (e) => {
    if (canvasMode === 'pan' && e.button === 0) {
        setIsPanning(true);
        e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
        setTransform(prev => ({
            ...prev,
            x: prev.x + e.movementX,
            y: prev.y + e.movementY
        }));
    }
  };

  const handleCanvasMouseUp = () => setIsPanning(false);

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDockZone = (e, zoneId) => {
    e.stopPropagation();
    updateZonePosition(zoneId, 0, 0);
  };

  const catalogZones = zones.filter(z => z.pos_x === 0 && z.pos_y === 0);
  const canvasZones = zones.filter(z => z.pos_x !== 0 || z.pos_y !== 0);

  return (
    <div className="bg-slate-950 min-h-[700px] rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
      <div className="absolute inset-0 bg-slate-900/[0.02] pointer-events-none"></div>
      
      {/* Workbench Header */}
      <header className="px-8 md:px-10 py-6 bg-slate-900/60 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-3xl">
        <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-uni-600 flex items-center justify-center text-white shadow-lg shadow-uni-600/20">
                    <PenTool size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest leading-none">
                      Campus Map Builder
                    </h2>
                    {actionLoading && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[10px] text-uni-400 font-bold uppercase tracking-widest">
                            <RefreshCw size={10} className="animate-spin" />
                            Syncing
                        </motion.span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Map Zones & Path Connections</p>
                </div>
            </div>
            
            <div className="h-8 w-px bg-white/5 hidden xl:block"></div>

            <nav className="hidden xl:flex items-center gap-10 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                <div className="flex items-center gap-3 text-uni-400">
                    <span className="w-5 h-5 rounded-lg border border-uni-500/30 flex items-center justify-center">1</span>
                    <span>Place Zones</span>
                </div>
                <ChevronRight size={14} className="opacity-20" />
                <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg border border-slate-800 flex items-center justify-center">2</span>
                    <span>Link Connections</span>
                </div>
            </nav>
        </div>

        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-white leading-none">{zones.length}</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Total Zones</span>
            </div>
            <div className="h-8 w-px bg-white/5"></div>
            <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-white leading-none">{adjacencies.length}</span>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Active Paths</span>
            </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <ZoneCatalog 
            actionLoading={actionLoading}
            newZone={newZone}
            setNewZone={setNewZone}
            handleCreateZone={handleCreateZone}
            zones={zones}
            catalogZones={catalogZones}
            handleCatalogDragStart={handleCatalogDragStart}
            handleDeleteZone={handleDeleteZone}
        />
        <ZoneCanvas 
            zones={zones}
            canvasZones={canvasZones}
            adjacencies={adjacencies}
            canvasMode={canvasMode}
            setCanvasMode={setCanvasMode}
            isPanning={isPanning}
            transform={transform}
            handleCanvasDrop={handleCanvasDrop}
            handleCanvasDragOver={handleCanvasDragOver}
            handleCanvasWheel={handleCanvasWheel}
            handleCanvasMouseDown={handleCanvasMouseDown}
            handleCanvasMouseMove={handleCanvasMouseMove}
            handleCanvasMouseUp={handleCanvasMouseUp}
            handleZoom={handleZoom}
            resetTransform={resetTransform}
            selectedEdge={selectedEdge}
            setSelectedEdge={setSelectedEdge}
            handleDeleteEdge={handleDeleteEdge}
            draggingZoneId={draggingZoneId}
            setDraggingZoneId={setDraggingZoneId}
            setZones={setZones}
            updateZonePosition={updateZonePosition}
            newEdge={newEdge}
            setNewEdge={setNewEdge}
            handleCreateEdge={handleCreateEdge}
            handleDockZone={handleDockZone}
            handleDeleteZone={handleDeleteZone}
        />
      </div>
    </div>
  );
};

export default ZoneBuilderTab;
