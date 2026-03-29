
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MasterDataContext = createContext();

export const MasterDataProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [leaderboard, setLeaderboard] = useState({ students: [], departments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeSystem = async () => {
            try {
                // Step 1: Fetch Categories and Colleges in parallel
                const [categoriesRes, collegesRes] = await Promise.all([
                    supabase.from('master_categories').select('*').eq('is_active', true),
                    supabase.from('master_colleges').select('*').eq('is_active', true)
                ]);

                if (categoriesRes.error) throw categoriesRes.error;
                if (collegesRes.error) throw collegesRes.error;

                setCategories(categoriesRes.data || []);
                setColleges(collegesRes.data || []);
                
                setLoading(false);
                
                // Step 2: Fetch Leaderboards
                fetchLeaderboard();
            } catch (err) {
                console.error('Supabase initialization failed', err);
                setError(err);
                setLoading(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                // Use parallel fetching with Promise.all
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

                // Apply masking in the frontend if show_full_name is false
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
                console.error('Failed to fetch leaderboard from Supabase', err);
            }
        };

        initializeSystem();
    }, []);

    return (
        <MasterDataContext.Provider value={{ categories, colleges, leaderboard, loading, error }}>
            {children}
        </MasterDataContext.Provider>
    );
};

export const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (!context) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
};
