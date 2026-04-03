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
                                            <div className="stat-trend">{results.results[0].party} · {results.results[0].voteCount} votes</div>
                                        )}
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="card-title">
                                            <Medal size={16} style={{ color: '#f59e0b' }} /> Detailed Leaderboard
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>
                                            {results.results?.length} candidate{results.results?.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {results.results?.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-title">No candidates found</div>
                                            <div className="empty-subtitle">Add candidates to this election first.</div>
                                        </div>
                                    ) : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Candidate</th>
                                                    <th>Party</th>
                                                    <th style={{ textAlign: 'right' }}>Votes</th>
                                                    <th style={{ textAlign: 'right' }}>Vote Share</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.results.map((c, i) => (
                                                    <tr key={c._id}>
                                                        <td>
                                                            <span className={`rank-badge ${rankStyle(i)}`}>
                                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                {c.photo
                                                                    ? <img src={`http://localhost:5000${c.photo}`} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} alt={c.name} />
                                                                    : <div style={{
                                                                        width: 38, height: 38, borderRadius: '50%',
                                                                        background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontWeight: 700, fontSize: 13, color: '#6366f1',
                                                                    }}>{c.name?.charAt(0)}</div>
                                                                }
                                                                <span style={{ fontWeight: 600 }}>{c.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ color: '#64748b' }}>{c.party}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 18, color: i === 0 ? '#10b981' : '#6366f1' }}>
                                                            {c.voteCount}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div className="result-bar-wrap">
                                                                <div className="result-bar-track">
                                                                    <div
                                                                        className={`result-bar-fill ${i === 0 ? 'result-bar-fill-leader' : 'result-bar-fill-other'}`}
                                                                        style={{ width: `${c.percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', minWidth: 44 }}>
                                                                    {c.percentage}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminResults;
