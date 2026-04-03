import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authService";
import './auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            const res = await forgotPassword(email);
            setMessage(res.message || "Reset link sent to your email.");
        } catch (err) {
            setError(err.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page voter">
            <div className="auth-container single">
                <div className="auth-form-side">
                    <div className="auth-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <FaEnvelope size={28} />
                    </div>

                    <h1 className="auth-title">Forgot Password</h1>
                    <p className="auth-subtitle">Enter your email to receive a password reset link</p>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{message}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-group">
                                <FaEnvelope className="auth-input-icon" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn">
                            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
