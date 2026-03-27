import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, History } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

const DispatchBlood = ({ refreshStock }) => {
  const [hospitals, setHospitals] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    h_id: '',
    blood_group: '',
    units_given: '',
    receiver_name: '',
    dispatch_date: new Date().toISOString().split('T')[0],
    purpose: 'Normal'
  });

  const fetchData = async () => {
    try {
      // --- MULTI-TENANCY: Get current branch ID ---
      const userId = localStorage.getItem('userId');
      
      const [hospRes, histRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/hospitals?userId=${userId}`),
        axios.get(`${API_BASE_URL}/dispatch-history?userId=${userId}`)
      ]);
      setHospitals(hospRes.data);
      setHistory(histRes.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    try {
      // --- UPDATED: Passing userId and using dynamic URL ---
      await axios.post(`${API_BASE_URL}/dispatch`, { 
        ...formData, 
        userId: userId 
      });
      
      alert("Dispatch Recorded Successfully!");
      fetchData(); // Refresh history table
      refreshStock(); // Refresh top dashboard cards
      
      // Reset form units but keep date
      setFormData(prev => ({ ...prev, units_given: '', blood_group: '' }));
    } catch (err) {
      alert(err.response?.data?.message || "Insufficient stock or connection error!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* --- DISPATCH FORM --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '25px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px' }}>
          <Send size={20} color="#4f46e5" /> Hospital Blood Dispatch
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label">Target Hospital</label>
              <select 
                className="input-field" 
                value={formData.h_id}
                onChange={e => setFormData({...formData, h_id: e.target.value})} 
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h.h_id} value={h.h_id}>{h.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="input-field" 
                value={formData.blood_group}
                onChange={e => setFormData({...formData, blood_group: e.target.value})} 
                required
              >
                <option value="">Choose Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label">Units (Bags)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0" 
                value={formData.units_given}
                onChange={e => setFormData({...formData, units_given: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dispatch Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.dispatch_date} 
                onChange={e => setFormData({...formData, dispatch_date: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Urgency/Purpose</label>
              <select 
                className="input-field" 
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              >
                <option value="Normal">Normal Need</option>
                <option value="Emergency">Emergency (STAT)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Confirm & Dispatch Units
          </button>
        </form>
      </motion.div>

      {/* --- DISPATCH HISTORY LIST --- */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ padding: '25px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px' }}>
          <History size={20} color="#64748b" /> Recent Dispatches
        </h3>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '12px' }}>Hospital</th>
              <th style={{ padding: '12px' }}>Group</th>
              <th style={{ padding: '12px' }}>Units</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No dispatch records found.</td></tr>
            ) : (
                history.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{item.hospital_name}</td>
                      <td style={{ padding: '12px' }}><span className="blood-badge">{item.blood_group}</span></td>
                      <td style={{ padding: '12px' }}>{item.units_given} Units</td>
                      <td style={{ padding: '12px' }}>{new Date(item.dispatch_date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge ${item.purpose === 'Emergency' ? 'status-urgent' : 'status-stable'}`} style={{
                             padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                             background: item.purpose === 'Emergency' ? '#fee2e2' : '#dcfce7',
                             color: item.purpose === 'Emergency' ? '#ef4444' : '#22c55e'
                        }}>
                          {item.purpose}
                        </span>
                      </td>
                    </tr>
                  ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default DispatchBlood;