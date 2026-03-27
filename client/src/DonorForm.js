import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

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
            // --- UPDATED: Using Dynamic API URL and userId ---
            const response = await axios.post(`${API_BASE_URL}/donors`, {
                ...formData,
                owner_id: userId 
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
                alert("Error: This contact number is already registered.");
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
            style={{ padding: '30px' }}
        >
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#1e293b' }}>
                    <UserPlus size={22} color="#4f46e5" /> Register New Donor
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* Row 1: Name & Age */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input 
                                className="input-field"
                                type="text" placeholder="Full Name" required
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input 
                                className="input-field"
                                type="number" placeholder="Min 18" required
                                value={formData.age} 
                                onChange={e => setFormData({...formData, age: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Row 2: Gender & Blood Group */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select 
                                className="input-field"
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <select 
                                className="input-field"
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
                            <label className="form-label">Contact Number</label>
                            <input 
                                className="input-field"
                                type="text" placeholder="10-digit number" required
                                value={formData.contact_no} 
                                onChange={e => setFormData({...formData, contact_no: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Medically Eligible?</label>
                            <select 
                                className="input-field"
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
                        <label className="form-label">Major Illness</label>
                        <input 
                            className="input-field"
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
                        className="btn-primary"
                        style={{ marginTop: '10px' }}
                    >
                        Save Donor Record
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default DonorForm;