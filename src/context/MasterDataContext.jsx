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
                .from('v_categories_sorted')
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
                .from('master_colleges')
                .select('*')
                .eq('is_active', true)
                .order('label');
            if (error) throw error;
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

            const maskedStudents = (studentsRes.data || []).map((user, i) => {
                const fname = user.first_name || "";
                const lname = user.last_name || "";
                const maskedFirst = fname ? `${fname[0]}***` : "*";
                const maskedLast = lname ? `${lname[0]}***` : "*";
                const maskedName = `${maskedFirst} ${maskedLast}`.trim();
                const finalName = user.show_full_name ? `${fname} ${lname}`.trim() : maskedName;

                return {
                    id: user.id,
                    full_name_masked: finalName || "Anonymous Student",
                    department: user.department || "General Education",
                    integrity_points: user.integrity_points,
                    rank: i + 1
                };
            });

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
