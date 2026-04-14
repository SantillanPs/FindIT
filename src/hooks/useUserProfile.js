import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch a user profile from the standardized v_user_profiles view.
 * Adheres to Backend Design Standards (TanStack Query + Views).
 */
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('v_user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error(`[BACKEND ERROR] Failed to fetch profile for ${userId}:`, error);
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
