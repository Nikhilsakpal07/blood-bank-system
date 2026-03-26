import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, TrendingUp } from 'lucide-react';
import StockCards from './StockCards'; // Reuse your existing cards

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        // Fetch the AI prediction we set up in the backend
        axios.get("http://localhost:5000/api/ai/predict-demand")
            .then(res => setPrediction(res.data))
            .catch(err => console.log("AI not ready yet"));
    }, []);

    return (
        <div className="dashboard-container">
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Admin Dashboard</h2>
            
            {/* AI Insight Card */}
            <div className="glass-card ai-predict-card" style={{ marginBottom: '25px', borderLeft: '5px solid #6366f1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="#6366f1" />
                    <h3 style={{ margin: 0 }}>AI Demand Forecast</h3>
                </div>
                {prediction ? (
                    <p style={{ marginTop: '10px', color: '#475569' }}>
                        <TrendingUp size={16} color="#22c55e" /> 
                        Next 24h: High demand predicted for <strong>O+</strong> and <strong>B+</strong> groups.
                    </p>
                ) : (
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Collecting more dispatch data to train models...</p>
                )}
            </div>

            {/* Your existing stock overview */}
            <StockCards />
        </div>
    );
};

export default Dashboard;