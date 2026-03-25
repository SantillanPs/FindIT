
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
        const initializeSystem = async () => {
            // Step 1: Fetch critical bootstrap data (Categories, Colleges)
            try {
                const initResponse = await apiClient.get('/init/');
                setCategories(initResponse.data.categories);
                setColleges(initResponse.data.colleges);
                
                // Set loading to false as soon as critical UI data is ready
                setLoading(false);
                
                // Step 2: Fetch non-critical data (Leaderboard) in background
                fetchLeaderboard();
            } catch (err) {
                console.error('Critical initialization failed', err);
                setError(err);
                setLoading(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const response = await apiClient.get('/leaderboard/');
                setLeaderboard(response.data);
            } catch (err) {
                console.error('Failed to fetch leaderboard in background', err);
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
