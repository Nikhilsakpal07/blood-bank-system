import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, History, PlusCircle } from 'lucide-react';

const API_BASE_URL = "https://raktasetu-server.onrender.com";

const DispatchBlood = ({ refreshStock }) => {
  const [hospitals, setHospitals] = useState([]);
  const [history, setHistory] = useState([]);
  const [newHosp, setNewHosp] = useState({ name: '', address: '', contact_no: '' });
  const userId = localStorage.getItem('userId');
  
  const [formData, setFormData] = useState({
    h_id: '',
    blood_group: '',
    units_given: '',
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
      setHospitals(Array.isArray(hospRes.data) ? hospRes.data : []);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (err) { 
      setHospitals([]);
      setHistory([]);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  // --- NEW: Function to register a hospital on the fly ---
  const handleAddHospital = async (e) => {
    e.preventDefault();
    if (!newHosp.name) return alert("Enter Hospital Name");
    try {
      await axios.post(`${API_BASE_URL}/hospitals`, { ...newHosp, userId });
      alert("Hospital Onboarded!");
      setNewHosp({ name: '', address: '', contact_no: '' });
      fetchData(); // Refresh the dropdown list
    } catch (err) {
      alert("Registration failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/dispatch`, { ...formData, userId });
      alert("Dispatch Recorded!");
      fetchData(); 
      if (refreshStock) refreshStock(); 
      setFormData(prev => ({ ...prev, units_given: '', blood_group: '' }));
    } catch (err) {
      alert(err.response?.data?.message || "Check stock levels!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* --- QUICK ADD HOSPITAL (Fixes your empty dropdown issue) --- */}
      <motion.div className="glass-card" style={{ padding: '20px', background: '#f0f9ff', borderRadius: '16px', border: '1px dashed #0ea5e9' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', margin: '0 0 15px 0' }}>
          <PlusCircle size={18} /> Quick Register Partner Hospital
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
          <input className="input-field" placeholder="Hospital Name" value={newHosp.name} onChange={e => setNewHosp({...newHosp, name: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bae6fd' }} />
          <input className="input-field" placeholder="Address" value={newHosp.address} onChange={e => setNewHosp({...newHosp, address: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bae6fd' }} />
          <input className="input-field" placeholder="Contact" value={newHosp.contact_no} onChange={e => setNewHosp({...newHosp, contact_no: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bae6fd' }} />
          <button onClick={handleAddHospital} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Add</button>
        </div>
      </motion.div>

      {/* --- DISPATCH FORM --- */}
      <motion.div className="glass-card" style={{ padding: '25px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px', fontWeight: 800 }}>
          <Send size={20} color="#4f46e5" /> Hospital Blood Dispatch
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>TARGET HOSPITAL</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.h_id} onChange={e => setFormData({...formData, h_id: e.target.value})} required>
                <option value="">Select Hospital</option>
                {hospitals?.map?.(h => (
                  <option key={h.h_id} value={h.h_id}>{h.name}</option>
                ))}
              </select>
            </div>
            {/* ... Rest of your Blood Group, Units, Date, and Urgency fields ... */}
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>BLOOD GROUP</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} required>
                <option value="">Choose Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" style={{ width: '100%', height: '50px', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Confirm & Dispatch Units</button>
        </form>
      </motion.div>
    </div>
  );
};

export default DispatchBlood;