import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, ArrowRight } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/login' : '/register';
        try {
            // --- UPDATED: Using Dynamic API URL ---
            const res = await axios.post(`${API_BASE_URL}${endpoint}`, { email, password });
            
            // Backend should return user object containing u_id
            const userData = isLogin ? res.data.user : res.data;
            
            if (userData && userData.u_id) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', userData.u_id); 
                onLogin(userData); // Pass user data back to App.js
            } else {
                alert("Login successful but User ID missing.");
            }
        } catch (err) {
            // Professional error handling for cloud deployment
            const errorMsg = err.response?.data || "Connection failed. The RaktaSetu server may be booting up. Please wait 30 seconds and try again.";
            alert(errorMsg);
        }
    };

    return (
        <div className="auth-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            
            {/* --- LEFT PANEL: ANIMATED BRANDING --- */}
            <motion.div 
                className="login-left-panel" 
                style={{ flex: 1.2, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Droplets size={60} fill="white" style={{ marginBottom: '20px', color: 'white' }} />
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'welcome' : 'start'}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', margin: 0 }}>
                            {isLogin ? "Welcome Back." : "Start Saving Lives."}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginTop: '15px', maxWidth: '450px' }}>
                            {isLogin 
                                ? "Your RaktaSetu dashboard is ready. Log in to manage your branch's blood supply." 
                                : "Join the national digital bridge. Register your branch to manage inventory and AI insights."}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* --- RIGHT PANEL: FORM --- */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '380px', padding: '40px' }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                        {isLogin ? "Sign In" : "Create Account"}
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>
                        {isLogin ? "Enter your RaktaSetu credentials" : "Set up your branch admin account"}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>GMAIL ADDRESS</label>
                            <input 
                                className="input-field" 
                                type="email" 
                                placeholder="name@vit.edu" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>PASSWORD</label>
                            <input 
                                className="input-field" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <button className="btn-primary" style={{ width: '100%', height: '50px', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {isLogin ? "Access Dashboard" : "Register Admin"} <ArrowRight size={18} />
                        </button>
                    </form>

                    <p 
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ cursor: 'pointer', textAlign: 'center', marginTop: '25px', color: '#6366f1', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                        {isLogin ? "Need a new dataset? Sign Up" : "Already have an account? Login"}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;