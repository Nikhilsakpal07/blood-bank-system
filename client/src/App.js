import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import StockCards from './StockCards';
import DonorList from './DonorList';
import DonorForm from './DonorForm';
import DispatchBlood from './components/DispatchBlood';
import AnalyticsChart from './components/AnalyticsChart';
import AIInsights from './components/AIInsights';
import Settings from './components/Settings';
import Login from './Login'; 
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [donors, setDonors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // AUTH STATE: Persist login and specific User ID
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  // Function passed to Login.js to trigger state change
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', user.u_id); // Save unique user ID
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId'); // Clear user ID on logout
    setIsAuthenticated(false);
  };

  // FETCH LOGIC: Now including userId to filter database results
  const getDonors = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`http://localhost:5000/donors?userId=${userId}`);
      setDonors(res.data);
    } catch (err) { console.error("Donor Fetch Error:", err); }
  };

  const getInventory = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`http://localhost:5000/inventory/summary?userId=${userId}`);
      setInventory(res.data);
    } catch (err) { console.error("Inventory Fetch Error:", err); }
  };

  const getAnalytics = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`http://localhost:5000/analytics/donations?userId=${userId}`);
      setChartData(res.data);
    } catch (err) { console.error("Analytics Error:", err); }
  };

  const refreshDashboard = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    getDonors();
    getInventory();
    getAnalytics();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getDonors();
      getInventory();
      getAnalytics();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} onLogout={handleLogout} />

      <main className="main-content">
        <AnimatePresence mode="wait">
          
          {activeTab === 'Dashboard' && (
            <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <header className="header-container">
                <h1>Analytics Overview</h1>
                <p>Real-time data visualization of blood bank operations.</p>
              </header>
              <StockCards inventory={inventory} refreshTrigger={refreshKey} />
              <div style={{ marginTop: '40px' }}>
                <AnalyticsChart data={chartData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'Donors' && (
            <motion.div key="donors" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <header className="header-container">
                <h1>Donor Directory</h1>
                <p>Register new donors and manage existing records.</p>
              </header>
              <div className="page-grid">
                <div className="grid-item">
                  <DonorForm refreshDonors={refreshDashboard} />
                </div>
                <div className="grid-item">
                  {/* Pass donors to the list */}
                  <DonorList donors={donors} refreshDonors={refreshDashboard} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Inventory' && (
            <motion.div key="inv" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <header className="header-container">
                <h1>Hospital Inventory</h1>
                <p>Manage blood dispatches to medical facilities.</p>
              </header>
              <div className="single-col-grid">
                <div className="grid-item" style={{ maxWidth: '800px' }}>
                  <DispatchBlood refreshStock={refreshDashboard} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'AI Insights' && (
            <motion.div key="ai" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
              <header className="header-container">
                <h1>AI Predictive Analytics</h1>
                <p>Smart forecasting powered by Synaptic Neural Networks.</p>
              </header>
              <AIInsights currentStock={inventory} />
            </motion.div>
          )}

          {activeTab === 'Settings' && (
            <motion.div key="settings" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}}>
              <header className="header-container">
                <h1>System Settings</h1>
                <p>Configure global medical thresholds and AI parameters.</p>
              </header>
              <Settings />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;