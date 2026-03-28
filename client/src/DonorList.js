import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Trash2, X, User, Phone, Droplets, 
    Activity, HeartPulse, ShieldCheck, AlertTriangle, Clock 
} from 'lucide-react';

// --- CLOUD-READY: Global API URL ---
const API_BASE_URL = "https://raktasetu-server.onrender.com";

const DonorList = () => {
    // LAYER 1: Initialize as empty array so .filter() doesn't crash on load
    const [donors, setDonors] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDonor, setSelectedDonor] = useState(null);
    const userId = localStorage.getItem('userId');

    const fetchDonors = () => {
        if (!userId) return;
        
        axios.get(`${API_BASE_URL}/donors?userId=${userId}`)
            .then(res => {
                // Ensure we only set state if the response is actually an array
                setDonors(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setDonors([]); // Reset to empty array on error to prevent crashes
            });
    };

    useEffect(() => {
        fetchDonors();
    }, [userId]);

    const deleteDonor = async (id) => {
        if (window.confirm("Delete this donor record permanently?")) {
            try {
                await axios.delete(`${API_BASE_URL}/donors/${id}`);
                setDonors(donors.filter(donor => donor.d_id !== id));
            } catch (err) {
                console.error("Delete failed:", err.message);
            }
        }
    };

    const getDonorStatus = (donor) => {
        const expiryThreshold = parseInt(localStorage.getItem('expiryThreshold')) || 45;
        if (donor.last_donation_date) {
            const lastDonation = new Date(donor.last_donation_date);
            const diffDays = Math.ceil((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
            if (diffDays > expiryThreshold) {
                return { label: "EXPIRED", icon: <Clock size={14} />, color: '#ef4444' };
            }
        }
        const rawValue = donor.major_illness ? String(donor.major_illness).toLowerCase().trim() : "";
        const healthyKeywords = ["none", "nil", "no", "n/a", "null", "[null]", "-", "", "no illness"];
        if (!healthyKeywords.includes(rawValue)) {
            return { label: "MEDICAL ALERT", icon: <AlertTriangle size={14} />, color: '#f59e0b' };
        }
        return { label: "ELIGIBLE", icon: <ShieldCheck size={14} />, color: '#22c55e' };
    };

    // LAYER 2: Safety check to ensure donors is an array before filtering
    const filteredDonors = Array.isArray(donors) 
        ? donors.filter(d => 
            (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (d.blood_group && d.blood_group.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : [];

    return (
        <div style={{ marginTop: '30px' }}>
            {/* Search Bar */}
            <div className="search-container" style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={20} style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }} />
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search by name or blood type..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '45px', width: '100%', height: '50px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
            </div>

            {/* Donor Table */}
            <div className="glass-card" style={{ padding: '0px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}>
                <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.05em' }}>NAME</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.05em' }}>BLOOD GROUP</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.05em' }}>STATUS</th>
                            <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredDonors.length > 0 ? (
                                filteredDonors.map((d) => {
                                    const status = getDonorStatus(d);
                                    return (
                                        <motion.tr 
                                            key={d.d_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setSelectedDonor(d)}
                                            style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                            whileHover={{ backgroundColor: '#f8fafc' }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: 700, color: '#1e293b' }}>{d.name}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                                                    {d.blood_group}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, fontSize: '0.65rem', color: status.color }}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteDonor(d.d_id); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                        No donor records found.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedDonor && (
                    <div className="modal-overlay" onClick={() => setSelectedDonor(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="detail-modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Donor Profile</h3>
                                <X style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSelectedDonor(null)} />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: '#eef2ff', borderRadius: '8px' }}><User size={20} color="#6366f1" /></div>
                                    <span style={{ fontSize: '0.95rem' }}><strong>Name:</strong> {selectedDonor.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: '#eef2ff', borderRadius: '8px' }}><Activity size={20} color="#6366f1" /></div>
                                    <span style={{ fontSize: '0.95rem' }}><strong>Age / Gender:</strong> {selectedDonor.age || 'N/A'} / {selectedDonor.gender || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: '#fef2f2', borderRadius: '8px' }}><Droplets size={20} color="#ef4444" /></div>
                                    <span style={{ fontSize: '0.95rem' }}><strong>Blood Group:</strong> {selectedDonor.blood_group}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: '#eef2ff', borderRadius: '8px' }}><Phone size={20} color="#6366f1" /></div>
                                    <span style={{ fontSize: '0.95rem' }}><strong>Contact:</strong> {selectedDonor.contact_no || 'Not Provided'}</span>
                                </div>
                                
                                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '5px 0' }} />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShieldCheck size={20} color={selectedDonor.medical_eligibility === 'Yes' ? '#22c55e' : '#ef4444'} /> 
                                    <span style={{ fontSize: '0.95rem' }}><strong>Medical Eligibility:</strong> {selectedDonor.medical_eligibility || 'Unknown'}</span>
                                </div>

                                <div style={{ 
                                    padding: '15px', 
                                    background: (selectedDonor.major_illness && !["none", "nil", "no", "n/a", "null", "[null]", "-"].includes(selectedDonor.major_illness.toLowerCase().trim())) ? '#fff7ed' : '#f0fdf4', 
                                    borderRadius: '14px', 
                                    border: `1px solid ${(selectedDonor.major_illness && !["none", "nil", "no", "n/a", "null", "[null]", "-"].includes(selectedDonor.major_illness.toLowerCase().trim())) ? '#ffedd5' : '#dcfce7'}` 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: (selectedDonor.major_illness && !["none", "nil", "no", "n/a", "null", "[null]", "-"].includes(selectedDonor.major_illness.toLowerCase().trim())) ? '#c2410c' : '#166534', fontWeight: 700, marginBottom: '5px' }}>
                                        <HeartPulse size={18} /> Major Illness Report
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563' }}>
                                        {(!selectedDonor.major_illness || ["none", "nil", "no", "n/a", "null", "[null]", "-"].includes(selectedDonor.major_illness.toLowerCase().trim())) 
                                          ? "Clean Record: No major illnesses reported." 
                                          : selectedDonor.major_illness}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonorList;