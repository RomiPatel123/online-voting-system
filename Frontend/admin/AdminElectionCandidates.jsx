import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { getElectionById, deleteCandidate } from '../src/api/electionService';
import AdminSidebar from './components/AdminSidebar';
import toast from 'react-hot-toast';
import { 
    Users, UserPlus, Pencil, Trash2, Shield, 
    Award, Star, Briefcase, GraduationCap, ChevronRight,
    Search, Filter, LayoutGrid, List
} from 'lucide-react';
import './admin.css';

const AdminElectionCandidates = () => {
    const { electionId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Secretary');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');

    const roles = ['Secretary', 'Joint Secretary', 'Additional Joint Secretary', 'CR'];

    const fetchElection = async () => {
        try {
            const data = await getElectionById(electionId, token);
            setElection(data);
        } catch (err) {
            toast.error("Failed to load election details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElection();
    }, [electionId, token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this candidate?")) return;
        try {
            await deleteCandidate(id, token);
            toast.success("Candidate removed");
            fetchElection();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredCandidates = election?.candidates?.filter(c => {
        const matchesRole = c.role === activeTab;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesCRFilters = true;
        if (activeTab === 'CR') {
            const matchesYear = filterYear === 'All' || c.targetYear === filterYear;
            const matchesDept = filterDepartment === 'All' || c.targetDepartment === filterDepartment;
            matchesCRFilters = matchesYear && matchesDept;
        }

        return matchesRole && matchesSearch && matchesCRFilters;
    }) || [];

    if (loading) {
        return (
            <div className="admin-shell">
                <AdminSidebar />
                <main className="admin-main">
                    <div className="loading-text"><span className="spinner" /> Loading candidates...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">
                {/* Header Section */}
                <div className="page-header animate-slide-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <button onClick={() => navigate('/admin/elections')} className="btn-back">
                                    <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Elections
                                </button>
                                <span style={{ color: '#cbd5e1' }}>/</span>
                                <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>Mandate Management</span>
                            </div>
                            <h1 className="page-title" style={{ fontSize: 32, fontWeight: 950, letterSpacing: -1 }}>
                                {election?.title}
                            </h1>
                            <p style={{ color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                                {election?.candidates?.length || 0} Professional Candidates Registered
                            </p>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate(`/admin/elections/${electionId}/add-candidate`)}
                            style={{ 
                                borderRadius: 16, padding: '12px 24px', fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: 10,
                                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            <UserPlus size={18} /> Add New Candidate
                        </button>
                    </div>
                </div>

                {/* Tabs & Search Navigation */}
                <div className="card animate-fade-in" style={{ marginBottom: 32, padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 14 }}>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setActiveTab(role)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 10,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: activeTab === role ? 'white' : 'transparent',
                                        color: activeTab === role ? '#4f46e5' : '#64748b',
                                        boxShadow: activeTab === role ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    {role}
                                    <span style={{ 
                                        marginLeft: 8, fontSize: 11, opacity: 0.6,
                                        background: activeTab === role ? '#eef2ff' : '#e2e8f0',
                                        padding: '2px 6px', borderRadius: 6
                                    }}>
                                        {election?.candidates?.filter(c => c.role === role).length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
                            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text"
                                placeholder="Search candidates..."
                                className="form-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 48, borderRadius: 14, background: 'white', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>

                    {/* CR Specific Filters (Below Category) */}
                    {activeTab === 'CR' && (
                        <div className="animate-slide-up" style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Filter size={16} style={{ color: '#6366f1' }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Deep Filter:</span>
                            </div>
                            
                            <select 
                                className="form-input" 
                                value={filterYear} 
                                onChange={e => setFilterYear(e.target.value)}
                                style={{ width: 160, borderRadius: 14, background: 'white', border: '1px solid #e2e8f0', fontWeight: 600 }}
                            >
                                <option value="All">All Academic Years</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                            </select>

                            <select 
                                className="form-input" 
                                value={filterDepartment} 
                                onChange={e => setFilterDepartment(e.target.value)}
                                style={{ width: 180, borderRadius: 14, background: 'white', border: '1px solid #e2e8f0', fontWeight: 600 }}
                            >
                                <option value="All">All Departments</option>
                                <option value="BCA">BCA</option>
                                <option value="BBA">BBA</option>
                                <option value="B.COM">B.COM</option>
                                <option value="BAJMC">BAJMC</option>
                            </select>

                            {(filterYear !== 'All' || filterDepartment !== 'All') && (
                                <button 
                                    onClick={() => { setFilterYear('All'); setFilterDepartment('All'); }}
                                    style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Candidates Grid */}
                <div className="form-grid-3 animate-slide-up" style={{ gap: 24, animationDelay: '0.1s' }}>
                    {filteredCandidates.length > 0 ? (
                        filteredCandidates.map(c => (
                            <div key={c._id} className="card candidate-card-admin" style={{ 
                                padding: 24, borderRadius: 24, border: '1px solid #f1f5f9',
                                position: 'relative', overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: 'white'
                            }}>
                                {/* Actions Overlay */}
                                <div className="card-actions-hover" style={{ 
                                    position: 'absolute', top: 16, right: 16, 
                                    display: 'flex', gap: 8, zIndex: 10 
                                }}>
                                    <button 
                                        className="btn-icon-sm" 
                                        onClick={() => navigate(`/admin/elections/${electionId}/edit-candidate/${c._id}`)}
                                        title="Edit Profile"
                                        style={{ background: '#f8fafc', color: '#6366f1' }}
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        className="btn-icon-sm" 
                                        onClick={() => handleDelete(c._id)}
                                        title="Remove Candidate"
                                        style={{ background: '#fff1f2', color: '#f43f5e' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ 
                                        width: 80, height: 80, borderRadius: 20, 
                                        overflow: 'hidden', background: '#f1f5f9',
                                        border: '3px solid #f8fafc',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                                    }}>
                                        {c.photo ? (
                                            <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                <Users size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 4 }}>{c.name}</h3>
                                        <p style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Award size={12} style={{ color: '#fbbf24' }} /> {c.role}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Academic Detail</span>
                                        <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 800 }}>{c.targetYear} • {c.targetDepartment}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {c.bio || "No biography provided for this candidate."}
                                    </div>
                                </div>

                                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                            <Star size={16} fill="currentColor" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 950, color: '#1e293b' }}>{c.voteCount || 0}</div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Current Votes</div>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => navigate(`/admin/elections/${electionId}/edit-candidate/${c._id}`)}
                                        style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}
                                    >
                                        View Full Profile <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ 
                                width: 100, height: 100, background: '#f1f5f9', borderRadius: '30%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 24px', color: '#94a3b8' 
                            }}>
                                <Users size={48} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b' }}>No {activeTab}s Found</h2>
                            <p style={{ color: '#64748b', marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>
                                There are currently no candidates registered for the <strong>{activeTab}</strong> role in this mandate. Click the button above to add one.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .btn-icon-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-sm:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .candidate-card-admin:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
                    border-color: #6366f1 !important;
                }
                .btn-back {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    color: #64748b;
                    background: #f1f5f9;
                    border-radius: 12px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-back:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
            `}} />
        </div>
    );
};

export default AdminElectionCandidates;
