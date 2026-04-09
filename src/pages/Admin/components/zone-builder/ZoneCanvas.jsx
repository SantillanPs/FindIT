import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getZoneIcon } from './utils';
import MapGuideModal from './MapGuideModal';
import { MousePointer2, Link2, HelpCircle, RotateCcw, X, Wand2, MapPin, Eye, MousePointerClick } from 'lucide-react';

/**
 * ZoneCanvas - Premium Professional (Pro Max)
 * - Clean map editing workspace.
 * - Human-centric labels (No "Interactive Blueprint").
 * - Clean, professional typography.
 */
const ZoneCanvas = ({
    zones,
    canvasZones,
    adjacencies,
    canvasMode,
    setCanvasMode,
    isPanning,
    transform,
    handleCanvasDrop,
    handleCanvasDragOver,
    handleCanvasWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleZoom,
    resetTransform,
    selectedEdge,
    setSelectedEdge,
    handleDeleteEdge,
    draggingZoneId,
    setDraggingZoneId,
    setZones,
    updateZonePosition,
    newEdge,
    setNewEdge,
    handleCreateEdge,
    handleDockZone,
    handleDeleteZone
}) => {
    const canvasRef = useRef(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            handleCanvasWheel(e);
        };

        const canvasEl = canvasRef.current;
        if (canvasEl) {
            canvasEl.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (canvasEl) {
                canvasEl.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleCanvasWheel]);

    return (
        <section className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
            {/* Context Info Overlay */}
            <div className="absolute top-10 left-10 z-20 flex flex-col gap-1 text-left">
                <h3 className="text-[10px] font-bold text-uni-400 uppercase tracking-widest">Campus Map Editor</h3>
                <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">Drag zones to arrange. Toggle path mode to link areas.</p>
            </div>

            {/* CANVAS WORKSPACE */}
            <div 
                ref={canvasRef}
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex-1 relative overflow-hidden bg-white/[0.01] cursor-${
                    canvasMode === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 
                    canvasMode === 'link' ? 'cell' : 'crosshair'
                }`}
            >
                {/* TOOLBAR */}
                <div className="absolute top-10 right-10 z-30 flex items-center gap-3 bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-2 rounded-2xl shadow-2xl">
                    <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                        <button 
                            onClick={() => setCanvasMode('select')}
                            title="Move Tool (V)"
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${canvasMode === 'select' ? 'bg-uni-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <MousePointer2 size={16} />
                        </button>
                        <button 
                            onClick={() => {
                                setCanvasMode('link');
                                setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
                            }}
                                title="Path Tool (C)"
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${canvasMode === 'link' ? 'bg-uni-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <Link2 size={16} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <div className="flex gap-1">
                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            title="Editor Guide"
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <HelpCircle size={16} />
                        </button>
                        <button 
                            onClick={resetTransform}
                            className="h-10 px-4 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Reset View
                        </button>
                    </div>
                </div>

                <div 
                    style={{ 
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: '0 0',
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="absolute inset-0 min-h-[5000px] min-w-[5000px]"
                >
                    {/* SVG CONNECTIONS LAYER */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <defs>
                            <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                                <polygon points="0 0, 14 5, 0 10" fill="#38BDF8" opacity="0.4" />
                            </marker>
                            <marker id="arrowhead-selected" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                                <polygon points="0 0, 14 5, 0 10" fill="#0EA5E9" />
                            </marker>
                        </defs>
                        
                        {/* PARENT-CHILD TETHERS */}
                        {canvasZones.map(zone => {
                            if (!zone.parent_zone_id) return null;
                            const parent = canvasZones.find(z => z.id === zone.parent_zone_id);
                            if (!parent) return null;
                            
                            const NODE_RADIUS = 30;
                            const VISUAL_Y_OFFSET = -14;
                            const dx = zone.pos_x - parent.pos_x;
                            const dy = zone.pos_y - parent.pos_y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < NODE_RADIUS * 2) return null;

                            const normX = dx / distance;
                            const normY = dy / distance;
                            const x1 = parent.pos_x + normX * NODE_RADIUS;
                            const y1 = (parent.pos_y + VISUAL_Y_OFFSET) + normY * NODE_RADIUS;
                            const x2 = zone.pos_x - normX * NODE_RADIUS;
                            const y2 = (zone.pos_y + VISUAL_Y_OFFSET) - normY * NODE_RADIUS;

                            return (
                                <line 
                                    key={`tether-${zone.id}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2} 
                                    stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"
                                />
                            );
                        })}

                        {/* ACTIVE ADJACENCY PATHS */}
                        {adjacencies.map(edge => {
                            const zA = zones.find(z => z.id === edge.zone_a_id);
                            const zB = zones.find(z => z.id === edge.zone_b_id);
                            if (!zA || !zB || zA.pos_x === 0 || zB.pos_x === 0) return null;
                            
                            const isSelected = selectedEdge?.id === edge.id;
                            const NODE_RADIUS = 30;
                            const VISUAL_Y_OFFSET = -14;
                            const dx = zB.pos_x - zA.pos_x;
                            const dy = zB.pos_y - zA.pos_y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < NODE_RADIUS * 2) return null;

                            const normX = dx / distance;
                            const normY = dy / distance;
                            const x1 = zA.pos_x + normX * NODE_RADIUS;
                            const y1 = (zA.pos_y + VISUAL_Y_OFFSET) + normY * NODE_RADIUS;
                            const x2 = zB.pos_x - normX * NODE_RADIUS;
                            const y2 = (zB.pos_y + VISUAL_Y_OFFSET) - normY * NODE_RADIUS;

                            return (
                                <g key={edge.id} className="pointer-events-auto cursor-pointer">
                                    <line 
                                        x1={x1} y1={y1} x2={x2} y2={y2} 
                                        stroke={isSelected ? "#0EA5E9" : "#38BDF8"} 
                                        strokeWidth={isSelected ? "4" : "2"}
                                        strokeDasharray={isSelected ? "none" : "6 4"}
                                        opacity={isSelected ? 1 : 0.4}
                                        markerEnd={`url(#${isSelected ? 'arrowhead-selected' : 'arrowhead'})`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); }}
                                    />
                                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="20" onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); }} />
                                    {isSelected && (
                                        <foreignObject x={(zA.pos_x + zB.pos_x) / 2 - 14} y={((zA.pos_y + VISUAL_Y_OFFSET) + (zB.pos_y + VISUAL_Y_OFFSET)) / 2 - 14} width="28" height="28">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEdge(edge.id); }}
                                                className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all border-2 border-slate-950 shadow-xl"
                                            >
                                                <X size={14} />
                                            </button>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* ZONES LAYER */}
                    {canvasZones.map(zone => (
                        <motion.div
                            key={zone.id}
                            onPanStart={() => canvasMode === 'select' && setDraggingZoneId(zone.id)}
                            onPan={(e, info) => {
                                if (canvasMode !== 'select') return;
                                const x = zone.pos_x + info.delta.x / transform.scale;
                                const y = zone.pos_y + info.delta.y / transform.scale;
                                setZones(prev => prev.map(z => z.id === zone.id ? { ...z, pos_x: x, pos_y: y } : z));
                            }}
                            onPanEnd={() => {
                                if (canvasMode !== 'select') return;
                                setDraggingZoneId(null);
                                updateZonePosition(zone.id, zone.pos_x, zone.pos_y);
                            }}
                            animate={ draggingZoneId === zone.id ? { scale: 1.1 } : { scale: 1 } }
                            whileHover={(canvasMode === 'select' || canvasMode === 'link') && !draggingZoneId ? { scale: 1.1 } : {}}
                            style={{ x: zone.pos_x, y: zone.pos_y, position: 'absolute' }}
                            className={`group flex flex-col items-center gap-2 -translate-x-1/2 -translate-y-1/2 z-10 select-none ${
                                canvasMode === 'select' ? 'cursor-grab active:cursor-grabbing' : 
                                canvasMode === 'link' ? 'cursor-cell' : 'pointer-events-none'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                if (canvasMode !== 'link' && canvasMode !== 'select') return;
                                setSelectedEdge(null);
                                if (canvasMode === 'link') {
                                    if (!newEdge.zone_a_id) {
                                        setNewEdge({ ...newEdge, zone_a_id: zone.id });
                                    } else if (newEdge.zone_a_id !== zone.id) {
                                        const zAId = newEdge.zone_a_id;
                                        setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
                                        handleCreateEdge(null, { zone_a_id: zAId, zone_b_id: zone.id });
                                    } else {
                                        setNewEdge({ ...newEdge, zone_a_id: '' });
                                    }
                                }
                            }}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                                newEdge.zone_a_id === zone.id 
                                ? 'bg-uni-600 text-white ring-4 ring-uni-500/20 border-transparent' 
                                : draggingZoneId === zone.id
                                    ? 'bg-slate-800 border-uni-500/50 text-white'
                                    : 'bg-slate-900 border-white/10 text-slate-400 group-hover:border-uni-500/50 group-hover:bg-slate-800 group-hover:text-white'
                            }`}>
                                <i className={`fa-solid ${getZoneIcon(zone.type)} text-base`}></i>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 whitespace-nowrap rounded-md ${
                                draggingZoneId === zone.id ? 'text-white bg-uni-600/20' : 'text-slate-500 group-hover:text-white group-hover:bg-white/5'
                            } transition-all`}>
                                {zone.name}
                            </span>

                            {/* HOVER ACTIONS */}
                            <div className={`absolute -top-10 transition-all flex gap-2 ${
                                draggingZoneId === zone.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                            }`}>
                                <button onClick={(e) => handleDockZone(e, zone.id)} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:bg-uni-600 hover:text-white transition-all flex items-center justify-center shadow-xl"><RotateCcw size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-xl"><X size={14} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ACTION PROMPT BAR */}
            <AnimatePresence>
                {newEdge.zone_a_id && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-uni-600 text-white px-8 py-5 rounded-[2rem] flex items-center gap-6 z-30 shadow-2xl shadow-uni-600/40">
                        <Wand2 size={18} className="animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                            Linking <span className="bg-white/20 px-2 py-1 rounded-md">{zones.find(z => z.id === newEdge.zone_a_id)?.name}</span> → Select a destination zone
                        </span>
                        <button onClick={() => setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 })} className="bg-black/20 hover:bg-black/40 w-8 h-8 rounded-full transition-all flex items-center justify-center">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <MapGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </section>
    );
};

export default ZoneCanvas;
