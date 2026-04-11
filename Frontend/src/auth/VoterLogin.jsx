import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import './auth.css';

const VoterLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/election";

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
      saveAuth(authData);

      if (authData.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (authData.role === "candidate") {
        navigate("/CandidateDashboard", { replace: true });
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
    <div className="auth-page voter font-sans">
      <div className="auth-container shadow-2xl">
        {/* Left Side (Banner) */}
        <div className="auth-banner">
          <img src="/study_hall_hero.png" alt="Study Hall College" />
          <div className="auth-banner-overlay">
            <h2 className="auth-banner-title">Welcome Back, Study Hallian</h2>
            <p className="auth-banner-text">
              Securely access your electoral dashboard to cast your ballot and stay informed on Study Hall College's council progress.
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="auth-form-side">
          <button type="button" onClick={() => navigate(-1)} className="auth-back-btn">
            <FiArrowLeft /> Back
          </button>

          <div className="auth-header-group">
            <div className="auth-icon-wrap">
              <MdHowToVote size={32} />
            </div>
            <div className="auth-header-content">
              <h1 className="auth-title">Voter Login</h1>
              <p className="auth-subtitle">Lucknow Campus Portal Access</p>
            </div>
          </div>

          {error && (
            <div className="auth-error">
               <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">College Email</label>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="student@studyhall.edu"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Secure Password</label>
              <div className="auth-input-group">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                "Sign In to Vote"
              )}
            </button>
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary-maroon)', fontSize: '13px', fontWeight: '700' }}>Forgot Credentials?</Link>
            </div>
          </form>

          <p className="auth-link-text">
            Don't have a voting account? <Link to="/register" className="auth-link">Enroll in elections</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterLogin;
