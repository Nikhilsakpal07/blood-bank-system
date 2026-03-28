import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, TrendingUp } from 'lucide-react';
import StockCards from './StockCards'; 

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);
    const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

    useEffect(() => {
        if (userId) {
            // --- FIX: Use API_BASE_URL and pass userId ---
            axios.get(`${API_BASE_URL}/api/ai/predict-demand?userId=${userId}`)
                .then(res => setPrediction(res.data))
                .catch(err => console.log("AI not ready or server sleeping"));
        }
    }, [userId]);

    return (
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Admin Dashboard</h2>
            
            {/* AI Insight Card */}
            <div className="glass-card ai-predict-card" 
                 style={{ 
                    marginBottom: '25px', 
                    borderLeft: '5px solid #6366f1', 
                    padding: '20px', 
                    background: '#f8fafc', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="#6366f1" />
                    <h3 style={{ margin: 0, color: '#1e293b' }}>AI Demand Forecast</h3>
                </div>
                {prediction && prediction.message !== "Need more data" ? (
                    <p style={{ marginTop: '10px', color: '#475569' }}>
                        <TrendingUp size={16} color="#22c55e" style={{ marginRight: '5px' }} /> 
                        Next 24h: High demand predicted for <strong>O+</strong> and <strong>B+</strong> groups based on your branch history.
                    </p>
                ) : (
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>
                        {prediction?.message || "Collecting more dispatch data to train models for your account..."}
                    </p>
                )}
            </div>

            {/* Your existing stock overview */}
            <StockCards userId={userId} />
        </div>
    );
};

export default Dashboard;