import React, { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from '../src/context/AuthContext';
import { getElections, getElectionResults } from '../src/api/electionService';
import { Trophy, Users, BarChart3, Medal, ChevronLeft, Calendar } from 'lucide-react';
import './admin.css';

const AdminResults = () => {
    const { token } = useAuth();
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('Secretary');
    const roles = ['Secretary', 'Joint Secretary', 'Additional Joint Secretary', 'CR'];

    // Initial load: fetch all elections
    useEffect(() => {
        const fetchElections = async () => {
            try {
                const data = await getElections(token);
                setElections(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchElections();
    }, [token]);

    // Handle selecting an election
    const handleSelectElection = async (election) => {
        setSelectedElection(election);
        setResultsLoading(true);
        setResults(null);
        try {
            const data = await getElectionResults(election._id, token);
            setResults(data);
            // Set initial tab to the first role that has candidates
            if (data.resultsByRole) {
                for (const role of roles) {
                    if (data.resultsByRole[role]?.length > 0) {
                        setActiveTab(role);
                        break;
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load results', err);
        } finally {
            setResultsLoading(false);
        }
    };


    // Return to list view
    const handleBackToList = () => {
        setSelectedElection(null);
        setResults(null);
    };

    const rankStyle = (i) => {
        if (i === 0) return 'rank-1';
        if (i === 1) return 'rank-2';
        if (i === 2) return 'rank-3';
        return 'rank-n';
    };

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">

                {/* Main Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Election Results</h1>
                        <p className="page-subtitle">
                            {selectedElection 
                                ? `Viewing live results for: ${selectedElection.title}` 
                                : "Select an election below to view live and final voting tallies."}
                        </p>
                    </div>
                    {selectedElection && (
                        <button onClick={handleBackToList} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ChevronLeft size={16} /> Back to Elections
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-text"><span className="spinner" /> Loading elections...</div>
                ) : !selectedElection ? (
                    /* ─── ELECTION LIST VIEW ─── */
                    <>
                        {elections.length === 0 ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-icon"><Calendar size={24} /></div>
                                    <div className="empty-title">No elections found</div>
                                    <div className="empty-subtitle">You have not created any voting sessions yet.</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                                {elections.map((el) => (
                                    <div key={el._id} className="card" style={{ padding: 24, transition: 'all 0.2s ease', cursor: 'pointer' }} onClick={() => handleSelectElection(el)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4f46e5'
                                            }}>
                                                <BarChart3 size={24} />
                                            </div>
                                            <span className={`badge badge-${el.status === 'active' ? 'active' : 'inactive'}`}>
                                                {el.status === 'active' ? '🟢 Active' : '⚪ Closed'}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{el.title}</h3>
                                        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {el.description}
                                        </p>
                                        <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                            View Results
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* ─── DETAILED RESULTS VIEW ─── */
                    <>
                        {resultsLoading ? (
                            <div className="loading-text"><span className="spinner" /> Fetching vote tallies...</div>
                        ) : !results ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-icon"><BarChart3 size={24} /></div>
                                    <div className="empty-title">Could not load results</div>
                                    <div className="empty-subtitle">There was an error pulling data for this election.</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                    <div className="stat-card stat-card-blue">
                                        <div className="stat-icon stat-icon-blue"><Users size={22} /></div>
                                        <div className="stat-label">Total Votes Cast</div>
                                        <div className="stat-value">{results.totalVotes}</div>
                                    </div>

                                    <div className="stat-card stat-card-green">
                                        <div className="stat-icon stat-icon-green"><Trophy size={22} /></div>
                                        <div className="stat-label">Current Leader</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                                            {results.results?.length > 0 && results.results[0].voteCount > 0
                                                ? results.results[0].name
                                                : '—'}
                                        </div>
                                        {results.results?.length > 0 && results.results[0].voteCount > 0 && (
                                            <div className="stat-trend">{results.results[0].voteCount} votes cast</div>
                                        )}
                                    </div>
                                </div>

                                 {/* Tab Navigation */}
                                 <div className="card" style={{ marginBottom: 24, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 12 }}>
                                        {roles.map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setActiveTab(role)}
                                                disabled={!results.resultsByRole || !results.resultsByRole[role]}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: 10,
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    transition: 'all 0.2s ease',
                                                    border: 'none',
                                                    cursor: results.resultsByRole?.[role] ? 'pointer' : 'not-allowed',
                                                    background: activeTab === role ? 'white' : 'transparent',
                                                    color: activeTab === role ? '#4f46e5' : '#94a3b8',
                                                    boxShadow: activeTab === role ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                                    opacity: results.resultsByRole?.[role] ? 1 : 0.4
                                                }}
                                            >
                                                {role}
                                                <span style={{ 
                                                    marginLeft: 8, fontSize: 11, opacity: 0.8,
                                                    background: activeTab === role ? '#eef2ff' : '#e2e8f0',
                                                    padding: '2px 6px', borderRadius: 6,
                                                    color: activeTab === role ? '#4f46e5' : '#64748b'
                                                }}>
                                                    {results.resultsByRole?.[role]?.length || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                 </div>

                                 {/* Active Tab Leaderboard */}
                                 {results.resultsByRole?.[activeTab] ? (
                                     activeTab === 'CR' ? (
                                         results.resultsByRole[activeTab].map((classGroup) => (
                                             <div key={classGroup.className} className="card" style={{ marginBottom: 32 }}>
                                                 <div className="card-header" style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                     <div className="card-title" style={{ fontSize: 18, color: '#1e293b' }}>
                                                         <div style={{ padding: '6px 12px', background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 900, fontSize: 13 }}>
                                                            <Trophy size={14} /> CLASS WINNER
                                                         </div>
                                                         <span style={{ marginLeft: 8 }}>{classGroup.className}</span>
                                                     </div>
                                                     <span className="badge badge-active" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe' }}>
                                                         {classGroup.candidates.length} Candidate{classGroup.candidates.length !== 1 ? 's' : ''}
                                                     </span>
                                                 </div>

                                                 <table className="admin-table">
                                                     <thead>
                                                         <tr>
                                                             <th>Rank</th>
                                                             <th>Candidate</th>
                                                             <th style={{ textAlign: 'right' }}>Votes</th>
                                                             <th style={{ textAlign: 'right' }}>Vote Share</th>
                                                         </tr>
                                                     </thead>
                                                     <tbody>
                                                         {classGroup.candidates.map((c, i) => (
                                                             <tr key={c._id}>
                                                                 <td>
                                                                     <span className={`rank-badge ${rankStyle(i)}`}>
                                                                         {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                                     </span>
                                                                 </td>
                                                                 <td>
                                                                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                         {c.photo
                                                                             ? <img src={c.photo} style={{ width: 42, height: 42, borderRadius: '10px', objectFit: 'cover', border: '2px solid #f1f5f9' }} alt={c.name} />
                                                                             : <div style={{
                                                                                 width: 42, height: 42, borderRadius: '10px',
                                                                                 background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                 fontWeight: 700, fontSize: 13, color: '#6366f1',
                                                                             }}>{c.name?.charAt(0)}</div>
                                                                         }
                                                                         <div>
                                                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                                                                            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{classGroup.className}</div>
                                                                         </div>
                                                                     </div>
                                                                 </td>
                                                                 <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 18, color: i === 0 ? '#10b981' : '#6366f1' }}>
                                                                     {c.voteCount}
                                                                 </td>
                                                                 <td style={{ textAlign: 'right' }}>
                                                                     <div className="result-bar-wrap">
                                                                         <div className="result-bar-track" style={{ width: 120 }}>
                                                                             <div
                                                                                 className={`result-bar-fill ${i === 0 ? 'result-bar-fill-leader' : 'result-bar-fill-other'}`}
                                                                                 style={{ width: `${c.percentage}%` }}
                                                                             />
                                                                         </div>
                                                                         <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', minWidth: 48 }}>
                                                                             {c.percentage}%
                                                                         </span>
                                                                     </div>
                                                                 </td>
                                                             </tr>
                                                         ))}
                                                     </tbody>
                                                 </table>
                                             </div>
                                         ))
                                     ) : (
                                         <div className="card" style={{ marginBottom: 32 }}>
                                             <div className="card-header" style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                 <div className="card-title" style={{ fontSize: 18, color: '#1e293b' }}>
                                                     <Trophy size={18} style={{ color: '#f59e0b' }} /> {activeTab} — Official Results
                                                 </div>
                                             </div>

                                             <table className="admin-table">
                                                 <thead>
                                                     <tr>
                                                         <th>Rank</th>
                                                         <th>Candidate</th>
                                                         <th style={{ textAlign: 'right' }}>Votes</th>
                                                         <th style={{ textAlign: 'right' }}>Vote Share</th>
                                                     </tr>
                                                 </thead>
                                                 <tbody>
                                                     {results.resultsByRole[activeTab].map((c, i) => (
                                                         <tr key={c._id}>
                                                             <td>
                                                                 <span className={`rank-badge ${rankStyle(i)}`}>
                                                                     {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                                 </span>
                                                             </td>
                                                             <td>
                                                                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                     {c.photo
                                                                         ? <img src={c.photo} style={{ width: 42, height: 42, borderRadius: '10px', objectFit: 'cover', border: '2px solid #f1f5f9' }} alt={c.name} />
                                                                         : <div style={{
                                                                             width: 42, height: 42, borderRadius: '10px',
                                                                             background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                             fontWeight: 700, fontSize: 13, color: '#6366f1',
                                                                         }}>{c.name?.charAt(0)}</div>
                                                                     }
                                                                     <div>
                                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                                                                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{activeTab}</div>
                                                                     </div>
                                                                 </div>
                                                             </td>
                                                             <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 18, color: i === 0 ? '#10b981' : '#6366f1' }}>
                                                                 {c.voteCount}
                                                             </td>
                                                             <td style={{ textAlign: 'right' }}>
                                                                 <div className="result-bar-wrap">
                                                                     <div className="result-bar-track" style={{ width: 120 }}>
                                                                         <div
                                                                             className={`result-bar-fill ${i === 0 ? 'result-bar-fill-leader' : 'result-bar-fill-other'}`}
                                                                             style={{ width: `${c.percentage}%` }}
                                                                         />
                                                                     </div>
                                                                     <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', minWidth: 48 }}>
                                                                         {c.percentage}%
                                                                     </span>
                                                                 </div>
                                                             </td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         </div>
                                     )
                                 ) : (
                                     <div className="card" style={{ marginBottom: 32 }}>
                                         <div className="empty-state" style={{ padding: '80px 0' }}>
                                             <div style={{ 
                                                 width: 80, height: 80, background: '#f1f5f9', borderRadius: '24px', 
                                                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                 margin: '0 auto 20px', color: '#94a3b8' 
                                             }}>
                                                 <Users size={40} />
                                             </div>
                                             <div className="empty-title">No candidates for {activeTab}</div>
                                             <div className="empty-subtitle">There are no candidates registered for this designation in this election.</div>
                                         </div>
                                     </div>
                                 )}


                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminResults;
