
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const MasterDataContext = createContext();

export const MasterDataProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [leaderboard, setLeaderboard] = useState({ students: [], departments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const response = await apiClient.get('/init/');
                setCategories(response.data.categories);
                setColleges(response.data.colleges);
                setLeaderboard(response.data.leaderboard);
            } catch (err) {
                console.error('Failed to fetch system initialization data', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemConfig();
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
