import React, { useState, useRef } from 'react';
import apiClient from '../api/client';

const ImageUpload = ({ onUploadSuccess, value }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { url } = response.data;
      // Get the full URL (prepend the base if it's relative)
      const fullUrl = url.startsWith('http') 
        ? url 
        : `http://${window.location.hostname}:8000${url}`;
      
      onUploadSuccess(fullUrl);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Image upload failed. Please try again.');
      setPreview(value || ''); // Reset preview on failure
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*"
      />
      
      <div 
        onClick={triggerFileInput}
        className={`upload-zone relative overflow-hidden group transition-all ${
          preview ? 'border-uni-500/50' : 'border-white/10'
        } ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        {preview ? (
            <div 
              className="absolute inset-0"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Click to Change Image</p>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                <i className="fa-solid fa-camera text-2xl"></i>
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Click to Upload Photo</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">JPEG, PNG, or WebP</p>
              </div>
            </div>
          )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-4 z-10">
            <div className="w-10 h-10 border-4 border-uni-500/20 border-t-uni-500 rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-uni-400 uppercase tracking-widest">Uploading Asset...</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
