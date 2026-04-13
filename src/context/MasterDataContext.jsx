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
                .from('master_categories')
                .select('*')
                .eq('is_active', true)
                .order('hit_count', { ascending: false })
                .order('label', { ascending: true });
                
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
                .from('master_colleges')
                .select('*')
                .eq('is_active', true)
                .order('label', { ascending: true });
            if (error) throw error;
            console.info(`[Context] Colleges [Source: Resilient Table Fallback]:`, data?.length || 0, 'items');
            return data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // 3. Leaderboard Query
    const { data: leaderboard = { students: [], departments: [] }, isLoading: leaderboardLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const [studentsRes, deptsRes] = await Promise.all([
                supabase
                    .from('user_profiles_v1')
                    .select('id, first_name, last_name, show_full_name, department, integrity_points')
                    .eq('role', 'student')
                    .order('integrity_points', { ascending: false })
                    .limit(10),
                supabase
                    .from('department_leaderboard')
                    .select('*')
            ]);
            
            if (studentsRes.error) throw studentsRes.error;
            if (deptsRes.error) throw deptsRes.error;

            console.info(`[Context] Leaderboard [Source: Resilient Table Fallback]:`, studentsRes.data?.length || 0, 'students');

            // Manual Masking Fallback
            const maskedStudents = (studentsRes.data || []).map((s, idx) => ({
                id: s.id,
                full_name_masked: s.show_full_name && s.first_name && s.last_name
                    ? `${s.first_name} ${s.last_name}`
                    : (s.first_name || s.last_name) 
                        ? `${s.first_name?.charAt(0) || '*'}${s.first_name ? '***' : ''} ${s.last_name?.charAt(0) || '*'}${s.last_name ? '***' : ''}`
                        : "Anonymous Student",
                department: s.department || "General Education",
                integrity_points: s.integrity_points,
                rank: idx + 1
            }));

            return {
                students: maskedStudents,
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
