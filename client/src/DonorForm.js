import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = "https://raktasetu-server.onrender.com";

const DonorForm = ({ refreshDonors }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        blood_group: 'O+',
        contact_no: '',
        major_illness: '',
        medical_eligibility: 'Yes'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validation: Phone number must be 10 digits
        if (!/^\d{10}$/.test(formData.contact_no)) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }

        // Get the logged-in User's ID from localStorage
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("Error: User session expired. Please log in again.");
            return;
        }

        try {
            // --- UPDATED: Using Dynamic API URL and owner_id ---
            await axios.post(`${API_BASE_URL}/donors`, {
                ...formData,
                owner_id: parseInt(userId) // Ensure userId is sent as an integer
            });
            
            alert("Donor Registered Successfully!");
            
            // Reset form
            setFormData({ 
                name: '', age: '', gender: 'Male', 
                blood_group: 'O+', contact_no: '', 
                major_illness: '', medical_eligibility: 'Yes' 
            });
            
            if (refreshDonors) refreshDonors(); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || err.message;
            if (errorMessage.toLowerCase().includes("duplicate") || errorMessage.toLowerCase().includes("already exists")) {
                alert("Error: This contact number is already registered in your branch records.");
            } else {
                alert("Error: " + errorMessage);
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#1e293b', fontWeight: 800 }}>
                    <UserPlus size={22} color="#4f46e5" /> Register New Donor
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* Row 1: Name & Age */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                            <input 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                type="text" placeholder="Full Name" required
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>AGE</label>
                            <input 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                type="number" placeholder="Min 18" required
                                value={formData.age} 
                                onChange={e => setFormData({...formData, age: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Row 2: Gender & Blood Group */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>GENDER</label>
                            <select 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>BLOOD GROUP</label>
                            <select 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                value={formData.blood_group} 
                                onChange={e => setFormData({...formData, blood_group: e.target.value})}
                            >
                                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Contact & Medical Eligibility */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>CONTACT NUMBER</label>
                            <input 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                type="text" placeholder="10-digit number" required
                                value={formData.contact_no} 
                                onChange={e => setFormData({...formData, contact_no: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>MEDICALLY ELIGIBLE?</label>
                            <select 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                value={formData.medical_eligibility}
                                onChange={e => setFormData({...formData, medical_eligibility: e.target.value})}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Major Illness */}
                   <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>MAJOR ILLNESS</label>
                        <input 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            type="text" 
                            placeholder="e.g. None or Diabetes"
                            value={formData.major_illness}
                            onChange={(e) => setFormData({ ...formData, major_illness: e.target.value })} 
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        style={{ 
                            marginTop: '10px', 
                            height: '50px', 
                            background: '#4f46e5', 
                            color: 'white', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: 700, 
                            cursor: 'pointer' 
                        }}
                    >
                        Save Donor Record
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default DonorForm;