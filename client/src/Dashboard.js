import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, TrendingUp, Loader2 } from 'lucide-react'; // Added Loader icon
import StockCards from './StockCards'; 

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);
    const [inventory, setInventory] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true); // Track loading state
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            
            try {
                // 1. Fetch AI Prediction
                const predRes = await axios.get(`${API_BASE_URL}/api/ai/predict-demand?userId=${userId}`);
                setPrediction(predRes.data);

                // 2. Fetch Inventory Stock (CRITICAL: This feeds StockCards)
                const stockRes = await axios.get(`${API_BASE_URL}/inventory/summary?userId=${userId}`);
                setInventory(stockRes.data);
                
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Data Fetch Error:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // --- SAFETY GUARD: Prevent White Screen while loading ---
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} color="#4f46e5" />
                    <p style={{ color: '#64748b', marginTop: '10px', fontWeight: 600 }}>Syncing with RaktaSetu Cloud...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>Admin Dashboard</h2>
            
            {/* AI Insight Card */}
            <div className="glass-card ai-predict-card" 
                 style={{ 
                    marginBottom: '25px', 
                    borderLeft: '5px solid #6366f1', 
                    padding: '20px', 
                    background: 'white', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="#6366f1" />
                    <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>AI Demand Forecast</h3>
                </div>
                {prediction && prediction.message !== "Need more data" ? (
                    <p style={{ marginTop: '10px', color: '#475569' }}>
                        <TrendingUp size={16} color="#22c55e" style={{ marginRight: '5px' }} /> 
                        Next 24h: High demand predicted for <strong>O+</strong> and <strong>B+</strong> groups.
                    </p>
                ) : (
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>
                        {prediction?.message || "Collecting branch data to train models..."}
                    </p>
                )}
            </div>

            {/* Pass the fetched inventory to StockCards */}
            {/* We add a secondary check here just to be 100% safe */}
            {Array.isArray(inventory) ? (
                <StockCards inventory={inventory} />
            ) : (
                <p>Error loading inventory format.</p>
            )}
        </div>
    );
};
 
export default Dashboard;