import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import './auth.css';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const authData = await login({ email, password });
      
      if (authData.role !== "admin") {
         setError("Access denied. Administrator privileges required.");
         setLoading(false);
         return;
      }

      saveAuth(authData);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin">
      <div className="auth-container single">
        <div className="auth-form-side">
          <div className="auth-icon-wrap">
            <FaUserShield size={32} />
          </div>

          <h1 className="auth-title">System Administrator</h1>
          <p className="auth-subtitle">Secure backend election management access</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Administrator Email</label>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="admin@system.gov"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Security Key / Password</label>
              <div className="auth-input-group">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <><span className="auth-spinner" /> Verifying…</>
              ) : (
                "Authorize Access"
              )}
            </button>
            <div className="auth-extra-links" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px' }}>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/admin/change-password')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                Change Admin Key
              </button>
            </div>
          </form>

          <p className="auth-link-text" style={{ fontSize: 12, borderTop: '1px solid #334155', paddingTop: 16 }}>
            Admin interactions are strictly monitored and logged.<br/>
            <span style={{ fontFamily: 'monospace', opacity: 0.6 }}>NODE_ENV: production</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
