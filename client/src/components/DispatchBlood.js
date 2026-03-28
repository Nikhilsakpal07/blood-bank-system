import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, History } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

const DispatchBlood = ({ refreshStock }) => {
  // LAYER 1: Initialize as empty arrays to prevent .map crashes
  const [hospitals, setHospitals] = useState([]);
  const [history, setHistory] = useState([]);
  const userId = localStorage.getItem('userId');
  
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
      if (!userId) return;
      
      const [hospRes, histRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/hospitals?userId=${userId}`),
        axios.get(`${API_BASE_URL}/dispatch-history?userId=${userId}`)
      ]);
      
      // LAYER 2: Double-check that response data is actually an array
      setHospitals(Array.isArray(hospRes.data) ? hospRes.data : []);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
      setHospitals([]); // Fallback to empty on error
      setHistory([]);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/dispatch`, { 
        ...formData, 
        userId: userId 
      });
      
      alert("Dispatch Recorded Successfully!");
      fetchData(); 
      if (refreshStock) refreshStock(); 
      
      setFormData(prev => ({ ...prev, units_given: '', blood_group: '' }));
    } catch (err) {
      alert(err.response?.data?.message || "Insufficient stock or connection error!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* --- DISPATCH FORM --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '25px', background: 'white', borderRadius: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>
          <Send size={20} color="#4f46e5" /> Hospital Blood Dispatch
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>TARGET HOSPITAL</label>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={formData.h_id}
                onChange={e => setFormData({...formData, h_id: e.target.value})} 
                required
              >
                <option value="">Select Hospital</option>
                {/* LAYER 3: Optional chaining ensures it only maps if hospitals is an array */}
                {hospitals?.map?.(h => (
                  <option key={h.h_id} value={h.h_id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>BLOOD GROUP</label>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={formData.blood_group}
                onChange={e => setFormData({...formData, blood_group: e.target.value})} 
                required
              >
                <option value="">Choose Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>UNITS (BAGS)</label>
              <input 
                type="number" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                placeholder="0" 
                value={formData.units_given}
                onChange={e => setFormData({...formData, units_given: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>DISPATCH DATE</label>
              <input 
                type="date" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={formData.dispatch_date} 
                onChange={e => setFormData({...formData, dispatch_date: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>URGENCY</label>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              >
                <option value="Normal">Normal Need</option>
                <option value="Emergency">Emergency (STAT)</option>
              </select>
            </div>
          </div>

          <button type="submit" style={{ width: '100%', height: '50px', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Confirm & Dispatch Units
          </button>
        </form>
      </motion.div>

      {/* --- DISPATCH HISTORY LIST --- */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ padding: '25px', background: 'white', borderRadius: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>
          <History size={20} color="#64748b" /> Recent Dispatches
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', fontSize: '0.75rem', color: '#64748b' }}>
              <th style={{ padding: '12px' }}>HOSPITAL</th>
              <th style={{ padding: '12px' }}>GROUP</th>
              <th style={{ padding: '12px' }}>UNITS</th>
              <th style={{ padding: '12px' }}>DATE</th>
              <th style={{ padding: '12px' }}>PURPOSE</th>
            </tr>
          </thead>
          <tbody>
            {history?.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No dispatch records found.</td></tr>
            ) : (
                history?.map?.((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{item.hospital_name}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>{item.blood_group}</span></td>
                      <td style={{ padding: '12px', color: '#475569' }}>{item.units_given} Units</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{new Date(item.dispatch_date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
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