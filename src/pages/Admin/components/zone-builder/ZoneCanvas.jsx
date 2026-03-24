import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getZoneIcon } from './utils';
import MapGuideModal from './MapGuideModal';

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
            e.preventDefault(); // Prevent page scrolling
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
        <section className="flex-1 flex flex-col bg-[#050811] relative overflow-hidden">
            <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Interactive Blueprint</h3>
                <p className="text-[9px] text-slate-500 font-bold max-w-[200px]">Drag places to arrange. Click a place, then another to link.</p>
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
                className={`flex-1 relative overflow-hidden bg-slate-950/20 cursor-${
                    canvasMode === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 
                    canvasMode === 'link' ? 'cell' : 'crosshair'
                }`}
            >
                {/* TOOLBAR */}
                <div className="absolute top-8 right-8 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl">
                    <div className="flex bg-slate-950/50 rounded-xl p-1 gap-1">
                        <button 
                            onClick={() => setCanvasMode('select')}
                            title="Arrange Tool (V)"
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${canvasMode === 'select' ? 'bg-uni-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <i className="fa-solid fa-arrow-pointer"></i>
                        </button>
                        <button 
                            onClick={() => {
                                setCanvasMode('link');
                                setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 });
                            }}
                                title="Link Tool (C)"
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${canvasMode === 'link' ? 'bg-uni-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <i className="fa-solid fa-link"></i>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <div className="flex gap-1">
                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            title="How to build a map"
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <i className="fa-solid fa-circle-question"></i>
                        </button>
                        <button 
                            onClick={resetTransform}
                            className="w-14 h-10 rounded-lg flex items-center justify-center text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Reset
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
                            <marker 
                                id="arrowhead" 
                                markerWidth="14" 
                                markerHeight="10" 
                                refX="12" 
                                refY="5" 
                                orient="auto" 
                                markerUnits="userSpaceOnUse"
                            >
                                <polygon points="0 0, 14 5, 0 10" fill="#f59e0b" />
                            </marker>
                            <marker 
                                id="arrowhead-selected" 
                                markerWidth="14" 
                                markerHeight="10" 
                                refX="12" 
                                refY="5" 
                                orient="auto" 
                                markerUnits="userSpaceOnUse"
                            >
                                <polygon points="0 0, 14 5, 0 10" fill="#10b981" />
                            </marker>
                        </defs>
                        {/* PARENT-CHILD TETHERS */}
                        {canvasZones.map(zone => {
                            if (!zone.parent_zone_id) return null;
                            const parent = canvasZones.find(z => z.id === zone.parent_zone_id);
                            if (!parent) return null; // Parent isn't on the canvas
                            
                            // Visual radius of the zone node (half of 48px width + padding/margin gap)
                            const NODE_RADIUS = 30;
                            // Offset to counteract the label text at the bottom pushing the flex-center down
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
                                    x1={x1} 
                                    y1={y1} 
                                    x2={x2} 
                                    y2={y2} 
                                    stroke="#475569" // slate-600
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    opacity="0.6"
                                />
                            );
                        })}
                        {adjacencies.map(edge => {
                            const zA = zones.find(z => z.id === edge.zone_a_id);
                            const zB = zones.find(z => z.id === edge.zone_b_id);
                            if (!zA || !zB || zA.pos_x === 0 || zB.pos_x === 0) return null;
                            
                            const isSelected = selectedEdge?.id === edge.id;
                            
                            // Visual radius of the zone node (half of 48px width + padding/margin gap)
                            const NODE_RADIUS = 30;
                            // Offset to counteract the label text at the bottom pushing the flex-center down
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
                                        x1={x1} 
                                        y1={y1} 
                                        x2={x2} 
                                        y2={y2} 
                                        stroke={isSelected ? "#10b981" : "#f59e0b"} 
                                        strokeWidth={isSelected ? "5" : "3"}
                                        strokeDasharray={isSelected ? "none" : "6 4"}
                                        markerEnd={`url(#${isSelected ? 'arrowhead-selected' : 'arrowhead'})`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); }}
                                    />
                                    {/* THICKER INVISIBLE HITBOX */}
                                    <line 
                                        x1={x1} 
                                        y1={y1} 
                                        x2={x2} 
                                        y2={y2} 
                                        stroke="transparent" 
                                        strokeWidth="20"
                                        onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); }}
                                    />
                                    {isSelected && (
                                        <foreignObject 
                                            x={(zA.pos_x + zB.pos_x) / 2 - 15} 
                                            y={((zA.pos_y + VISUAL_Y_OFFSET) + (zB.pos_y + VISUAL_Y_OFFSET)) / 2 - 15} 
                                            width="30" 
                                            height="30"
                                        >
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEdge(edge.id); }}
                                                className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all border-2 border-white/20"
                                            >
                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                            </button>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* PLACES LAYER */}
                    {canvasZones.map(zone => (
                        <motion.div
                            key={zone.id}
                            onPanStart={(e, info) => {
                                if (canvasMode !== 'select') return;
                                setDraggingZoneId(zone.id);
                            }}
                            onPan={(e, info) => {
                                if (canvasMode !== 'select') return;
                                const x = zone.pos_x + info.delta.x / transform.scale;
                                const y = zone.pos_y + info.delta.y / transform.scale;
                                // We update local state immediately, but debounce API if needed.
                                // For smooth dragging, we use functional state update on zones.
                                setZones(prev => prev.map(z => z.id === zone.id ? { ...z, pos_x: x, pos_y: y } : z));
                            }}
                            onPanEnd={(e, info) => {
                                if (canvasMode !== 'select') return;
                                setDraggingZoneId(null);
                                updateZonePosition(zone.id, zone.pos_x, zone.pos_y);
                            }}
                            animate={ draggingZoneId === zone.id ? { scale: 1.15 } : { scale: 1 } }
                            whileHover={(canvasMode === 'select' || canvasMode === 'link') && !draggingZoneId ? { scale: 1.15 } : {}}
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
                                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 border-transparent' 
                                : draggingZoneId === zone.id
                                    ? 'bg-slate-800 border-emerald-500/50 text-white'
                                    : 'bg-slate-900 border-white/10 text-white group-hover:border-emerald-500/50 group-hover:bg-slate-800'
                            }`}>
                                <i className={`fa-solid ${getZoneIcon(zone.type)} text-base`}></i>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 whitespace-nowrap ${
                                draggingZoneId === zone.id ? 'text-white' : 'text-white/50 group-hover:text-white'
                            }`}>
                                {zone.name}
                            </span>

                            {/* HOVER ACTIONS */}
                            <div className={`absolute -top-10 transition-opacity flex gap-2 ${
                                draggingZoneId === zone.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                                 <button 
                                    onClick={(e) => handleDockZone(e, zone.id)}
                                    title="Return to Catalog"
                                    className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 border border-emerald-500/30 hover:text-white transition-all flex items-center justify-center"
                                 >
                                    <i className="fa-solid fa-box-archive text-[10px]"></i>
                                 </button>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }}
                                    title="Delete Place"
                                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 border border-red-500/30 hover:text-white transition-all flex items-center justify-center"
                                 >
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                 </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* SELECTION BAR */}
            <AnimatePresence>
                {newEdge.zone_a_id && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-8 py-4 rounded-[2rem] flex items-center gap-6 z-30"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            Linking <span className="underline">{zones.find(z => z.id === newEdge.zone_a_id)?.name}</span> ➜ Select Destination
                        </span>
                        <button 
                            onClick={() => setNewEdge({ zone_a_id: '', zone_b_id: '', distance_weight: 1 })}
                            className="bg-black/10 hover:bg-black/20 w-8 h-8 rounded-full transition-all"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <MapGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </section>
    );
};

export default ZoneCanvas;
