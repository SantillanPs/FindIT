import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';

const ImageUpload = ({ onUploadSuccess, value, description }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  // Sync preview with incoming value (reset support)
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    // Reset error
    setError('');

    // Local Preview (Immediate feedback)
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);

    try {
      // COMPRESSION: Reduce size before upload
      if (file.size > 200 * 1024) { // Only compress if > 200KB
        try {
          file = await compressImage(file, { maxWidth: 1200, quality: 0.7 });
        } catch (compErr) {
          console.warn('Compression failed, using original', compErr);
        }
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      onUploadSuccess(publicUrl);
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
    <div className="space-y-3 w-full h-full flex flex-col">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*"
      />
      
      <div 
        onClick={triggerFileInput}
        className={`upload-zone relative overflow-hidden group transition-all flex-grow flex items-center justify-center p-0 w-full ${
          preview ? 'border-uni-500/50' : 'border-white/10'
        } ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        style={{ minHeight: '140px' }}
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
              className="flex flex-col items-center justify-center space-y-4 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 transition-colors group-hover:text-sky-400 group-hover:bg-white/10">
                <i className="fa-solid fa-camera text-2xl"></i>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-widest">Click to Upload Photo</p>
                {description ? (
                  <p className="text-[10px] text-sky-400/80 font-bold uppercase tracking-widest italic">{description}</p>
                ) : (
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">JPEG, PNG, or WebP</p>
                )}
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
