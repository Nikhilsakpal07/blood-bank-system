import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2 } from 'lucide-react';

// --- CLOUD-READY: Hardcoded to bypass environment variable delays ---
const API_BASE_URL = "https://raktasetu-server.onrender.com";

const DonorForm = ({ fetchDonors }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        blood_group: 'A+',
        contact_no: '',
        medical_eligibility: 'Yes',
        major_illness: 'None'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1. Get the userId from localStorage (CRITICAL for Multi-Tenancy)
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("Session Expired. Please login again.");
            setIsSubmitting(false);
            return;
        }

        try {
            // 2. Send the data AND the userId to the backend
            await axios.post(`${API_BASE_URL}/donors`, {
                ...formData,
                userId: userId // Maps this donor to your specific branch
            });

            alert("🎉 Donor Registered Successfully!");

            // 3. Reset form
            setFormData({
                name: '', age: '', gender: 'Male', 
                blood_group: 'A+', contact_no: '', 
                medical_eligibility: 'Yes', major_illness: 'None'
            });

            // 4. Refresh the list in DonorList.js if the prop was passed
            if (fetchDonors) fetchDonors();

        } catch (err) {
            console.error("Submission Error:", err.response?.data);
            alert(err.response?.data?.message || "Error saving record. Check server logs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="glass-card" 
            style={{ padding: '30px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}
        >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '25px', fontWeight: 800 }}>
                <UserPlus color="#4f46e5" /> Register New Donor
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            placeholder="John Doe" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>AGE</label>
                        <input 
                            type="number" 
                            className="input-field" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            placeholder="18" 
                            value={formData.age} 
                            onChange={(e) => setFormData({...formData, age: e.target.value})} 
                            required 
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>GENDER</label>
                        <select 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            value={formData.gender} 
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>BLOOD GROUP</label>
                        <select 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            value={formData.blood_group} 
                            onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>CONTACT NUMBER</label>
                        <input 
                            type="tel" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            placeholder="8928XXXXXX" 
                            value={formData.contact_no} 
                            onChange={(e) => setFormData({...formData, contact_no: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>MEDICALLY ELIGIBLE?</label>
                        <select 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            value={formData.medical_eligibility} 
                            onChange={(e) => setFormData({...formData, medical_eligibility: e.target.value})}
                        >
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block' }}>MAJOR ILLNESS (IF ANY)</label>
                    <input 
                        type="text" 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                        placeholder="e.g. None, Diabetes, etc." 
                        value={formData.major_illness} 
                        onChange={(e) => setFormData({...formData, major_illness: e.target.value})} 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ 
                        marginTop: '10px', padding: '15px', background: '#4f46e5', 
                        color: 'white', borderRadius: '12px', border: 'none', 
                        fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    {isSubmitting ? "Processing..." : <><CheckCircle2 size={18} /> Save Donor Record</>}
                </button>
            </form>
        </motion.div>
    );
};

export default DonorForm;