import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logSupabaseError } from './AuthContext';

const MasterDataContext = createContext();

const MasterDataProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [leaderboard, setLeaderboard] = useState({ students: [], departments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async () => {
        try {
            const [studentsRes, deptsRes] = await Promise.all([
                supabase
                    .from('users')
                    .select('id, first_name, last_name, show_full_name, department, integrity_points')
                    .eq('role', 'student')
                    .order('integrity_points', { ascending: false })
                    .limit(5),
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

            setLeaderboard({
                students: maskedStudents,
                departments: deptsRes.data || []
            });
        } catch (err) {
            logSupabaseError('Leaderboard Sync', err);
            // Fail gracefully - the app still works without the leaderboard
        }
    };

    const initializeSystem = async () => {
        try {
            // NO WATCHDOGS. NO TIMERS. Just pure, fast parallel fetching.
            const [categoriesRes, collegesRes] = await Promise.all([
                supabase.from('master_categories').select('*').eq('is_active', true).order('label'),
                supabase.from('master_colleges').select('*').eq('is_active', true).order('label')
            ]);

            if (categoriesRes.error) throw categoriesRes.error;
            if (collegesRes.error) throw collegesRes.error;

            setCategories(categoriesRes.data || []);
            setColleges(collegesRes.data || []);
            
            setLoading(false);
            
            // Fetch Leaderboards separately so they don't block initialization
            fetchLeaderboard();
        } catch (err) {
            logSupabaseError('Master Data Registry', err);
            setError(err.message || 'Registry access failed.');
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeSystem();
    }, []);

    return (
        <MasterDataContext.Provider value={{ categories, colleges, leaderboard, loading, error }}>
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
