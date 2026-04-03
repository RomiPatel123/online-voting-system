import React, { useEffect, useState } from 'react';
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
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newElection, setNewElection] = useState({ 
        title: '', description: '', startDate: '', endDate: '',
        type: 'General', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });

    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedElection, setSelectedElection] = useState(null);
    const [candidateData, setCandidateData] = useState({ 
        name: '', email: '', password: '', party: '', bio: '',
        role: 'CR', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });
    const [partySymbol, setPartySymbol] = useState(null);
    const [photo, setPhoto] = useState(null);

    const [showEditCandidateModal, setShowEditCandidateModal] = useState(false);
    const [editCandidateData, setEditCandidateData] = useState({ 
        _id: '', name: '', email: '', party: '', bio: '',
        role: 'CR', targetYear: 'All', targetDepartment: 'All', targetSection: 'All'
    });
    const [editPartySymbol, setEditPartySymbol] = useState(null);
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

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.keys(candidateData).forEach(k => fd.append(k, candidateData[k]));
            if (partySymbol) fd.append('partySymbol', partySymbol);
            if (photo) fd.append('photo', photo);
            await addCandidate(selectedElection._id, fd, token);
            setShowCandidateModal(false);
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
            _id: c._id, name: c.name, email: c.email || '', party: c.party, bio: c.bio || '',
            role: c.role || 'CR', targetYear: c.targetYear || 'All', targetDepartment: c.targetDepartment || 'All', targetSection: c.targetSection || 'All'
        });
        setEditPhoto(null); setEditPartySymbol(null);
        setShowEditCandidateModal(true);
    };

    const handleUpdateCandidate = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.keys(editCandidateData).forEach(k => { if (k !== '_id') fd.append(k, editCandidateData[k]); });
            if (editPartySymbol) fd.append('partySymbol', editPartySymbol);
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
            active: 'badge-active', 
            upcoming: 'badge-upcoming', 
            stopped: 'badge-stopped',
            completed: 'badge-verified' 
        };
        return <span className={`badge ${map[status] || 'badge-upcoming'}`}>
            {status === 'completed' ? '✓ Completed' : status}
        </span>;
    };

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Manage Elections</h1>
                        <p className="page-subtitle">Create and control all voting sessions.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={17} /> New Election
                    </button>
                </div>

                {/* Elections List */}
                {loading ? (
                    <div className="loading-text"><span className="spinner" /> Loading elections...</div>
                ) : elections.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-icon"><CheckSquare size={24} /></div>
                            <div className="empty-title">No elections yet</div>
                            <div className="empty-subtitle">Click "New Election" to create your first one.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {elections.map(election => (
                            <div key={election._id} className="election-card">
                                <div className="election-card-accent" />

                                {/* Card Header */}
                                <div className="election-card-header">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="election-title">{election.title}</div>
                                            <button 
                                                className="btn btn-ghost btn-icon" 
                                                onClick={() => openEditElectionModal(election)}
                                                style={{ color: '#6366f1' }}
                                                title="Edit Election Details"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                className="btn btn-ghost btn-icon" 
                                                onClick={() => handleDeleteElection(election._id)}
                                                style={{ color: '#ef4444' }}
                                                title="Delete Entire Election"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="election-description">{election.description}</div>
                                    </div>
                                    {statusBadge(election.status)}
                                </div>

                                {/* Meta */}
                                <div className="election-meta">
                                    <div className="meta-item"><Calendar size={14} /> Start: {new Date(election.startDate).toLocaleDateString('en-IN')}</div>
                                    <div className="meta-item"><Calendar size={14} /> End: {new Date(election.endDate).toLocaleDateString('en-IN')}</div>
                                    <div className="meta-item"><Users size={14} /> {election.candidates?.length || 0} Candidates</div>
                                </div>

                                {/* Footer Actions */}
                                <div className="election-footer">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => { setSelectedElection(election); setShowCandidateModal(true); }}
                                    >
                                        <Plus size={15} /> Add Candidate
                                    </button>

                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {(election.status === 'upcoming' || election.status === 'stopped') && (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleStatusToggle(election._id, election.status)}
                                            >
                                                <Play size={14} /> Start Voting
                                            </button>
                                        )}
                                        {election.status === 'active' && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleStatusToggle(election._id, election.status)}
                                            >
                                                <Square size={14} /> Stop Voting
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Candidates */}
                                {election.candidates?.length > 0 && (
                                    <div className="candidates-section">
                                        <div className="candidates-label">Registered Candidates</div>
                                        <div className="candidates-grid">
                                            {election.candidates.map(c => (
                                                <div key={c._id} className="candidate-chip">
                                                    <div className="candidate-info">
                                                        {c.photo
                                                            ? <img src={`http://localhost:5000${c.photo}`} className="candidate-avatar" alt={c.name} />
                                                            : <div className="candidate-avatar-placeholder">{c.name?.charAt(0)}</div>
                                                        }
                                                        <div>
                                                            <div className="candidate-name">{c.name}</div>
                                                            <div className="candidate-party">{c.party}</div>
                                                        </div>
                                                    </div>
                                                    <div className="chip-actions">
                                                        <button
                                                            className="btn btn-ghost btn-icon"
                                                            style={{ color: '#6366f1' }}
                                                            onClick={() => openEditModal(c)}
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-icon"
                                                            style={{ color: '#ef4444' }}
                                                            onClick={() => handleDeleteCandidate(c._id)}
                                                            title="Remove"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Create Election Modal ── */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <div className="modal-title">Create New Election</div>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateElection}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Election Title</label>
                                    <input className="form-input" placeholder="e.g. Presidential Election 2025" required
                                        value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" placeholder="Brief description..." rows={3} style={{ resize: 'none' }}
                                        value={newElection.description} onChange={e => setNewElection({ ...newElection, description: e.target.value })} />
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Start Date & Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            value={newElection.startDate} onChange={e => setNewElection({ ...newElection, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date & Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            value={newElection.endDate} onChange={e => setNewElection({ ...newElection, endDate: e.target.value })} />
                                    </div>
                                </div>


                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Election</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Add Candidate Modal ── */}
            {showCandidateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCandidateModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Add Candidate</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{selectedElection?.title}</div>
                            </div>
                            <button className="modal-close" onClick={() => setShowCandidateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddCandidate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" placeholder="Candidate full name" required
                                        value={candidateData.name} onChange={e => setCandidateData({ ...candidateData, name: e.target.value })} />
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-input" placeholder="email@example.com" required
                                            value={candidateData.email} onChange={e => setCandidateData({ ...candidateData, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Temporary Password</label>
                                        <input type="password" className="form-input" placeholder="••••••••" required
                                            value={candidateData.password} onChange={e => setCandidateData({ ...candidateData, password: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Political Party</label>
                                    <input className="form-input" placeholder="Party name" required
                                        value={candidateData.party} onChange={e => setCandidateData({ ...candidateData, party: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biography</label>
                                    <textarea className="form-input" placeholder="Short bio..." rows={2} style={{ resize: 'none' }}
                                        value={candidateData.bio} onChange={e => setCandidateData({ ...candidateData, bio: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                                    <label className="form-label">Role Category</label>
                                    <select className="form-input" 
                                        value={candidateData.role || 'CR'} onChange={e => setCandidateData({ ...candidateData, role: e.target.value })}>
                                        <option value="CR">CR (Class Representative)</option>
                                        <option value="Secretary">Secretary</option>
                                        <option value="Joint Secretary">Joint Secretary</option>
                                        <option value="Additional Joint Secretary">Additional Joint Secretary</option>
                                    </select>
                                </div>
                                {candidateData.role === 'CR' && (
                                    <>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label className="form-label">Target Year</label>
                                                <select className="form-input" 
                                                    value={candidateData.targetYear || 'All'} onChange={e => setCandidateData({ ...candidateData, targetYear: e.target.value })}>
                                                    <option value="All">All Years</option>
                                                    <option value="1st Year">1st Year Only</option>
                                                    <option value="2nd Year">2nd Year Only</option>
                                                    <option value="3rd Year">3rd Year Only</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Target Dept</label>
                                                <select className="form-input" 
                                                    value={candidateData.targetDepartment || 'All'} onChange={e => setCandidateData({ ...candidateData, targetDepartment: e.target.value })}>
                                                    <option value="All">All Departments</option>
                                                    <option value="BCA">BCA</option>
                                                    <option value="BBA">BBA</option>
                                                    <option value="B.COM">B.COM</option>
                                                    <option value="BAJMC">BAJMC</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Target Section</label>
                                            <select className="form-input" 
                                                value={candidateData.targetSection || 'All'} onChange={e => setCandidateData({ ...candidateData, targetSection: e.target.value })}>
                                                <option value="All">All Sections</option>
                                                <option value="A">Section A</option>
                                                <option value="B">Section B</option>
                                                <option value="C">Section C</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Candidate Photo</label>
                                        <input type="file" accept="image/*" className="form-file" onChange={e => setPhoto(e.target.files[0])} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Party Symbol</label>
                                        <input type="file" accept="image/*" className="form-file" onChange={e => setPartySymbol(e.target.files[0])} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCandidateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Candidate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Candidate Modal ── */}
            {showEditCandidateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditCandidateModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <div className="modal-title">Edit Candidate</div>
                            <button className="modal-close" onClick={() => setShowEditCandidateModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateCandidate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" required
                                        value={editCandidateData.name} onChange={e => setEditCandidateData({ ...editCandidateData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email (optional)</label>
                                    <input type="email" className="form-input"
                                        value={editCandidateData.email} onChange={e => setEditCandidateData({ ...editCandidateData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Political Party</label>
                                    <input className="form-input" required
                                        value={editCandidateData.party} onChange={e => setEditCandidateData({ ...editCandidateData, party: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biography</label>
                                    <textarea className="form-input" rows={2} style={{ resize: 'none' }}
                                        value={editCandidateData.bio} onChange={e => setEditCandidateData({ ...editCandidateData, bio: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                                    <label className="form-label">Role Category</label>
                                    <select className="form-input" 
                                        value={editCandidateData.role || 'CR'} onChange={e => setEditCandidateData({ ...editCandidateData, role: e.target.value })}>
                                        <option value="CR">CR (Class Representative)</option>
                                        <option value="Secretary">Secretary</option>
                                        <option value="Joint Secretary">Joint Secretary</option>
                                        <option value="Additional Joint Secretary">Additional Joint Secretary</option>
                                    </select>
                                </div>
                                {editCandidateData.role === 'CR' && (
                                    <>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label className="form-label">Target Year</label>
                                                <select className="form-input" 
                                                    value={editCandidateData.targetYear || 'All'} onChange={e => setEditCandidateData({ ...editCandidateData, targetYear: e.target.value })}>
                                                    <option value="All">All Years</option>
                                                    <option value="1st Year">1st Year Only</option>
                                                    <option value="2nd Year">2nd Year Only</option>
                                                    <option value="3rd Year">3rd Year Only</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Target Dept</label>
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
                                            <label className="form-label">Target Section</label>
                                            <select className="form-input" 
                                                value={editCandidateData.targetSection || 'All'} onChange={e => setEditCandidateData({ ...editCandidateData, targetSection: e.target.value })}>
                                                <option value="All">All Sections</option>
                                                <option value="A">Section A</option>
                                                <option value="B">Section B</option>
                                                <option value="C">Section C</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">New Photo (optional)</label>
                                        <input type="file" accept="image/*" className="form-file" onChange={e => setEditPhoto(e.target.files[0])} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">New Party Symbol (optional)</label>
                                        <input type="file" accept="image/*" className="form-file" onChange={e => setEditPartySymbol(e.target.files[0])} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditCandidateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Election Modal ── */}
            {showEditElectionModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditElectionModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <div className="modal-title">Edit Election Details</div>
                            <button className="modal-close" onClick={() => setShowEditElectionModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateElection}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Election Title</label>
                                    <input className="form-input" required
                                        value={editElectionData.title} onChange={e => setEditElectionData({ ...editElectionData, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows={3} style={{ resize: 'none' }}
                                        value={editElectionData.description} onChange={e => setEditElectionData({ ...editElectionData, description: e.target.value })} />
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Start Date & Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            value={editElectionData.startDate} onChange={e => setEditElectionData({ ...editElectionData, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date & Time</label>
                                        <input type="datetime-local" className="form-input" required
                                            value={editElectionData.endDate} onChange={e => setEditElectionData({ ...editElectionData, endDate: e.target.value })} />
                                    </div>
                                </div>


                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditElectionModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminElections;
