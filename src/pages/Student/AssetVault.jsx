import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';

const AssetVault = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    category: '',
    brand: '',
    model_name: '',
    serial_number: '',
    description: '',
    photo_url: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/assets/');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/media/upload', formData);
      setNewAsset({ ...newAsset, photo_url: response.data.url });
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/assets/', newAsset);
      setIsAddModalOpen(false);
      setNewAsset({
        category: '',
        brand: '',
        model_name: '',
        serial_number: '',
        description: '',
        photo_url: ''
      });
      fetchAssets();
    } catch (error) {
      console.error('Failed to add asset', error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      await apiClient.delete(`/assets/${assetId}`);
      fetchAssets();
    } catch (error) {
      console.error('Failed to delete asset', error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-header">Asset Vault</h1>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Institutional Proof of Ownership</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-uni-600 hover:bg-uni-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <i className="fa-solid fa-plus"></i>
          Register New Asset
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 app-card bg-slate-800/10 rounded-2xl"></div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center">
            <EmptyState
            title="Vault Synchronized"
            message="No registered assets found in your institutional vault. Secure your valuables today."
            />
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 px-8 py-3 bg-uni-500/10 border border-uni-500/20 text-uni-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-uni-500/20 transition-all"
            >
                Add Your First Asset
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} onDelete={() => handleDeleteAsset(asset.id)} />
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-bg-surface border border-border-main rounded-[2rem] overflow-hidden"
            >
              <div className="p-8 border-b border-border-main flex items-center justify-between bg-bg-surface/50 backdrop-blur-md">
                <div>
                  <h3 className="text-lg font-bold text-text-header">Register Asset</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Secure your property records</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Category</label>
                    <select
                      required
                      className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm focus:border-uni-500 outline-none transition-all text-text-main"
                      value={newAsset.category}
                      onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Identification">Identification</option>
                      <option value="Personal Items">Personal Items</option>
                      <option value="Bags & Gear">Bags & Gear</option>
                      <option value="Documents">Documents</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Serial Number (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm focus:border-uni-500 outline-none transition-all text-text-main"
                      placeholder="e.g. SN123456789"
                      value={newAsset.serial_number}
                      onChange={e => setNewAsset({ ...newAsset, serial_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Brand</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm focus:border-uni-500 outline-none transition-all text-text-main"
                      placeholder="e.g. Apple, Dell"
                      value={newAsset.brand}
                      onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Model Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm focus:border-uni-500 outline-none transition-all text-text-main"
                      placeholder="e.g. iPhone 15, MacBook Air"
                      value={newAsset.model_name}
                      onChange={e => setNewAsset({ ...newAsset, model_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Proof Photo (Item or Receipt)</label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-border-main rounded-2xl hover:border-uni-500 transition-all overflow-hidden min-h-[160px] flex items-center justify-center bg-bg-main/50">
                    {newAsset.photo_url ? (
                      <div className="relative w-full h-full min-h-[160px]">
                        <img src={newAsset.photo_url} className="w-full h-full object-cover" alt="Proof" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <p className="text-[10px] font-bold text-white uppercase tracking-widest">Change Photo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-8">
                        <div className="w-12 h-12 rounded-full bg-slate-800/20 flex items-center justify-center">
                            <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin text-uni-500' : 'fa-camera text-slate-500'} text-xl`}></i>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-main uppercase tracking-widest">
                                {uploading ? 'Processing Image...' : 'Upload Item Evidence'}
                            </p>
                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-slate-800/10 hover:bg-slate-800/20 text-slate-400 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-[2] bg-uni-600 hover:bg-uni-500 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                         <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <i className="fa-solid fa-shield-check text-xs"></i>
                    )}
                    Secure Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AssetCard = ({ asset, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="app-card overflow-hidden flex flex-col group border border-border-main hover:border-uni-500/50 transition-all bg-bg-surface rounded-2xl"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900/50">
        {asset.photo_url ? (
          <img src={asset.photo_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={asset.model_name} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-box-archive text-4xl text-slate-800"></i>
            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">No Visual Evidence</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5 text-[8px] font-bold text-white uppercase tracking-widest">
            {asset.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-header">{asset.brand} {asset.model_name}</h4>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                 {asset.serial_number ? `SN: ${asset.serial_number}` : 'Identity: Generic'}
               </span>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all flex items-center justify-center flex-shrink-0 border border-red-500/10"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-border-main/50 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Registration Date</span>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                {new Date(asset.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Verified Vault</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssetVault;
