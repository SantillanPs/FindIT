import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CATEGORY_METADATA, DEFAULT_CATEGORY_META } from '../constants/categoryMetadata';

const MasterDataContext = createContext();

const MasterDataProvider = ({ children }) => {
    // 1. Categories Query
    const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('v_active_categories')
                .select('*');
                
            if (error) throw error;
            
            // Merge hardcoded metadata (icons/emojis) with pre-sorted DB labels
            return (data || []).map(cat => ({
                ...cat,
                hit_count: cat.hit_count || 0,
                ...(CATEGORY_METADATA[cat.id?.toLowerCase()] || DEFAULT_CATEGORY_META)
            }));
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
 
    // 2. Colleges Query
    const { data: colleges = [], isLoading: collegesLoading, error: collegesError } = useQuery({
        queryKey: ['colleges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('v_active_colleges')
                .select('*');
            if (error) throw error;
            console.info(`[Context] Colleges [Source: Standardized View]:`, data?.length || 0, 'items');
            return data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // 3. Leaderboard Query
    const { data: leaderboard = { students: [], departments: [] } } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const [studentsRes, deptsRes] = await Promise.all([
                supabase
                    .from('v_public_student_leaderboard')
                    .select('*')
                    .limit(10),
                supabase
                    .from('department_leaderboard')
                    .select('*')
            ]);
            
            if (studentsRes.error) throw studentsRes.error;
            if (deptsRes.error) throw deptsRes.error;

            console.info(`[Context] Leaderboard [Source: Standardized View]:`, studentsRes.data?.length || 0, 'students');

            return {
                students: studentsRes.data || [],
                departments: deptsRes.data || []
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Colleges Query (Keep separate as it's a different domain)
    const sortedCategories = useMemo(() => {
        return categories;
    }, [categories]);

    const loading = categoriesLoading || collegesLoading;
    const error = categoriesError || collegesError;

    return (
        <MasterDataContext.Provider value={{ categories, colleges, leaderboard, sortedCategories, loading, error }}>
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
