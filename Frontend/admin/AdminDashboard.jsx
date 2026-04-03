import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../src/context/AuthContext';
import { getElections } from '../src/api/electionService';
import { getVoters } from '../src/api/adminService';
import { Vote, Users, CheckSquare, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminDashboard = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ elections: 0, candidates: 0, voters: 0, active: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [elections, voters] = await Promise.all([
                    getElections(token),
                    getVoters(token)
                ]);
                const candidateCount = elections.reduce((sum, el) => sum + (el.candidates?.length || 0), 0);
                const activeCount = elections.filter(el => el.status === 'active').length;

                setStats({
                    elections: elections.length,
                    candidates: candidateCount,
                    voters: voters.length,
                    active: activeCount,
                });
            } catch (err) {
                console.error('Failed to load dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    const statCards = [
        {
            label: 'Total Elections',
            value: stats.elections,
            icon: <CheckSquare size={22} />,
            iconClass: 'stat-icon-blue',
            cardClass: 'stat-card-blue',
            trend: `${stats.active} currently active`,
        },
        {
            label: 'Total Candidates',
            value: stats.candidates,
            icon: <Vote size={22} />,
            iconClass: 'stat-icon-purple',
            cardClass: 'stat-card-purple',
            trend: 'Across all elections',
        },
        {
            label: 'Registered Voters',
            value: stats.voters,
            icon: <Users size={22} />,
            iconClass: 'stat-icon-green',
            cardClass: 'stat-card-green',
            trend: 'Total registrations',
        },
    ];

    const quickActions = [
        {
            title: 'Manage Elections',
            desc: 'Create, start, or stop elections',
            icon: <CheckSquare size={20} />,
            path: '/admin/elections',
            color: '#6366f1',
        },
        {
            title: 'Verify Voters',
            desc: 'Review ID submissions',
            icon: <Users size={20} />,
            path: '/admin/voters',
            color: '#10b981',
        },
        {
            title: 'View Results',
            desc: 'Live vote tallies & leaderboard',
            icon: <TrendingUp size={20} />,
            path: '/admin/results',
            color: '#f59e0b',
        },
    ];

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">

                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard Overview</h1>
                        <p className="page-subtitle">Welcome back — here's what's happening today.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, color: '#64748b' }}>
                        <Activity size={14} />
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Stat Cards */}
                {loading ? (
                    <div className="loading-text" style={{ marginBottom: 28 }}>
                        <span className="spinner" /> Loading statistics...
                    </div>
                ) : (
                    <div className="stats-grid">
                        {statCards.map((s, i) => (
                            <div key={i} className={`stat-card ${s.cardClass}`}>
                                <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-trend">{s.trend}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <div className="card-title">
                            <Activity size={16} style={{ color: '#6366f1' }} />
                            Quick Actions
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                        {quickActions.map((action, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(action.path)}
                                style={{
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 14,
                                    cursor: 'pointer',
                                    borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: 42, height: 42,
                                    borderRadius: 10,
                                    background: `${action.color}18`,
                                    color: action.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {action.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{action.title}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{action.desc}</div>
                                </div>
                                <ArrowRight size={16} style={{ color: '#cbd5e1', marginTop: 4, flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Info Banner */}
                <div className="quick-actions-banner">
                    <div className="qa-title">🗳️ Online Voting System — Admin Panel</div>
                    <p className="qa-text">
                        You have full control over elections, candidates, and voter verification.
                        Navigate using the sidebar to manage sessions and review ID submissions in real time.
                    </p>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboard;
