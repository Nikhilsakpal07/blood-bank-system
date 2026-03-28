import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, ArrowRight } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = "https://raktasetu-server.onrender.com";

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ensure endpoint matches your server routes
        const endpoint = isLogin ? '/login' : '/register';
        
        try {
            // Construct full URL
            const url = `${API_BASE_URL}${endpoint}`;
            
            const res = await axios.post(url, { email, password });
            
            // Extract user data from response
            const userData = isLogin ? res.data.user : res.data;
            
            /**
             * CRITICAL FIX: 
             * Your Postgres DB uses 'id', but your previous frontend looked for 'u_id'.
             * We check for both to ensure compatibility.
             */
            const finalUserId = userData?.id || userData?.u_id;

            if (userData && finalUserId) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', finalUserId); 
                
                // Pass normalized data to App.js
                onLogin({ ...userData, id: finalUserId }); 
            } else {
                console.error("Auth Success but ID missing. Response:", res.data);
                alert("Login successful, but User ID not found in database response.");
            }
        } catch (err) {
            // Professional error handling for VIT presentation
            const errorMsg = err.response?.data || "Connection failed. The server might be waking up. Please retry in 20 seconds.";
            alert(errorMsg);
        }
    };

    return (
        <div className="auth-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            
            {/* --- LEFT PANEL: BRANDING --- */}
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