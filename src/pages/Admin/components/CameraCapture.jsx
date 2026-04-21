import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const CameraCapture = ({ onUploadSuccess, onCancel }) => {
  const [stream, setStream] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);

    try {
      const blob = await (await fetch(preview)).blob();
      const fileName = `intake-${Date.now()}.jpg`;
      const filePath = `intake/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onUploadSuccess(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        {!preview ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
              <button onClick={onCancel} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white"><X size={24} /></button>
              <button 
                onClick={takeSnapshot} 
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black border-8 border-white/20"
              >
                <div className="w-14 h-14 rounded-full border-4 border-black/10" />
              </button>
              <div className="w-14 h-14" /> {/* Spacer */}
            </div>
          </>
        ) : (
          <>
            <img src={preview} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {uploading && <RefreshCw className="animate-spin text-white" size={48} />}
            </div>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 px-10">
              <button 
                disabled={uploading}
                onClick={() => { setPreview(null); startCamera(); }} 
                className="flex-grow h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest gap-3"
              >
                <RefreshCw size={18} /> Retake
              </button>
              <button 
                disabled={uploading}
                onClick={handleUpload} 
                className="flex-grow h-16 rounded-2xl bg-uni-500 flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest gap-3"
              >
                <Check size={18} /> Use Photo
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Recapture Mode</p>
    </div>
  );
};

export default CameraCapture;
