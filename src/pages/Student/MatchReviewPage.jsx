import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MatchReviewPage = () => {
    const { lostId, foundId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                // Use the student-accessible secure endpoints
                const [lostResp, foundResp] = await Promise.all([
                    apiClient.get(`/lost/my-reports/${lostId}`), 
                    apiClient.get(`/found/match-detail/${foundId}`) 
                ]);
                setMatchData({ lost: lostResp.data, found: foundResp.data });
            } catch (err) {
                setError('Could not load match details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();
    }, [lostId, foundId]);

    const handleAction = async (action) => {
        try {
            await apiClient.post(`/lost/${lostId}/matches/${foundId}/respond`, { action });
            navigate('/student');
        } catch (err) {
            setError('Failed to process response.');
        }
    };

    if (loading) return <div className="p-20 text-center text-white">Loading Verification Data...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-3xl mb-4">🔍</div>
                <h1 className="text-4xl font-black text-white uppercase italic">Match Verification</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Someone found an item matching your report</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* YOUR REPORT */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Your Original Report</p>
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="aspect-video bg-white/5 rounded-2xl overflow-hidden">
                            {matchData.lost.safe_photo_url && (
                                <img src={matchData.lost.safe_photo_url} className="w-full h-full object-cover" alt="Lost" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase">{matchData.lost.item_name}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{matchData.lost.description}</p>
                        </div>
                    </div>
                </div>

                {/* THE FIND */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">Potential Match Found</p>
                    <div className="glass-panel p-8 rounded-[2rem] border border-uni-400/20 bg-uni-600/5 space-y-6">
                        <div className="aspect-video bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                            {matchData.found.safe_photo_url && (
                                <img src={matchData.found.safe_photo_url} className="w-full h-full object-cover" alt="Found" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase">Discovered Item</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{matchData.found.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button 
                    onClick={() => handleAction('reject')}
                    className="py-6 rounded-3xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                >
                    Not My Item
                </button>
                <button 
                    onClick={() => handleAction('confirm')}
                    className="py-6 rounded-3xl bg-uni-600 border border-uni-400/30 text-white font-black uppercase text-xs tracking-[.3em] hover:bg-uni-500 transition-all"
                >
                    Yes, That's Mine!
                </button>
            </div>

            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Confirming will notify the finder to surrender the item to the office.
            </p>
        </div>
    );
};

export default MatchReviewPage;
