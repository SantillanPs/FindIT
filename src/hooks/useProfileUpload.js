import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useProfileUpload = () => {
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAvatar = async (file) => {
    if (!file || !user) return null;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload to Storage (avatars bucket)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Database Profile
      const { error: updateError } = await supabase
        .from('user_profiles_v1')
        .update({ 
          photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Refresh Context
      await refreshUser();
      
      return publicUrl;
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err.message || 'Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadAvatar, uploading, error };
};
