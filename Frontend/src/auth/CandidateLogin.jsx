import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUserTie } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import './auth.css';

const CandidateLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/CandidateDashboard";

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
      
      if (authData.role !== "candidate" && authData.role !== "admin") {
         setError("Access denied. Candidate privileges required.");
         setLoading(false);
         return;
      }
      
      saveAuth(authData);

      if (authData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page candidate">
      <div className="auth-container">
        
        {/* Left Side */}
        <div className="auth-banner" style={{ background: '#4c1d95' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 10px 10px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="auth-banner-overlay">
            <h2 className="auth-banner-title">Candidate Portal</h2>
            <p className="auth-banner-text">
              Manage your campaign, connect with voters, and view real-time statistics of your election performance securely.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-form-side">
          <div className="auth-icon-wrap">
            <FaUserTie size={32} />
          </div>

          <h1 className="auth-title">Candidate Login</h1>
          <p className="auth-subtitle">Access your election dashboard</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="candidate@party.com"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
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
                <><span className="auth-spinner" /> Authenticating…</>
              ) : (
                "Access Dashboard"
              )}
            </button>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <Link to="/forgot-password" style={{ color: '#6d28d9', fontSize: '13px', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
          </form>

          <p className="auth-link-text">
            Not registered as a candidate? <Link to="/register" className="auth-link">Join the election</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
