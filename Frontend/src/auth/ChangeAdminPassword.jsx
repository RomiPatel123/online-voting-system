import React, { useState } from "react";
import { FaLock, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { changePassword } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import './auth.css';

const ChangeAdminPassword = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!oldPassword || !newPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New security key must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Confirmation does not match.");
            return;
        }

        try {
            setLoading(true);
            const res = await changePassword(token, oldPassword, newPassword);
            setMessage(res.message || "Admin key updated successfully.");
            
            // Log out after change for security
            setTimeout(() => {
                logout();
                navigate('/admin-login');
            }, 2500);
        } catch (err) {
            setError(err.message || "Failed to update admin credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page admin">
            <div className="auth-container single">
                <div className="auth-form-side">
                    <div className="auth-icon-wrap" style={{ background: '#fef2f2', color: '#dc2626' }}>
                        <FaShieldAlt size={28} />
                    </div>

                    <h1 className="auth-title">Update Security Key</h1>
                    <p className="auth-subtitle">Elevated privilege credential modification</p>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{message}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label">Current Security Key</label>
                            <div className="auth-input-group">
                                <FaLock className="auth-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="auth-input"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
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
                            <label className="auth-label">New Security Key</label>
                            <div className="auth-input-group">
                                <FaLock className="auth-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="auth-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Confirm New Key</label>
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

                        <button type="submit" disabled={loading} className="auth-btn" style={{ background: '#1e293b' }}>
                            {loading ? "Updating..." : "Confirm Credential Change"}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                            <FaArrowLeft size={12} /> Cancel & Return
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeAdminPassword;
