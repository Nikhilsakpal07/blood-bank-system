import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Added default empty array to 'inventory' to prevent undefined errors
const StockCards = ({ inventory = [], refreshTrigger }) => {
    const [aiPrediction, setAiPrediction] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        
        if (userId) {
            // Fetch AI predictions specifically for this user
            axios.get(`${API_BASE_URL}/api/ai/predict-demand?userId=${userId}`)
                .then(res => {
                    // Check if backend returned a message (like "Need more data")
                    if (res.data.message) {
                        setAiPrediction(null);
                    } else {
                        setAiPrediction(res.data);
                    }
                })
                .catch(() => console.log("AI engine still training for this account..."));
        }
    }, [refreshTrigger, API_BASE_URL]);

    // --- CRITICAL SAFETY CHECK: Prevent White Screen Crash ---
    if (!inventory || !Array.isArray(inventory)) {
        return (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div className="loader"></div> {/* Add a small spinner if you have one in CSS */}
                <p>Synchronizing Cloud Inventory...</p>
            </div>
        );
    }

    return (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {inventory.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    No blood stock detected. Register a donor to initialize your branch inventory.
                </div>
            ) : (
                // Using Optional Chaining (?) for extra safety during mapping
                inventory?.map((item, index) => {
                    const units = Number(item.total_units || 0);
                    const group = item.blood_group || 'Unknown';
                    const isLow = units < 15;

                    // AI logic: High priority if prediction score is high and units are low
                    const predictionValue = aiPrediction ? aiPrediction[group] : 0;
                    const isAiPriority = predictionValue > 0.6 && units < 40;

                    return (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-card ${isLow ? 'low-stock-pulse' : ''}`}
                            style={{ 
                                textAlign: 'center',
                                borderTop: isLow ? '6px solid #ef4444' : 
                                           isAiPriority ? '6px solid #6366f1' : '6px solid #4f46e5',
                                padding: '24px',
                                background: isAiPriority ? 'rgba(99, 102, 241, 0.05)' : 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        >
                            {isAiPriority && (
                                <div style={{ 
                                    position: 'absolute', top: '8px', right: '8px', 
                                    background: '#6366f1', color: 'white', 
                                    padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontWeight: 700, zIndex: 1
                                }}>
                                    <Brain size={10} /> AI PRIORITY
                                </div>
                            )}

                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>
                                BLOOD GROUP
                            </span>
                            
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#1e293b', fontWeight: 800 }}>
                                {group}
                            </h2>
                            
                            <div style={{ fontSize: '1.4rem', color: isLow ? '#ef4444' : '#4f46e5', fontWeight: 800 }}>
                                {units} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Units</span>
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                {isLow ? (
                                    <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 900, background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                                        ⚠️ CRITICAL LOW
                                    </span>
                                ) : isAiPriority ? (
                                    <span style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 900, background: '#e0e7ff', padding: '4px 8px', borderRadius: '4px' }}>
                                        🤖 SYNAPTIC: HIGH DEMAND
                                    </span>
                                ) : (
                                    <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 900, background: '#dcfce7', padding: '4px 8px', borderRadius: '4px' }}>
                                        ✓ STABLE
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

export default StockCards;