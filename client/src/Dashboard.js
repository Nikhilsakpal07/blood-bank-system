import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import StockCards from './StockCards'; 

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = "https://raktasetu-server.onrender.com";

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userId) return;
            try {
                // 1. Fetch Inventory & AI simultaneously
                const [stockRes, predRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/inventory/summary?userId=${userId}`),
                    axios.get(`${API_BASE_URL}/api/ai/predict-demand?userId=${userId}`)
                ]);

                setInventory(stockRes.data);
                setPrediction(predRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setLoading(false); // Stop loading even if it fails
            }
        };

        fetchDashboardData();
    }, [userId]);

    // --- 1. PREVENT WHITE SCREEN: Show loader while fetching ---
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Loader2 className="animate-spin" size={40} color="#4f46e5" />
                <p style={{ marginTop: '15px', color: '#64748b', fontWeight: 600 }}>Syncing RaktaSetu Cloud...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>Admin Dashboard</h2>
            
            {/* AI Forecast Section */}
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
                        {prediction?.message || "Register more dispatches to activate AI insights."}
                    </p>
                )}
            </div>

            {/* --- 2. PREVENT CHART CRASH: Safety Check for Inventory --- */}
            <h3 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 700 }}>LIVE INVENTORY STATUS</h3>
            
            {inventory && Array.isArray(inventory) ? (
                <StockCards inventory={inventory} />
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <BarChart3 size={30} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                    <p style={{ color: '#94a3b8' }}>No data found. Add your first donor to see analytics.</p>
                </div>
            )}
        </div>
    );
};
 
export default Dashboard;