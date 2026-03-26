import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ShieldCheck, Database } from 'lucide-react';

const AIInsights = () => {
    const [prediction, setPrediction] = useState(null);
    const [recordCount, setRecordCount] = useState(0); // Track history count
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAIData = async () => {
            try {
                // 1. Fetch Synaptic Prediction
                const predRes = await axios.get("http://localhost:5000/api/ai/predict-demand");
                setPrediction(predRes.data);

                // 2. Fetch History Count for Maturity Bar
                const countRes = await axios.get("http://localhost:5000/api/ai/history-count");
                setRecordCount(countRes.data.count || 0);

                setLoading(false);
            } catch (err) {
                console.error("AI Fetch Error");
                setLoading(false);
            }
        };
        fetchAIData();
    }, []);

    // Logic: 50 records = 100% maturity
    const maturity = Math.min((recordCount / 50) * 100, 100);
    const isLearning = maturity < 40;

    if (loading) return <div className="loading-ai">Neural Network Training in progress...</div>;

    return (
        <div className="ai-page-container">
            <div className="page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* 1. Demand Prediction Card */}
                <motion.div whileHover={{y:-5}} className="glass-card ai-card highlight">
                    <div className="ai-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <Brain color="#6366f1" size={32} />
                        <h3 style={{ margin: 0 }}>Demand Forecast</h3>
                    </div>
                    <hr style={{ border: '0.5px solid #e2e8f0', marginBottom: '20px' }} />
                    
                    {prediction && !prediction.message ? (
                        <div className="prediction-results">
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>AI predicts a high probability of demand for tomorrow:</p>
                            
                            <div className="prediction-bar-container" style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 700 }}>O+ Group</span>
                                    <span className="perc" style={{ fontWeight: 800, color: '#6366f1' }}>
                                        {(prediction['O+'] * 100 || 0).toFixed(1)}% Confidence
                                    </span>
                                </div>
                                <div className="progress-bg" style={{ height: '12px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{width:0}} 
                                        animate={{width: `${(prediction['O+'] || 0) * 100}%`}} 
                                        className="progress-fill"
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                                    />
                                </div>
                            </div>

                            {/* --- NEW: DATA MATURITY SECTION --- */}
                            <div className="maturity-box" style={{ marginTop: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, marginBottom: '8px' }}>
                                    <span style={{ color: '#94a3b8' }}>MODEL RELIABILITY</span>
                                    <span style={{ color: isLearning ? '#f59e0b' : '#22c55e' }}>
                                        {isLearning ? 'LEARNING PHASE' : 'STABLE'}
                                    </span>
                                </div>
                                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${maturity}%` }}
                                        style={{ height: '100%', background: isLearning ? '#f59e0b' : '#22c55e' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Database size={10} /> Insights based on {recordCount} dispatch records.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">Insufficient dispatch history to generate Neural Network models.</p>
                    )}
                </motion.div>

                {/* 2. Smart Recommendations */}
                <motion.div whileHover={{y:-5}} className="glass-card ai-card">
                    <div className="ai-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <Sparkles color="#f59e0b" size={32} />
                        <h3 style={{ margin: 0 }}>Smart Actions</h3>
                    </div>
                    <hr style={{ border: '0.5px solid #e2e8f0', marginBottom: '20px' }} />
                    <ul className="ai-list" style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <ShieldCheck size={18} color="#22c55e" /> 
                            <span>Schedule <strong>O+</strong> donor camp within 48 hours.</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <ShieldCheck size={18} color="#22c55e" /> 
                            <span>Contact <strong>B-</strong> donors for urgent replenishment.</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <ShieldCheck size={18} color="#22c55e" /> 
                            <span>Dispatch priority: <strong>City Hospital</strong>.</span>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default AIInsights;