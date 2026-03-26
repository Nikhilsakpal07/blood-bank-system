import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, History, AlertTriangle } from 'lucide-react';

const DispatchBlood = ({ refreshStock }) => {
  const [hospitals, setHospitals] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    h_id: '',
    blood_group: '',
    units_given: '',
    receiver_name: '',
    dispatch_date: new Date().toISOString().split('T')[0], // Default to today
    purpose: 'Normal'
  });

  const fetchData = async () => {
    try {
      const [hospRes, histRes] = await Promise.all([
        axios.get("http://localhost:5000/hospitals"),
        axios.get("http://localhost:5000/dispatch-history")
      ]);
      setHospitals(hospRes.data);
      setHistory(histRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/dispatch", formData);
      alert("Dispatch Recorded!");
      fetchData(); // Refresh history table
      refreshStock(); // Refresh top cards
    } catch (err) {
      alert(err.response?.data?.message || "Stock Check Failed!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* --- DISPATCH FORM --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
          <Send size={20} color="#4f46e5" /> Hospital Blood Dispatch
        </h3>
        
        <form onSubmit={handleSubmit} className="modern-form-container">
          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label">Target Hospital</label>
              <select className="input-field" onChange={e => setFormData({...formData, h_id: e.target.value})} required>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h.h_id} value={h.h_id}>{h.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="input-field" onChange={e => setFormData({...formData, blood_group: e.target.value})} required>
                <option value="">Choose Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label">Units (Bags)</label>
              <input type="number" className="input-field" placeholder="0" onChange={e => setFormData({...formData, units_given: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Dispatch Date</label>
              <input type="date" className="input-field" value={formData.dispatch_date} onChange={e => setFormData({...formData, dispatch_date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Urgency/Purpose</label>
              <select className="input-field" onChange={e => setFormData({...formData, purpose: e.target.value})}>
                <option value="Normal">Normal Need</option>
                <option value="Emergency">Emergency (STAT)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary">Confirm & Dispatch Units</button>
        </form>
      </motion.div>

      {/* --- DISPATCH HISTORY LIST --- */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px' }}>
          <History size={20} color="#64748b" /> Recent Dispatches
        </h3>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>Group</th>
              <th>Units</th>
              <th>Date</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{item.hospital_name}</td>
                <td><span className="blood-badge">{item.blood_group}</span></td>
                <td>{item.units_given} Units</td>
                <td>{new Date(item.dispatch_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${item.purpose === 'Emergency' ? 'status-urgent' : 'status-stable'}`}>
                    {item.purpose}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default DispatchBlood;