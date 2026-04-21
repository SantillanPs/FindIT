import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CATEGORY_METADATA, DEFAULT_CATEGORY_META } from '../constants/categoryMetadata';

const MasterDataContext = createContext();

const MasterDataProvider = ({ children }) => {
    // 1. Consolidated Master Data Bootstrap
    const { data: bootstrapData = { categories: [], colleges: [], types: [] }, isLoading: bootstrapLoading, error: bootstrapError } = useQuery({
        queryKey: ['master_bootstrap'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_bootstrap_master_data');
            if (error) throw error;
            
            // Post-process categories with hardcoded metadata
            const processedCategories = (data.categories || []).map(cat => ({
                ...cat,
                hit_count: cat.hit_count || 0,
                ...(CATEGORY_METADATA[cat.id?.trim()?.toLowerCase()] || DEFAULT_CATEGORY_META)
            }));

            return {
                categories: processedCategories,
                colleges: data.colleges || [],
                types: data.types || []
            };
        },
        staleTime: 1000 * 60 * 60, // 1 hour cached
    });

    const categories = bootstrapData.categories;
    const colleges = bootstrapData.colleges;
    const itemTypes = bootstrapData.types;

    // Maintain backward compatibility for existing consumers
    const sortedCategories = useMemo(() => categories, [categories]);
    const leaderboard = { students: [], departments: [] }; // Placeholder for disabled feature

    const loading = bootstrapLoading;
    const error = bootstrapError;

    return (
        <MasterDataContext.Provider value={{ categories, colleges, leaderboard, sortedCategories, itemTypes, loading, error }}>
            {children}
        </MasterDataContext.Provider>
    );
};

const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (!context) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
};

export { MasterDataProvider, useMasterData };
