import React, { useState } from "react";
import { FaLock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/authService";
import './auth.css';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const res = await resetPassword(resetToken, password);
            setMessage(res.message || "Password reset successful!");
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page voter">
                <div className="auth-container single">
                    <div className="auth-form-side" style={{ textAlign: 'center' }}>
                        <div className="auth-icon-wrap" style={{ background: '#dcfce7', color: '#166534', margin: '0 auto 24px' }}>
                            <FaCheckCircle size={32} />
                        </div>
                        <h1 className="auth-title">Success</h1>
                        <p className="auth-subtitle">Your password has been reset. Redirecting to login...</p>
                        <Link to="/login" className="auth-btn" style={{ display: 'block', textDecoration: 'none', lineHeight: '48px', marginTop: '20px' }}>
                            Login Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page voter">
            <div className="auth-container single">
                <div className="auth-form-side">
                    <div className="auth-icon-wrap" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        <FaLock size={28} />
                    </div>

                    <h1 className="auth-title">New Password</h1>
                    <p className="auth-subtitle">Secure your account with a strong password</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label">New Password</label>
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

                        <div className="auth-field">
                            <label className="auth-label">Confirm Password</label>
                            <div className="auth-input-group">
                                <FaLock className="auth-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="auth-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                            <FaArrowLeft size={12} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
