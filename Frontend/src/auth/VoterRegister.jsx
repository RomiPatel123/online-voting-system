import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaVoteYea, FaCloudUploadAlt, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const VoterRegister = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    year: '',
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

  const validateStep = (s) => {
    setError(null);
    if (s === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError("Please fill in all identity fields.");
        return false;
      }
    }
    if (s === 2) {
      if (!formData.department || !formData.year || !formData.election) {
        setError("Please select your academic status and election.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep(step + 1); };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) return nextStep();
    
    if (!formData.password || !idCardFront || !idCardBack) {
      setError("Please provide a password and both ID card images.");
      return;
    }

    setLoading(true);
    setError(null);

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

  const renderStepper = () => (
    <div className="auth-stepper">
      {[1, 2, 3].map(i => (
        <div key={i} className={`step-item ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`}>
          <div className="step-dot">{step > i ? <FaCheck size={12} /> : i}</div>
          <span className="step-label">{i === 1 ? 'ID' : i === 2 ? 'Edu' : 'Key'}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="auth-page register">
      <div className="auth-container">
        
        {/* Banner */}
        <div className="auth-banner">
          <img src="/study_hall_hero.png" alt="Study Hall College" />
          <div className="auth-banner-overlay">
            <h2 className="auth-banner-title">Join Study Hall's Democratic Process</h2>
            <p className="auth-banner-text">
              Every Study Hallian's voice matters in Lucknow's premier student enrollment.
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <button type="button" onClick={() => navigate(-1)} className="auth-back-btn">
            <FiArrowLeft /> Back
          </button>

          <div className="auth-header-group">
            <div className="auth-icon-wrap">
              <FaUser size={20} />
            </div>
            <div className="auth-header-content">
              <h1 className="auth-title">Registration</h1>
              <p className="auth-subtitle">Verify your student status</p>
            </div>
          </div>
          {renderStepper()}

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="step-content">
            <div className="step-fields">
              {step === 1 && (
                <>
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-group">
                      <FaUser className="auth-input-icon" />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="As per ID" className="auth-input" required />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-group">
                      <FaEnvelope className="auth-input-icon" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@studyhall.edu" className="auth-input" required />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Phone</label>
                    <div className="auth-input-group">
                      <FaPhone className="auth-input-icon" />
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91" className="auth-input" required />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="auth-field">
                      <label className="auth-label">Department</label>
                      <div className="auth-input-group">
                        <select name="department" value={formData.department} onChange={handleChange} className="auth-select" required>
                          <option value="" disabled>Select</option>
                          <option value="BCA">BCA</option>
                          <option value="BBA">BBA</option>
                          <option value="B.COM">B.COM</option>
                          <option value="BAJMC">BAJMC</option>
                        </select>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Year</label>
                      <div className="auth-input-group">
                        <select name="year" value={formData.year} onChange={handleChange} className="auth-select" required>
                          <option value="" disabled>Select</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Active Election</label>
                    <div className="auth-input-group">
                      <FaVoteYea className="auth-input-icon" />
                      <select name="election" value={formData.election} onChange={handleChange} className="auth-select" required>
                        <option value="" disabled>Select target election</option>
                        {elections.map((el) => (
                          <option key={el._id} value={el._id}>{el.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-group">
                      <FaLock className="auth-input-icon" />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="auth-input" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="auth-file-label">ID Front</span>
                      <label className={`auth-file-drop ${idCardFront ? 'has-file' : ''}`}>
                        {idCardFront ? <FaCheck size={20} /> : <FaCloudUploadAlt size={20} className="opacity-50" />}
                        <span className="text-[10px] truncate block w-full px-1 mt-1">{idCardFront ? idCardFront.name : "Upload"}</span>
                        <input type="file" accept="image/*" onChange={e => setIdCardFront(e.target.files[0])} className="auth-file-input" required />
                      </label>
                    </div>
                    <div>
                      <span className="auth-file-label">ID Back</span>
                      <label className={`auth-file-drop ${idCardBack ? 'has-file' : ''}`}>
                        {idCardBack ? <FaCheck size={20} /> : <FaCloudUploadAlt size={20} className="opacity-50" />}
                        <span className="text-[10px] truncate block w-full px-1 mt-1">{idCardBack ? idCardBack.name : "Upload"}</span>
                        <input type="file" accept="image/*" onChange={e => setIdCardBack(e.target.files[0])} className="auth-file-input" required />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="auth-btn-row">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="auth-btn secondary">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? (
                  <span className="auth-spinner" />
                ) : step === 3 ? (
                  "Enroll"
                ) : (
                  <>Continue <FaArrowRight size={12} /></>
                )}
              </button>
            </div>
          </form>

          <p className="auth-link-text">
            Already verified? <Link to="/login" className="auth-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterRegister;
