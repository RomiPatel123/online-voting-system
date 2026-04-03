import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaVoteYea, FaCloudUploadAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const VoterRegister = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    year: '',
    section: '',
    election: ''
  });
  const [elections, setElections] = useState([]);

  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch('/api/elections/public');
        const data = await res.json();
        if (res.ok) setElections(data);
      } catch (err) {
        console.error("Failed to fetch elections", err);
      }
    };
    fetchElections();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (idCardFront) fd.append("idCardFront", idCardFront);
      if (idCardBack) fd.append("idCardBack", idCardBack);

      const data = await register(fd);
      saveAuth(data);
      navigate('/election');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register">
      <div className="auth-container">
        
        {/* Left Side (Banner) */}
        <div className="auth-banner" style={{ background: '#1e3a8a' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 10px 10px, #fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="auth-banner-overlay" style={{ background: 'linear-gradient(to top, rgba(30,58,138,0.95), rgba(30,58,138,0.3))' }}>
            <h2 className="auth-banner-title">Join the Electoral Roll</h2>
            <p className="auth-banner-text">
              Create an account to participate in the election. We use strict verification to ensure every vote is authentic and secure.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="auth-form-side" style={{ padding: '32px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="auth-icon-wrap" style={{ marginBottom: 16 }}>
            <FaUser size={28} />
          </div>

          <h1 className="auth-title" style={{ fontSize: 24 }}>Voter Registration</h1>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>Create your secure voting account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            
            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <FaUser className="auth-input-icon" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name as per ID Card" className="auth-input" required />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="auth-input" required />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <FaPhone className="auth-input-icon" />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="auth-input" required />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <select name="department" value={formData.department} onChange={handleChange} className="auth-select" required style={{ paddingLeft: 16 }}>
                  <option value="" disabled>Select Department</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="B.COM">B.COM</option>
                  <option value="BAJMC">BAJMC</option>
                </select>
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <select name="year" value={formData.year} onChange={handleChange} className="auth-select" required style={{ paddingLeft: 16 }}>
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                </select>
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <select name="section" value={formData.section} onChange={handleChange} className="auth-select" required style={{ paddingLeft: 16 }}>
                  <option value="" disabled>Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 16 }}>
              <div className="auth-input-group">
                <FaLock className="auth-input-icon" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Secure Password" className="auth-input" required />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: 24 }}>
              <div className="auth-input-group">
                <FaVoteYea className="auth-input-icon" />
                <select name="election" value={formData.election} onChange={handleChange} className="auth-select" required>
                  <option value="" disabled>Select an Election target</option>
                  {elections.map((el) => (
                    <option key={el._id} value={el._id}>{el.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <span className="auth-file-label">ID Card Front</span>
                <label className="auth-file-drop">
                  <FaCloudUploadAlt size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                  {idCardFront ? <span style={{ color: '#2563eb', fontWeight: 600 }}>{idCardFront.name.slice(0, 15)}...</span> : "Upload Front"}
                  <input type="file" accept="image/*" onChange={e => setIdCardFront(e.target.files[0])} className="auth-file-input" required />
                </label>
              </div>
              <div>
                <span className="auth-file-label">ID Card Back</span>
                <label className="auth-file-drop">
                  <FaCloudUploadAlt size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                  {idCardBack ? <span style={{ color: '#2563eb', fontWeight: 600 }}>{idCardBack.name.slice(0, 15)}...</span> : "Upload Back"}
                  <input type="file" accept="image/*" onChange={e => setIdCardBack(e.target.files[0])} className="auth-file-input" required />
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <><span className="auth-spinner" /> Registering…</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="auth-link-text" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterRegister;
