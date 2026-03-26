import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Droplets, Settings, LogOut, Brain } from 'lucide-react';

// 1. Destructure onLogout from props
const Sidebar = ({ setActiveTab, activeTab, onLogout }) => {
  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Donors', icon: <Users size={20} /> },
    { label: 'Inventory', icon: <Droplets size={20} /> },
    { label: 'AI Insights', icon: <Brain size={20} />, isAI: true }, 
    { label: 'Settings', icon: <Settings size={20} /> }, 
  ];

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="sidebar"
    >
      {/* 2. Logo Section */}
      <div className="sidebar-logo">
        <Droplets color="#ef4444" fill="#ef4444" size={32} />
        <span>BloodBankHub</span>
      </div>
      
      {/* 3. Main Navigation */}
      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {menuItems.map((item, index) => (
          <motion.div 
            key={index}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.95 }}
            className={`nav-item ${activeTab === item.label ? 'active' : ''}`}
            onClick={() => setActiveTab(item.label)}
            style={{ 
                position: 'relative', 
                cursor: 'pointer',
                marginTop: item.label === 'Settings' ? 'auto' : '0' 
            }}
          >
            {item.icon}
            <span>{item.label}</span>

            {item.isAI && (
              <span className="ai-badge-sidebar" style={{
                  position: 'absolute',
                  right: '10px',
                  fontSize: '0.6rem',
                  background: '#6366f1',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 800
              }}>
                NEW
              </span>
            )}
          </motion.div>
        ))}
      </nav>

      {/* 4. Footer Section (Logout Integrated) */}
      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
        <motion.div 
          whileHover={{ x: 10 }}
          whileTap={{ scale: 0.95 }}
          className="nav-item logout-item"
          style={{ cursor: 'pointer' }}
          onClick={() => {
              if(window.confirm("Are you sure you want to end your session?")) {
                  onLogout(); // This calls the function in App.js to clear localStorage
              }
          }} 
        >
          <LogOut size={20} color="#e11d48" />
          <span style={{ color: '#e11d48', fontWeight: 600 }}>Logout</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;