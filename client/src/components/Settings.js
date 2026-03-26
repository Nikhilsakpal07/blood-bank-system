import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Settings as SettingsIcon, Clock, ShieldAlert, 
    Save, Database, Brain, Loader2, Moon, Sun 
} from 'lucide-react';

const Settings = () => {
    // 1. Initialize State from LocalStorage
    const [expiryThreshold, setExpiryThreshold] = useState(localStorage.getItem('expiryThreshold') || 45);
    const [stockThreshold, setStockThreshold] = useState(localStorage.getItem('stockThreshold') || 15);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
    const [isTraining, setIsTraining] = useState(false);

    // 2. Effect to handle Global Theme Class
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [darkMode]);

    // 3. Toggle Theme Function
    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    // 4. Save Medical Configurations
    const handleSave = () => {
        localStorage.setItem('expiryThreshold', expiryThreshold);
        localStorage.setItem('stockThreshold', stockThreshold);
        alert("System configurations updated! Medical logic has been recalibrated.");
    };

    // 5. Simulate AI Retraining
    const handleRetrain = () => {
        setIsTraining(true);
        setTimeout(() => {
            setIsTraining(false);
            alert("Synaptic Neural Network weights updated based on latest dispatch trends!");
        }, 2500);
    };

    // 6. Export Database to JSON
    const handleExport = async () => {
        try {
            const res = await axios.get("http://localhost:5000/donors");
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `bloodbank_backup_${new Date().toLocaleDateString()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (err) {
            alert("Export failed. Please check backend connection.");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="settings-container"
            style={{ padding: '20px' }}
        >
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SettingsIcon size={28} color="#4f46e5" /> System Control Center
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* --- CARD 1: MEDICAL RULES & INTERFACE --- */}
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#1e293b' }}>Medical & Interface</h3>
                    
                    <div className="setting-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                            <Clock size={16} /> BLOOD EXPIRY LIMIT (DAYS)
                        </label>
                        <input 
                            type="number" 
                            className="input-field" 
                            value={expiryThreshold}
                            onChange={(e) => setExpiryThreshold(e.target.value)}
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>

                    <div className="setting-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                            <ShieldAlert size={16} /> LOW STOCK ALERT LEVEL (UNITS)
                        </label>
                        <input 
                            type="number" 
                            className="input-field" 
                            value={stockThreshold}
                            onChange={(e) => setStockThreshold(e.target.value)}
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

                    {/* DARK MODE TOGGLE */}
                    <div className="setting-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                            {darkMode ? <Moon size={16} /> : <Sun size={16} />} DARK MODE INTERFACE
                        </span>
                        <div 
                            onClick={toggleTheme}
                            style={{ 
                                width: '45px', height: '24px', background: darkMode ? '#6366f1' : '#cbd5e1', 
                                borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' 
                            }}
                        >
                            <motion.div 
                                animate={{ x: darkMode ? 22 : 2 }}
                                style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', marginTop: '2px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: AI & DATA MANAGEMENT --- */}
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#1e293b' }}>Management Engine</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>
                        Neural Network Status: <span style={{ color: '#22c55e', fontWeight: 800 }}>ACTIVE</span>
                    </p>
                    
                    <button 
                        className="btn-secondary" 
                        onClick={handleRetrain}
                        disabled={isTraining}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {isTraining ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                        {isTraining ? "Retraining Weights..." : "Retrain Synaptic Model"}
                    </button>
                    
                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                    
                    <button 
                        onClick={handleExport}
                        className="btn-secondary" 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444' }}
                    >
                        <Database size={18} /> Export Database Backup (.JSON)
                    </button>
                </div>

            </div>

            {/* SAVE BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="btn-primary"
                style={{ marginTop: '30px', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
                <Save size={20} /> Save Changes
            </motion.button>
        </motion.div>
    );
};

export default Settings;