import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
        try { await verifyVoter(id, token); fetchVoters(); setSelectedVoter(null); toast.success("Voter verified"); }
        catch (err) { toast.error(err.message); }
    };

    const handleReject = async (id) => {
        try { await rejectVoter(id, token); fetchVoters(); setSelectedVoter(null); toast.success("Voter rejected"); }
        catch (err) { toast.error(err.message); }
    };

    const filteredVoters = voters.filter(v => {
        const matchesDept = filterDepartment === 'All' || v.department === filterDepartment;
        const matchesYear = filterYear === 'All' || v.year === filterYear;
        const matchesSearch = (v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (v.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesYear && matchesSearch;
    });

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

                {/* Search & Filter Bar */}
                <div className="card" style={{ marginBottom: 24, padding: '16px 24px', borderRadius: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                className="form-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 40, borderRadius: 12 }}
                            />
                            <Users size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </div>
                        
                        <div style={{ display: 'flex', gap: 12 }}>
                            <select 
                                className="form-input" 
                                value={filterDepartment} 
                                onChange={e => setFilterDepartment(e.target.value)}
                                style={{ width: 180, borderRadius: 12 }}
                            >
                                <option value="All">All Departments</option>
                                <option value="BCA">BCA</option>
                                <option value="BBA">BBA</option>
                                <option value="B.COM">B.COM</option>
                                <option value="BAJMC">BAJMC</option>
                            </select>

                            <select 
                                className="form-input" 
                                value={filterYear} 
                                onChange={e => setFilterYear(e.target.value)}
                                style={{ width: 160, borderRadius: 12 }}
                            >
                                <option value="All">All Years</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                            </select>

                            {(filterDepartment !== 'All' || filterYear !== 'All' || searchQuery !== '') && (
                                <button 
                                    className="btn btn-ghost" 
                                    onClick={() => { setFilterDepartment('All'); setFilterYear('All'); setSearchQuery(''); }}
                                    style={{ color: '#6366f1', fontWeight: 700 }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <Users size={16} style={{ color: '#10b981' }} /> 
                            {filteredVoters.length} Voter{filteredVoters.length !== 1 ? 's' : ''} Found
                        </div>
                    </div>

                    {loading ? (
                        <div className="card-body">
                            <div className="loading-text"><span className="spinner" /> Loading voters...</div>
                        </div>
                    ) : filteredVoters.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Users size={24} /></div>
                            <div className="empty-title">No voters match your filters</div>
                            <div className="empty-subtitle">Try adjusting your search or category selection.</div>
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
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVoters.map((voter, idx) => (

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
                            </div>

                            <div className="id-card-grid">
                                <div>
                                    <div className="id-card-slot-label">ID Card Front</div>
                                    {selectedVoter.idCardFront
                                        ? <img src={selectedVoter.idCardFront} alt="ID Front" className="id-card-img" />
                                        : <div className="id-card-placeholder">No image uploaded</div>
                                    }
                                </div>
                                <div>
                                    <div className="id-card-slot-label">ID Card Back</div>
                                    {selectedVoter.idCardBack
                                        ? <img src={selectedVoter.idCardBack} alt="ID Back" className="id-card-img" />
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
