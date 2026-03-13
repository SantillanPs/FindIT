
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const MasterDataContext = createContext();

export const MasterDataProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, colRes] = await Promise.all([
                    apiClient.get('/categories'),
                    apiClient.get('/colleges')
                ]);
                setCategories(catRes.data);
                setColleges(colRes.data);
            } catch (err) {
                console.error('Failed to fetch master metadata', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, []);

    return (
        <MasterDataContext.Provider value={{ categories, colleges, loading, error }}>
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
