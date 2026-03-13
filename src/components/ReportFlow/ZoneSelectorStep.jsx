import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [loading, setLoading] = useState(true);
  
  // State for selections
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedGrandchild, setSelectedGrandchild] = useState('');
  
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await apiClient.get('/zones');
        setZonesTree(response.data);
      } catch (err) {
        console.error("Failed to fetch zones", err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  // Pre-fill if going back
  useEffect(() => {
    if (formData.location_zone && !formData.zone_id && !selectedBuilding) {
      setShowOtherInput(true);
    }
  }, []);

  const handleNext = () => {
    // Validation
    if (showOtherInput && !formData.location_zone) return;
    if (!showOtherInput && !formData.zone_id && !formData.location_zone) return;
    onNext();
  };

  const handleBuildingChange = (e) => {
    const val = e.target.value;
    setSelectedBuilding(val);
    setSelectedChild('');
    setSelectedGrandchild('');
    
    if (val === 'OTHER') {
      setShowOtherInput(true);
      setFormData({ ...formData, zone_id: null, location_zone: '' });
      return;
    }
    
    setShowOtherInput(false);
    
    if (val) {
      const bldg = zonesTree.find(z => z.id.toString() === val);
      setFormData({ 
        ...formData, 
        zone_id: bldg.id, 
        location_zone: bldg.name 
      });
    } else {
      setFormData({ ...formData, zone_id: null, location_zone: '' });
    }
  };

  const handleChildChange = (e) => {
    const val = e.target.value;
    setSelectedChild(val);
    setSelectedGrandchild('');
    
    if (val) {
      const bldg = zonesTree.find(z => z.id.toString() === selectedBuilding);
      const child = bldg.children.find(z => z.id.toString() === val);
      setFormData({ 
        ...formData, 
        zone_id: child.id, 
        location_zone: `${bldg.name} - ${child.name}` 
      });
    } else {
      // Revert to building
      const bldg = zonesTree.find(z => z.id.toString() === selectedBuilding);
      setFormData({ 
        ...formData, 
        zone_id: bldg.id, 
        location_zone: bldg.name 
      });
    }
  };

  const handleGrandchildChange = (e) => {
    const val = e.target.value;
    setSelectedGrandchild(val);
    
    const bldg = zonesTree.find(z => z.id.toString() === selectedBuilding);
    const child = bldg.children.find(z => z.id.toString() === selectedChild);
    
    if (val) {
      const gchild = child.children.find(z => z.id.toString() === val);
      setFormData({ 
        ...formData, 
        zone_id: gchild.id, 
        location_zone: `${bldg.name} - ${child.name} - ${gchild.name}` 
      });
    } else {
       // Revert to child
       setFormData({ 
        ...formData, 
        zone_id: child.id, 
        location_zone: `${bldg.name} - ${child.name}` 
      });
    }
  };

  const activeBuilding = zonesTree.find(z => z.id.toString() === selectedBuilding);
  const activeChild = activeBuilding?.children?.find(z => z.id.toString() === selectedChild);

  const canProceed = showOtherInput ? formData.location_zone.length > 2 : !!formData.zone_id;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <p className="text-uni-400 font-bold tracking-widest text-sm uppercase">{stepLabel}</p>
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">{description}</p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm space-y-6 max-w-lg mx-auto">
        
        {loading ? (
          <div className="flex justify-center py-8">
            <i className="fa-solid fa-spinner fa-spin text-uni-400 text-3xl"></i>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Building / Main Area */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Area / Building</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-uni-500 focus:ring-1 focus:ring-uni-500 transition-colors"
                value={selectedBuilding}
                onChange={handleBuildingChange}
              >
                <option value="">-- Select Building/Area --</option>
                {zonesTree.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
                <option value="OTHER">Other / I don't see it</option>
              </select>
            </div>

            {/* Floor / Hallway (Children) */}
            {activeBuilding && activeBuilding.children.length > 0 && !showOtherInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Floor / Specific Area (Optional)</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-uni-500 focus:ring-1 focus:ring-uni-500 transition-colors"
                  value={selectedChild}
                  onChange={handleChildChange}
                >
                  <option value="">I don't know exactly / Anywhere here</option>
                  {activeBuilding.children.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Room (Grandchildren) */}
            {activeChild && activeChild.children && activeChild.children.length > 0 && !showOtherInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exact Room (Optional)</label>
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-uni-500 focus:ring-1 focus:ring-uni-500 transition-colors"
                  value={selectedGrandchild}
                  onChange={handleGrandchildChange}
                >
                  <option value="">I don't know exactly / Anywhere here</option>
                  {activeChild.children.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Fallback Text Input */}
            {showOtherInput && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-xs font-bold text-uni-400 uppercase tracking-wider mb-2">Type your location</label>
                <input
                  type="text"
                  placeholder="e.g., Near the main gate..."
                  className="w-full bg-slate-900/50 border border-uni-500/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-uni-500 focus:ring-1 focus:ring-uni-500 transition-colors"
                  value={formData.location_zone}
                  onChange={(e) => setFormData({...formData, location_zone: e.target.value, zone_id: null})}
                  autoFocus
                />
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
            canProceed
              ? 'bg-uni-600 hover:bg-uni-500 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-uni-900/50'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </motion.div>
  );
};

export default ZoneSelectorStep;
