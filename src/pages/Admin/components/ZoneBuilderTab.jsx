import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import ZoneCatalog from './zone-builder/ZoneCatalog';
import ZoneCanvas from './zone-builder/ZoneCanvas';

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
        // Ignore if typing in an input
        const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
        
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent page scroll
            if (canvasMode !== 'pan') {
                setCanvasMode('pan');
            }
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
        apiClient.get('/admin/zones/all'),
        apiClient.get('/admin/adjacencies/all')
      ]);
      setZones(zonesRes.data);
      setAdjacencies(edgesRes.data);
    } catch (err) {
      console.error('Failed to load map graph data', err);
    } finally {
      setLoading(false);
      setActionLoading(false);
    }
  };

  const updateZonePosition = async (zoneId, x, y) => {
    try {
      await apiClient.put(`/admin/zones/${zoneId}`, { 
        pos_x: Math.round(x), 
        pos_y: Math.round(y) 
      });
      // Update local state for immediate feedback
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
      const payload = { 
        ...newZone,
        // Default new zones to (0,0) so they stay in catalog
        pos_x: 0,
        pos_y: 0
      };
      if (!payload.parent_zone_id) payload.parent_zone_id = null;
      else payload.parent_zone_id = parseInt(payload.parent_zone_id);

      await apiClient.post('/admin/zones', payload);
      setNewZone(prev => ({ ...prev, name: '' }));
      fetchGraphData();
    } catch (err) {
      console.error('Failed to create zone', err);
      alert(err.response?.data?.detail || "Failed to create place");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm("Remove this place? This will also disconnect any pathways attached to it.")) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/zones/${id}`);
      fetchGraphData();
    } catch (err) {
      console.error('Failed to delete zone', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEdge = async (e, forceIds = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Use forced IDs (from direct interaction) or state IDs (from form)
    const zoneAId = forceIds ? forceIds.zone_a_id : newEdge.zone_a_id;
    const zoneBId = forceIds ? forceIds.zone_b_id : newEdge.zone_b_id;

    if (!zoneAId || !zoneBId) return;
    if (zoneAId === zoneBId) return;
    
    setActionLoading(true);
    try {
      // Auto-calculate weight based on distance
      let weight = parseInt(newEdge.distance_weight);
      const zA = zones.find(z => z.id === parseInt(zoneAId));
      const zB = zones.find(z => z.id === parseInt(zoneBId));
      
      if (zA && zB) {
        const dx = (zA.pos_x - zB.pos_x);
        const dy = (zA.pos_y - zB.pos_y);
        const dist = Math.sqrt(dx*dx + dy*dy);
        weight = Math.max(1, Math.min(10, Math.round(dist / 50)));
      }

      await apiClient.post('/admin/adjacencies', {
        zone_a_id: parseInt(zoneAId),
        zone_b_id: parseInt(zoneBId),
        distance_weight: weight
      });
      setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
      fetchGraphData();
    } catch (err) {
      console.error('Failed to create pathway', err);
    } finally {
      setActionLoading(false);
    }
  };

    // Extracted util functions to utils.js

  const handleDeleteEdge = async (edgeId) => {
    if (!window.confirm("Remove this pathway?")) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/adjacencies/${edgeId}`);
      setSelectedEdge(null);
      fetchGraphData();
    } catch (err) {
      console.error('Failed to delete pathway', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center text-slate-400">
        <i className="fa-solid fa-lock text-4xl mb-4"></i>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p>Only Super Admins can manage the campus map.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-uni-500 rounded-full animate-spin"></div>
    </div>
  );

  // DRAG AND DROP HELPERS
  const handleCatalogDragStart = (e, zoneId) => {
    e.dataTransfer.setData("zoneId", zoneId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const zoneId = parseInt(e.dataTransfer.getData("zoneId"));
    if (!zoneId) return;

    // Calculate position relative to the transformed canvas
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Client coordinates relative to the rect
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Inverse transform the coordinates: (client - transform) / scale
    const x = (clientX - transform.x) / transform.scale;
    const y = (clientY - transform.y) / transform.scale;
    
    updateZonePosition(zoneId, x, y);
  };

  const handleCanvasWheel = (e) => {
    // Only zoom if ctrl key is pressed, or if user is in 'select' or 'pan' mode
    // Using a smaller delta for smoother wheel zooming
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = Math.max(0.2, Math.min(3, transform.scale * zoomFactor));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleZoom = (delta) => {
    const newScale = Math.max(0.2, Math.min(3, transform.scale * delta));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const resetTransform = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const handleCanvasMouseDown = (e) => {
    // Left click to pan if in pan mode
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

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

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
    <div className="bg-[#0a0f1d] min-h-[700px] rounded-[2rem] border border-white/5 flex flex-col overflow-hidden animate-slide-up relative shadow-2xl">
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] pointer-events-none"></div>
      
      {/* BALANCED WORKBENCH HEADER */}
      <header className="px-10 py-6 bg-slate-900/50 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-uni-600 flex items-center justify-center text-white text-base shadow-lg shadow-uni-500/30">
                    <i className="fa-solid fa-drafting-compass"></i>
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        Blueprint Workbench
                        {actionLoading && (
                            <motion.span 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="text-[8px] text-uni-400 normal-case tracking-normal font-bold"
                            >
                                <i className="fa-solid fa-circle-notch animate-spin mr-1"></i>
                                Syncing...
                            </motion.span>
                        )}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Interactive Infrastructure</p>
                </div>
            </div>
            
            <div className="h-6 w-px bg-white/10 hidden xl:block"></div>

            <nav className="hidden xl:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                <div className="flex items-center gap-3 text-uni-400">
                    <span className="w-5 h-5 rounded-full border border-uni-500/50 flex items-center justify-center text-[9px]">1</span>
                    <span>Arrange Blueprint</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] opacity-10"></i>
                <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px]">2</span>
                    <span>Validate Paths</span>
                </div>
            </nav>
        </div>

        <div className="flex gap-8">
            <div className="flex flex-col items-end">
                <span className="text-xs font-black text-white leading-none">{zones.length}</span>
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1.5 font-mono">Zones</span>
            </div>
            <div className="h-8 w-px bg-white/5"></div>
            <div className="flex flex-col items-end">
                <span className="text-xs font-black text-white leading-none">{adjacencies.length}</span>
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1.5 font-mono">Links</span>
            </div>
        </div>
      </header>

      {/* SIDE-BY-SIDE SPLIT PANE */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* LEFT PANE: PLACES (25%) */}
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

        {/* MAIN WORKSPACE: BLUEPRINT CANVAS (75%) */}
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

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-grid-slate-900\/\\[0\.02\\] {
            background-size: 60px 60px;
            background-image: 
                linear-gradient(to right, rgba(15, 23, 42, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 1px, transparent 1px);
        }
      `}} />
    </div>
  );
};

export default ZoneBuilderTab;
