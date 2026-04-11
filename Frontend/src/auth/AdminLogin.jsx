import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
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
    <div className="auth-page admin font-sans">
      <div className="auth-container single shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="auth-form-side">
          <button type="button" onClick={() => navigate(-1)} className="auth-back-btn">
            <FiArrowLeft /> Back
          </button>

          <div className="auth-header-group">
            <div className="auth-icon-wrap">
              <FaUserShield size={32} />
            </div>
            <div className="auth-header-content">
              <h1 className="auth-title">System Administrator</h1>
              <p className="auth-subtitle">Secure infrastructure access</p>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Administrator Email</label>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="admin@studyhall.edu"
                  className="auth-input border-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Security Key</label>
              <div className="auth-input-group">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="auth-input border-none"
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
                <><span className="auth-spinner" /> Authorizing…</>
              ) : (
                "Authorize System Access"
              )}
            </button>
            <div className="auth-extra-links flex justify-between mt-4">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="bg-transparent border-none text-[var(--accent-gold)] cursor-pointer p-0 text-xs font-bold hover:underline"
              >
                Forgot Password?
              </button>
              {/* <button 
                type="button" 
                onClick={() => navigate('/admin/change-password')}
                className="bg-transparent border-none text-slate-500 cursor-pointer p-0 text-xs font-bold hover:text-slate-300"
              >
                Change Access Key
              </button> */}
            </div>
          </form>

          <p className="auth-link-text text-[10px] border-t border-slate-800 pt-6 mt-8 opacity-60">
            Internal Study Hall infrastructure. All administrative sessions are encrypted, logged, and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
