import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom Hook: useVisionAnalysis
 * - Follows "The Supabase Way" & TanStack Query patterns.
 * - Global caching via queryClient prevents redundant fetches on remount.
 * - Realtime listener updates the cache instantly.
 */
export const useVisionAnalysis = (item = null) => {
  const queryClient = useQueryClient();
  const queryKey = ['ai_analysis', item?.id];

  // 1. Data Fetching (TanStack Query)
  const { 
    data: aiDraft, 
    isLoading: isFetching, 
    error: fetchError 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!item?.id) return null;
      console.log('[useVisionAnalysis] Fetching latest AI draft for item:', item.id);
      
      const { data, error } = await supabase
        .from('found_items')
        .select('ai_draft')
        .eq('id', item.id)
        .single();
      
      if (error) throw error;
      return data?.ai_draft || null;
    },
    enabled: !!item?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time (standard)
    gcTime: 1000 * 60 * 30,    // Keep in memory for 30 minutes
  });

  // 2. Realtime Listener (Updates Cache)
  useEffect(() => {
    if (!item?.id) return;

    const channel = supabase
      .channel(`ai_analysis_realtime_${item.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'found_items',
          filter: `id=eq.${item.id}`
        },
        (payload) => {
          if (payload.new && payload.new.ai_draft && Object.keys(payload.new.ai_draft).length > 0) {
            console.log('[useVisionAnalysis] Realtime update detected. Updating cache.');
            queryClient.setQueryData(queryKey, payload.new.ai_draft);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item?.id, queryClient]);

  // 3. Manual Trigger (Mutation)
  const mutation = useMutation({
    mutationFn: async (customPhotos) => {
      if (!item?.id) throw new Error('No item selected');
      
      const photosToAnalyze = customPhotos || [item.photo_url, ...(item.secondary_photos || [])].filter(Boolean);
      
      console.log('[useVisionAnalysis] Triggering manual analysis...');
      const { data, error } = await supabase.functions.invoke('process-vision-ai', {
        body: { 
          trigger_source: 'admin_manual',
          record: { 
            id: item.id, 
            photo_url: photosToAnalyze[0],
            secondary_photos: photosToAnalyze.slice(1)
          } 
        }
      });

      if (error) {
        console.error('[useVisionAnalysis] Invoke Error:', error);
        throw error;
      }

      if (!data?.analysis) {
        console.warn('[useVisionAnalysis] Analysis skipped or returned no data:', data);
        return null;
      }

      return data.analysis;
    },
    onSuccess: (newAnalysis) => {
      if (newAnalysis) {
        console.log('[useVisionAnalysis] Analysis mutation successful. Updating cache.');
        queryClient.setQueryData(queryKey, newAnalysis);
      }
    }
  });

  return {
    isAnalysing: isFetching || mutation.isPending,
    aiDraft,
    error: fetchError || mutation.error,
    triggerAnalysis: mutation.mutateAsync
  };
};
