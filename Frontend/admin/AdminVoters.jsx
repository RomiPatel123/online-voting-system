import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../src/context/AuthContext';
import { getVoters, verifyVoter, rejectVoter } from '../src/api/adminService';
import { CheckCircle, XCircle, Eye, Users } from 'lucide-react';
import './admin.css';

const AdminVoters = () => {
    const { token } = useAuth();
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVoter, setSelectedVoter] = useState(null);

    const fetchVoters = async () => {
        setLoading(true);
        try {
            const data = await getVoters(token);
            setVoters(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVoters(); }, [token]);

    const handleVerify = async (id) => {
        try { await verifyVoter(id, token); fetchVoters(); setSelectedVoter(null); }
        catch (err) { alert(err.message); }
    };

    const handleReject = async (id) => {
        try { await rejectVoter(id, token); fetchVoters(); setSelectedVoter(null); }
        catch (err) { alert(err.message); }
    };

    const pendingCount  = voters.filter(v => !v.isVerified).length;
    const verifiedCount = voters.filter(v => v.isVerified).length;

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Voter Verification</h1>
                        <p className="page-subtitle">Review ID card submissions and approve registered voters.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ padding: '8px 16px', background: '#dcfce7', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                            ✓ {verifiedCount} Verified
                        </div>
                        <div style={{ padding: '8px 16px', background: '#fef3c7', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                            ⏳ {pendingCount} Pending
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Users size={16} style={{ color: '#10b981' }} /> All Registered Voters</div>
                    </div>

                    {loading ? (
                        <div className="card-body">
                            <div className="loading-text"><span className="spinner" /> Loading voters...</div>
                        </div>
                    ) : voters.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Users size={24} /></div>
                            <div className="empty-title">No voters registered</div>
                            <div className="empty-subtitle">Voters will appear here once they sign up.</div>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Section</th>
                                    <th>Registered Election</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voters.map((voter, idx) => (
                                    <tr key={voter._id}>
                                        <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 12, color: '#6366f1', flexShrink: 0,
                                                }}>
                                                    {voter.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{voter.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{voter.email}</td>
                                        <td style={{ color: '#64748b' }}>{voter.department || '—'}</td>
                                        <td style={{ color: '#64748b' }}>{voter.year || '—'}</td>
                                        <td style={{ color: '#64748b' }}>{voter.section || '—'}</td>
                                        <td style={{ color: '#64748b' }}>
                                            {voter.registeredElections?.map(e => e.title).join(', ') || '—'}
                                        </td>
                                        <td>
                                            {voter.isVerified
                                                ? <span className="badge badge-verified">✓ Verified</span>
                                                : <span className="badge badge-pending">⏳ Pending</span>
                                            }
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: '#6366f1', gap: 6 }}
                                                onClick={() => setSelectedVoter(voter)}
                                            >
                                                <Eye size={15} /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* ── ID Card Review Modal ── */}
            {selectedVoter && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedVoter(null)}>
                    <div className="modal-box modal-box-wide">
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Review Voter Details</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Verify identity information against ID documents.</div>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedVoter(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Full Name</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Email Address</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.email}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Phone Number</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.phone || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Registered Election(s)</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                        {selectedVoter.registeredElections?.map(e => e.title).join(', ') || '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Department</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.department || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Year</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.year || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Section</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedVoter.section || '—'}</div>
                                </div>
                            </div>

                            <div className="id-card-grid">
                                <div>
                                    <div className="id-card-slot-label">ID Card Front</div>
                                    {selectedVoter.idCardFront
                                        ? <img src={`http://localhost:5000${selectedVoter.idCardFront}`} alt="ID Front" className="id-card-img" />
                                        : <div className="id-card-placeholder">No image uploaded</div>
                                    }
                                </div>
                                <div>
                                    <div className="id-card-slot-label">ID Card Back</div>
                                    {selectedVoter.idCardBack
                                        ? <img src={`http://localhost:5000${selectedVoter.idCardBack}`} alt="ID Back" className="id-card-img" />
                                        : <div className="id-card-placeholder">No image uploaded</div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-outline"
                                style={{ color: '#ef4444', borderColor: '#fecaca' }}
                                onClick={() => handleReject(selectedVoter._id)}
                            >
                                <XCircle size={16} /> Reject
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => handleVerify(selectedVoter._id)}
                            >
                                <CheckCircle size={16} /> Verify Voter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVoters;
