import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../src/context/AuthContext';
import {
    getElections, createElection, startElection, stopElection,
    addCandidate, deleteCandidate, updateCandidate, updateElection, deleteElection
} from '../src/api/electionService';
import { Play, Square, Plus, Users, Calendar, Trash2, Pencil, CheckSquare } from 'lucide-react';
import './admin.css';

const AdminElections = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newElection, setNewElection] = useState({ 
        title: '', description: '', startDate: '', endDate: '',
        type: 'General', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });

    const [showEditCandidateModal, setShowEditCandidateModal] = useState(false);
    const [editCandidateData, setEditCandidateData] = useState({ 
        _id: '', name: '', email: '', bio: '',
        role: 'CR', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });
    const [editPhoto, setEditPhoto] = useState(null);
    
    const [showEditElectionModal, setShowEditElectionModal] = useState(false);
    const [editElectionData, setEditElectionData] = useState({ 
        _id: '', title: '', description: '', startDate: '', endDate: '',
        type: 'General', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });

    const fetchElections = async () => {
        setLoading(true);
        try {
            const data = await getElections(token);
            setElections(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchElections(); }, [token]);

    const handleCreateElection = async (e) => {
        e.preventDefault();
        try {
            await createElection(newElection, token);
            setShowCreateModal(false);
            setNewElection({ 
                title: '', description: '', startDate: '', endDate: '',
                type: 'General', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
            });
            fetchElections();
        } catch (err) { alert(err.message); }
    };



    const handleDeleteCandidate = async (id) => {
        if (!window.confirm('Remove this candidate?')) return;
        try { await deleteCandidate(id, token); fetchElections(); }
        catch (err) { alert(err.message); }
    };

    const openEditModal = (c) => {
        setEditCandidateData({ 
            _id: c._id, name: c.name, email: c.email || '', bio: c.bio || '',
            role: c.role || 'CR', targetYear: c.targetYear || 'All', targetDepartment: c.targetDepartment || 'All', targetSection: c.targetSection || 'All'
        });
        setEditPhoto(null);
        setShowEditCandidateModal(true);
    };

    const handleUpdateCandidate = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.keys(editCandidateData).forEach(k => { if (k !== '_id') fd.append(k, editCandidateData[k]); });
            if (editPhoto) fd.append('photo', editPhoto);
            await updateCandidate(editCandidateData._id, fd, token);
            setShowEditCandidateModal(false); fetchElections();
        } catch (err) { alert(err.message); }
    };

    const openEditElectionModal = (e) => {
        setEditElectionData({
            _id: e._id,
            title: e.title,
            description: e.description,
            startDate: e.startDate.substring(0, 16), // datetime-local format
            endDate: e.endDate.substring(0, 16),
            type: e.type || 'General',
            targetYear: e.targetYear || 'All',
            targetDepartment: e.targetDepartment || 'All',
            targetSection: e.targetSection || 'All'
        });
        setShowEditElectionModal(true);
    };

    const handleDeleteElection = async (id) => {
        if (!window.confirm('🚨 WARNING: This will permanently delete the election and ALL its candidates. Do you want to proceed?')) return;
        try {
            await deleteElection(id, token);
            fetchElections();
        } catch (err) { alert(err.message); }
    };

    const handleUpdateElection = async (e) => {
        e.preventDefault();
        try {
            const { _id, ...data } = editElectionData;
            await updateElection(_id, data, token);
            setShowEditElectionModal(false);
            fetchElections();
        } catch (err) { alert(err.message); }
    };

    const handleStatusToggle = async (id, status) => {
        try {
            if (status === 'upcoming' || status === 'stopped') await startElection(id, token);
            else if (status === 'active') await stopElection(id, token);
            fetchElections();
        } catch (err) { alert(err.message); }
    };

    const statusBadge = (status) => {
        const map = { 
            active: { class: 'badge-active', icon: '🟢', label: 'Live Now' }, 
            upcoming: { class: 'badge-upcoming', icon: '⏳', label: 'Scheduled' }, 
            stopped: { class: 'badge-stopped', icon: '🛑', label: 'Ended Early' },
            completed: { class: 'badge-verified', icon: '🏁', label: 'Results Ready' } 
        };
        const s = map[status] || map.upcoming;
        return (
            <span className={`badge ${s.class}`} style={{ padding: '6px 14px', fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>
                {s.icon} {s.label.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">

                {/* Header */}
                <div className="page-header animate-slide-in">
                    <div>
                        <h1 className="page-title" style={{ fontSize: 34, fontWeight: 950, letterSpacing: -1 }}>Election Control</h1>
                        <p className="page-subtitle" style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>Create, monitor, and finalize institutional voting mandates.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: 14 }}>
                        <Plus size={20} /> New Election
                    </button>
                </div>

                {/* Elections List */}
                {loading ? (
                    <div className="loading-text" style={{ padding: 60, justifyContent: 'center' }}>
                        <span className="spinner" style={{ width: 24, height: 24 }} /> 
                        <span style={{ fontSize: 16, fontWeight: 600 }}>Syncing election database...</span>
                    </div>
                ) : elections.length === 0 ? (
                    <div className="card animate-fade-in" style={{ borderStyle: 'dashed', background: '#f8fafc' }}>
                        <div className="empty-state">
                            <div className="empty-icon" style={{ background: 'white' }}><CheckSquare size={32} style={{ color: '#cbd5e1' }} /></div>
                            <div className="empty-title">Initialization Required</div>
                            <div className="empty-subtitle">Your election roster is currently empty. Start by creating a new mandate.</div>
                            <button className="btn btn-outline btn-sm" onClick={() => setShowCreateModal(true)} style={{ marginTop: 20 }}>
                                Create First Election
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {elections.map((election, index) => (
                            <div 
                                key={election._id} 
                                className="election-card animate-slide-up" 
                                style={{ 
                                    animationDelay: `${index * 0.1}s`,
                                    border: '1px solid #f1f5f9',
                                    background: 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.05)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div className="election-card-accent" style={{ 
                                    background: election.status === 'active' ? 'linear-gradient(90deg, #10b981, #3b82f6)' : 
                                               election.status === 'upcoming' ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 
                                               'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                                }} />

                                {/* Card Header */}
                                <div className="election-card-header" style={{ padding: '28px 32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                                            <h2 className="election-title" style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{election.title}</h2>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button 
                                                    className="btn btn-ghost btn-icon" 
                                                    onClick={() => openEditElectionModal(election)}
                                                    style={{ color: '#6366f1', background: '#f5f3ff' }}
                                                    title="Edit Settings"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button 
                                                    className="btn btn-ghost btn-icon" 
                                                    onClick={() => handleDeleteElection(election._id)}
                                                    style={{ color: '#ef4444', background: '#fef2f2' }}
                                                    title="Purge Election"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="election-description" style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: '80%' }}>{election.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {statusBadge(election.status)}
                                    </div>
                                </div>

                                {/* Meta Information */}
                                <div className="election-meta" style={{ padding: '0 32px 24px', background: 'transparent', border: 'none', gap: 32 }}>
                                    <div className="meta-item" style={{ fontSize: 13, fontWeight: 600 }}>
                                        <div style={{ background: '#f1f5f9', padding: 6, borderRadius: 8, marginRight: 8, display: 'inline-flex' }}>
                                            <Calendar size={14} style={{ color: '#475569' }} />
                                        </div>
                                        {new Date(election.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(election.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="meta-item" style={{ fontSize: 13, fontWeight: 600 }}>
                                        <div style={{ background: '#f1f5f9', padding: 6, borderRadius: 8, marginRight: 8, display: 'inline-flex' }}>
                                            <Users size={14} style={{ color: '#475569' }} />
                                        </div>
                                        {election.candidates?.length || 0} Registered Candidates
                                    </div>
                                </div>

                                {/* Candidates Segment */}
                                {election.candidates?.length > 0 && (
                                    <div className="candidates-section" style={{ background: 'rgba(248, 250, 252, 0.5)', padding: '24px 32px' }}>
                                        <div className="candidates-label" style={{ marginBottom: 16 }}>Nominated Leadership</div>
                                        <div className="candidates-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                                            {election.candidates.map(c => (
                                                <div key={c._id} className="candidate-chip" style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: 'white' }}>
                                                    <div className="candidate-info">
                                                        {c.photo
                                                            ? <img src={`http://localhost:5000${c.photo}`} className="candidate-avatar" style={{ borderRadius: '24%', border: '2px solid #eef2ff' }} alt={c.name} />
                                                            : <div className="candidate-avatar-placeholder" style={{ borderRadius: '24%', background: '#f1f5f9', color: '#64748b' }}>{c.name?.charAt(0)}</div>
                                                        }
                                                        <div>
                                                            <div className="candidate-name" style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                                                        </div>
                                                    </div>
                                                    <div className="chip-actions">
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            style={{ color: '#6366f1', padding: 4 }}
                                                            onClick={() => openEditModal(c)}
                                                            title="Edit Profile"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            style={{ color: '#ef4444', padding: 4 }}
                                                            onClick={() => handleDeleteCandidate(c._id)}
                                                            title="Remove Candidate"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Control Actions */}
                                <div className="election-footer" style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 700, border: '1.5px solid #e2e8f0' }}
                                        onClick={() => navigate(`/admin/elections/${election._id}/add-candidate`)}
                                    >
                                        <Plus size={16} /> Enroll Candidate
                                    </button>

                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {(election.status === 'upcoming' || election.status === 'stopped') && (
                                            <button
                                                className="btn btn-success"
                                                style={{ borderRadius: 12, padding: '10px 24px', fontWeight: 700, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                                                onClick={() => handleStatusToggle(election._id, election.status)}
                                            >
                                                <Play size={16} fill="white" /> Launch Election
                                            </button>
                                        )}
                                        {election.status === 'active' && (
                                            <button
                                                className="btn btn-danger"
                                                style={{ borderRadius: 12, padding: '10px 24px', fontWeight: 700, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}
                                                onClick={() => handleStatusToggle(election._id, election.status)}
                                            >
                                                <Square size={16} fill="white" /> Suspend Voting
                                            </button>
                                        )}
                                        {election.status === 'completed' && (
                                            <button
                                                className="btn btn-ghost"
                                                style={{ borderRadius: 12, color: '#10b981', fontWeight: 800, background: '#ecfdf5' }}
                                                disabled
                                            >
                                                <CheckSquare size={16} /> Finalized
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Create Election Modal ── */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="modal-box modal-box-wide animate-slide-up" style={{ padding: 0, borderRadius: 24, border: 'none' }}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px 32px' }}>
                            <div>
                                <h2 className="modal-title" style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>Create New Mandate</h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>Configure the parameters for the next voting session.</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)} style={{ color: 'white', opacity: 0.6 }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateElection}>
                            <div className="modal-body" style={{ padding: 40 }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={12} /> Election Title
                                    </label>
                                    <input className="form-input" placeholder="e.g. Presidential Election 2025" required
                                        style={{ padding: 14, fontSize: 15 }}
                                        value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description & Purpose</label>
                                    <textarea className="form-input" placeholder="Provide context for voters..." rows={3} style={{ resize: 'none', padding: 14 }}
                                        value={newElection.description} onChange={e => setNewElection({ ...newElection, description: e.target.value })} />
                                </div>
                                <div className="form-grid-2" style={{ gap: 24 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={12} /> Start Date & Time
                                        </label>
                                        <input type="datetime-local" className="form-input" required
                                            style={{ padding: 12 }}
                                            value={newElection.startDate} onChange={e => setNewElection({ ...newElection, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={12} /> End Date & Time
                                        </label>
                                        <input type="datetime-local" className="form-input" required
                                            style={{ padding: 12 }}
                                            value={newElection.endDate} onChange={e => setNewElection({ ...newElection, endDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '24px 40px', background: '#f8fafc' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: 14, padding: 14 }} onClick={() => setShowCreateModal(false)}>Discard</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: 14, padding: 14, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>Deploy Election</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Candidate Modal ── */}
            {showEditCandidateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditCandidateModal(false)}>
                    <div className="modal-box modal-box-wide animate-slide-up" style={{ padding: 0, borderRadius: 24, border: 'none' }}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '24px 32px' }}>
                            <div>
                                <h2 className="modal-title" style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>Edit Candidate Profile</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Update personal details and eligibility criteria.</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowEditCandidateModal(false)} style={{ color: 'white', opacity: 0.6 }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateCandidate}>
                            <div className="modal-body" style={{ padding: 40 }}>
                                <div className="form-grid-2" style={{ gap: 24 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Legal Name</label>
                                        <input className="form-input" required
                                            value={editCandidateData.name} onChange={e => setEditCandidateData({ ...editCandidateData, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Institutional Email</label>
                                        <input type="email" className="form-input"
                                            value={editCandidateData.email} onChange={e => setEditCandidateData({ ...editCandidateData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Professional Biography</label>
                                    <textarea className="form-input" rows={2} style={{ resize: 'none' }}
                                        value={editCandidateData.bio} onChange={e => setEditCandidateData({ ...editCandidateData, bio: e.target.value })} />
                                </div>

                                <div className="form-group" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                                    <label className="form-label">Electoral Role</label>
                                    <select className="form-input" 
                                        value={editCandidateData.role || 'CR'} onChange={e => setEditCandidateData({ ...editCandidateData, role: e.target.value })}>
                                        <option value="CR">CR (Class Representative)</option>
                                        <option value="Secretary">Secretary</option>
                                        <option value="Joint Secretary">Joint Secretary</option>
                                        <option value="Additional Joint Secretary">Additional Joint Secretary</option>
                                    </select>
                                </div>

                                {editCandidateData.role === 'CR' && (
                                    <div className="animate-fade-in">
                                        <div className="form-grid-2" style={{ gap: 24 }}>
                                            <div className="form-group">
                                                <label className="form-label">Academic Year</label>
                                                <select className="form-input" 
                                                    value={editCandidateData.targetYear || 'All'} onChange={e => setEditCandidateData({ ...editCandidateData, targetYear: e.target.value })}>
                                                    <option value="All">All Years</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Department</label>
                                                <select className="form-input" 
                                                    value={editCandidateData.targetDepartment || 'All'} onChange={e => setEditCandidateData({ ...editCandidateData, targetDepartment: e.target.value })}>
                                                    <option value="All">All Departments</option>
                                                    <option value="BCA">BCA</option>
                                                    <option value="BBA">BBA</option>
                                                    <option value="B.COM">B.COM</option>
                                                    <option value="BAJMC">BAJMC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Class Section</label>
                                            <select className="form-input" 
                                                value={editCandidateData.targetSection || 'All'} onChange={e => setEditCandidateData({ ...editCandidateData, targetSection: e.target.value })}>
                                                <option value="All">All Sections</option>
                                                <option value="A">Section A</option>
                                                <option value="B">Section B</option>
                                                <option value="C">Section C</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginTop: 20 }}>
                                    <label className="form-label">Update Portrait</label>
                                    <input type="file" accept="image/*" className="form-file" onChange={e => setEditPhoto(e.target.files[0])} />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '24px 40px', background: '#f8fafc' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: 14, padding: 14 }} onClick={() => setShowEditCandidateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: 14, padding: 14, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>Save Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Election Modal ── */}
            {showEditElectionModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditElectionModal(false)}>
                    <div className="modal-box modal-box-wide animate-slide-up" style={{ padding: 0, borderRadius: 24, border: 'none' }}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4338ca, #3730a3)', padding: '24px 32px' }}>
                            <div>
                                <h2 className="modal-title" style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>Adjust Mandate Settings</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Modify timelines or descriptions for the active mandate.</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowEditElectionModal(false)} style={{ color: 'white', opacity: 0.6 }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateElection}>
                            <div className="modal-body" style={{ padding: 40 }}>
                                <div className="form-group">
                                    <label className="form-label">Identification Title</label>
                                    <input className="form-input" required
                                        style={{ padding: 14, fontSize: 15 }}
                                        value={editElectionData.title} onChange={e => setEditElectionData({ ...editElectionData, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mandate Description</label>
                                    <textarea className="form-input" rows={3} style={{ resize: 'none', padding: 14 }}
                                        value={editElectionData.description} onChange={e => setEditElectionData({ ...editElectionData, description: e.target.value })} />
                                </div>
                                <div className="form-grid-2" style={{ gap: 24 }}>
                                    <div className="form-group">
                                        <label className="form-label">Updated Start Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            style={{ padding: 12 }}
                                            value={editElectionData.startDate} onChange={e => setEditElectionData({ ...editElectionData, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Updated End Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            style={{ padding: 12 }}
                                            value={editElectionData.endDate} onChange={e => setEditElectionData({ ...editElectionData, endDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '24px 40px', background: '#f8fafc' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: 14, padding: 14 }} onClick={() => setShowEditElectionModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: 14, padding: 14, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>Update Mandate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminElections;

