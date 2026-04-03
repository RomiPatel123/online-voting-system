import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../src/context/AuthContext';
import { addCandidate, updateCandidate, getElectionById, getCandidateById } from '../src/api/electionService';
import { UserPlus, ArrowLeft, Upload, Shield, Info } from 'lucide-react';
import './admin.css';

const AdminAddCandidate = () => {
    const { electionId, candidateId } = useParams();
    const isEditMode = !!candidateId;
    const { token } = useAuth();
    const navigate = useNavigate();

    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [candidateData, setCandidateData] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
        role: 'CR',
        targetYear: 'All',
        targetDepartment: 'All'
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Election
                const electionData = await getElectionById(electionId, token);
                setElection(electionData);

                // 2. If in Edit Mode, fetch Candidate
                if (isEditMode) {
                    const c = await getCandidateById(candidateId, token);
                    setCandidateData({
                        name: c.name || '',
                        email: c.email || '',
                        password: '', // Keep empty for security, only update if typed
                        bio: c.bio || '',
                        role: c.role || 'CR',
                        targetYear: c.targetYear || 'All',
                        targetDepartment: c.targetDepartment || 'All'
                    });
                    if (c.photo) {
                        setPhotoPreview(`http://localhost:5000${c.photo}`);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error(isEditMode ? "Failed to load candidate details" : "Failed to load election details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [electionId, candidateId, token, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.keys(candidateData).forEach(k => {
                // Only append password if it's not empty (during edit)
                if (k === 'password' && isEditMode && !candidateData[k]) return;
                fd.append(k, candidateData[k]);
            });
            if (photo) fd.append('photo', photo);

            if (isEditMode) {
                await updateCandidate(candidateId, fd, token);
                toast.success("Candidate updated successfully!");
            } else {
                await addCandidate(electionId, fd, token);
                toast.success("Candidate added successfully!");
            }
            navigate('/admin/elections');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-shell">
                <AdminSidebar />
                <main className="admin-main">
                    <div className="loading-text"><span className="spinner" /> Loading form...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">
                {/* Header */}
                <div className="page-header animate-slide-in">
                    <div>
                        <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => navigate('/admin/elections')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 6, 
                                padding: '6px 12px', 
                                marginBottom: 16, 
                                color: '#6366f1',
                                background: '#eef2ff',
                                borderRadius: 12,
                                fontWeight: 700,
                                border: '1px solid #e0e7ff'
                            }}
                        >
                            <ArrowLeft size={14} /> Back to Elections
                        </button>
                        <h1 className="page-title" style={{ fontSize: 32, fontWeight: 950 }}>
                            {isEditMode ? 'Update Candidate' : 'Add Candidate'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                            <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 800 }}>
                                🗳️ {election?.title || 'Loading...'}
                            </span>
                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                                {isEditMode ? 'Modify Leadership Registry' : 'Manual Registration Portal'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', border: '1px solid #f1f5f9', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="card-body" style={{ padding: 40 }}>
                            
                            {/* Profile Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, marginBottom: 40 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ 
                                        width: 180, height: 180, borderRadius: '24%', border: '4px solid #eef2ff', 
                                        margin: '0 auto 20px', overflow: 'hidden', background: '#f8fafc',
                                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <UserPlus size={60} style={{ color: '#cbd5e1' }} />
                                        )}
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                                            <Upload size={14} /> {photo ? 'Change Photo' : 'Upload Photo'}
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                        </label>
                                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Square portrait recommended</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input 
                                            className="form-input" 
                                            placeholder="e.g. John Doe" 
                                            required
                                            style={{ padding: '14px 18px', fontSize: 15, fontWeight: 600 }}
                                            value={candidateData.name} 
                                            onChange={e => setCandidateData({ ...candidateData, name: e.target.value })} 
                                        />
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input 
                                                type="email" 
                                                className="form-input" 
                                                placeholder="john@example.com" 
                                                required
                                                value={candidateData.email} 
                                                onChange={e => setCandidateData({ ...candidateData, email: e.target.value })} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{isEditMode ? 'Update Password (Optional)' : 'Temporary Password'}</label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="password" 
                                                    className="form-input" 
                                                    placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"} 
                                                    required={!isEditMode}
                                                    value={candidateData.password} 
                                                    onChange={e => setCandidateData({ ...candidateData, password: e.target.value })} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="form-group">
                                    <label className="form-label">Biography & Manifesto Summary</label>
                                    <textarea 
                                        className="form-input" 
                                        placeholder="Describe the candidate's goals, impact, and background..." 
                                        rows={5} 
                                        style={{ resize: 'none', padding: 18, lineHeight: 1.6 }}
                                        value={candidateData.bio} 
                                        onChange={e => setCandidateData({ ...candidateData, bio: e.target.value })} 
                                    />
                                </div>
                            </div>

                            {/* Role Section */}
                            <div className="animate-slide-up" style={{ animationDelay: '0.2s', margin: '32px 0 0', padding: '32px 0', borderTop: '2px dashed #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                    <div style={{ background: '#eef2ff', padding: 8, borderRadius: 10 }}>
                                        <Shield size={18} style={{ color: '#6366f1' }} />
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: '#1e293b' }}>
                                        Role & Eligibility Guidelines
                                    </h3>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Official Candidate Role</label>
                                        <select 
                                            className="form-input" 
                                            value={candidateData.role} 
                                            onChange={e => setCandidateData({ ...candidateData, role: e.target.value })}
                                            style={{ padding: '12px 16px', fontWeight: 700 }}
                                        >
                                            <option value="CR">CR (Class Representative)</option>
                                            <option value="Secretary">Secretary</option>
                                            <option value="Joint Secretary">Joint Secretary</option>
                                            <option value="Additional Joint Secretary">Additional Joint Secretary</option>
                                        </select>
                                    </div>
                                    
                                    {candidateData.role === 'CR' ? (
                                        <div className="form-group">
                                            <label className="form-label">Target Year</label>
                                            <select 
                                                className="form-input" 
                                                value={candidateData.targetYear} 
                                                onChange={e => setCandidateData({ ...candidateData, targetYear: e.target.value })}
                                            >
                                                <option value="All">All Years</option>
                                                <option value="1st Year">1st Year Only</option>
                                                <option value="2nd Year">2nd Year Only</option>
                                                <option value="3rd Year">3rd Year Only</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 10, padding: 12, marginTop: 24 }}>
                                            <Info size={14} style={{ color: '#64748b', marginRight: 8 }} />
                                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>General roles apply to the entire institution.</span>
                                        </div>
                                    )}
                                </div>

                                {candidateData.role === 'CR' && (
                                    <div className="form-grid-2 animate-fade-in" style={{ marginTop: 8 }}>
                                        <div className="form-group">
                                            <label className="form-label">Target Department</label>
                                            <select 
                                                className="form-input" 
                                                value={candidateData.targetDepartment} 
                                                onChange={e => setCandidateData({ ...candidateData, targetDepartment: e.target.value })}
                                            >
                                                <option value="All">All Departments</option>
                                                <option value="BCA">BCA</option>
                                                <option value="BBA">BBA</option>
                                                <option value="B.COM">B.COM</option>
                                                <option value="BAJMC">BAJMC</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ 
                            padding: '30px 40px', 
                            background: '#f8fafc', 
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex', gap: 20
                        }}>
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                style={{ flex: 1, padding: '16px', borderRadius: 15, fontWeight: 800 }} 
                                onClick={() => navigate('/admin/elections')}
                                disabled={submitting}
                            >
                                {isEditMode ? 'Discard Changes' : 'Cancel Registration'}
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ 
                                    flex: 2, 
                                    padding: '16px', 
                                    borderRadius: 15, 
                                    fontWeight: 800,
                                    boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
                                    display: 'flex', justifyContent: 'center'
                                }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <><span className="spinner" style={{ marginRight: 10 }} /> {isEditMode ? 'Updating...' : 'Processing...'}</>
                                ) : (
                                    <>{isEditMode ? 'Save Profile Changes' : 'Finalize & Add Candidate'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminAddCandidate;
