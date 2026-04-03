import React, { useEffect, useState } from "react";
import { LogOut, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getElections } from "../api/electionService";
import { castVote, getMyVotes } from "../api/voteService";

export default function ElectionPage() {
  const [activeElection, setActiveElection] = useState(null);
  const [allRegisteredElections, setAllRegisteredElections] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const allElections = await getElections(token);
      const votes = await getMyVotes(token);

      // Elections are now general containers. Everyone can see all active/upcoming elections.
      const userElections = allElections;
      setAllRegisteredElections(userElections);

      let targetElection = null;
      if (userElections.length > 0) {
        targetElection = userElections.find(e => e.status === "active") || userElections[0];
      }

      setActiveElection(targetElection);
      setMyVotes(votes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleVote = async (candidate) => {
    if (!window.confirm(`Are you sure you want to vote for ${candidate.name} as ${candidate.role || 'CR'}? This vote is final.`)) return;

    try {
      await castVote(activeElection._id, candidate._id, token);
      alert("Vote cast successfully!");
      fetchData(); // Refresh UI
    } catch (err) {
      alert(err.message);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Voter";

  // Organize candidates by role
  let candidatesByRole = {};
  if (activeElection && activeElection.candidates) {
    // 🎯 Filter visible candidates
    const visibleCandidates = activeElection.candidates.filter(c => {
      const role = c.role || "CR";
      if (role !== "CR") return true; // General roles visible to all

      // CR roles visible only to matching class
      const yearMatch = c.targetYear === "All" || c.targetYear === user?.year;
      const deptMatch = c.targetDepartment === "All" || c.targetDepartment === user?.department;
      const sectMatch = c.targetSection === "All" || c.targetSection === user?.section;
      return yearMatch && deptMatch && sectMatch;
    });

    // Group by role
    visibleCandidates.forEach(c => {
      const role = c.role || "CR";
      if (!candidatesByRole[role]) candidatesByRole[role] = [];
      candidatesByRole[role].push(c);
    });
  }

  // Voting Eligibility Helpers
  const isEligibleForRole = (role) => {
    if (role === "CR") return true; // Everyone can vote for their CR
    return user?.year !== "1st Year"; // 1st years cannot vote for Gen Sec, etc.
  };

  const hasVotedForRole = (role) => {
    return activeElection ? myVotes.some(v => v.election?._id === activeElection._id && v.role === role) : false;
  };

  const getVotedCandidateIdForRole = (role) => {
    if (!activeElection) return null;
    const vote = myVotes.find(v => v.election?._id === activeElection._id && v.role === role);
    return vote ? vote.candidate?._id : null;
  };

  const roles = Object.keys(candidatesByRole);
  const showObservationWarning = user?.year === "1st Year" && roles.some(r => r !== "CR");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-blue-400 font-bold tracking-wider">
            VC
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 font-extrabold text-transparent bg-clip-text">VoteCentral</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs font-medium text-blue-600 capitalize bg-blue-100 px-2 py-0.5 rounded shadow-sm inline-block mt-1">
              {user?.role} {user?.role === 'voter' && (user?.isVerified ? " (Verified)" : " (Unverified)")}
            </p>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 border-2 border-gray-200 px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-10 py-10 max-w-7xl mx-auto w-full">
        {loading ? (
          <p className="text-center text-gray-500 font-medium">Loading election data...</p>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border-2 border-red-200 font-semibold flex items-center gap-3">
            <AlertCircle /> {error}
          </div>
        ) : !activeElection ? (
          <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No active elections</h2>
            <p className="text-gray-500">There are currently no elections available.</p>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{activeElection.title}</h2>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Welcome, <span className="font-semibold text-blue-600">{firstName}</span>. {activeElection.description}
                </p>
              </div>

              {allRegisteredElections.length > 1 && (
                <div className="flex flex-col gap-2 min-w-[250px]">
                  <label htmlFor="election-select" className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Switch Election
                  </label>
                  <select
                    id="election-select"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-semibold text-gray-700 shadow-sm cursor-pointer"
                    value={activeElection._id}
                    onChange={(e) => setActiveElection(allRegisteredElections.find(el => el._id === e.target.value))}
                  >
                    {allRegisteredElections.map(el => (
                      <option key={el._id} value={el._id}>
                        {el.title} {el.status === "active" ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {user?.role === 'voter' && !user?.isVerified && (
              <div className="flex justify-between items-center bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm mb-8">
                <div className="flex items-start gap-4 text-yellow-800">
                  <AlertCircle size={28} className="text-yellow-600" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Account Pending Verification</h3>
                    <p>Your ID card is currently being reviewed by an administrator. You cannot cast a vote until you are verified.</p>
                  </div>
                </div>
              </div>
            )}

            {showObservationWarning && activeElection?.status === "active" && (
              <div className="flex justify-between items-center bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl shadow-sm mb-8">
                <div className="flex items-start gap-4 text-blue-800">
                  <Info size={28} className="text-blue-600" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Observation Mode (General Roles)</h3>
                    <p>As a 1st-year student, you can only vote for Class Representatives (CR). Other main roles are visible for observation purposes only.</p>
                  </div>
                </div>
              </div>
            )}

            {activeElection.status !== "active" && (
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-xl mb-8 shadow-sm">
                <div className="flex items-center gap-3"><Info size={24} /> <span className="font-semibold text-lg">Voting is closed. Status: {activeElection.status}</span></div>
              </div>
            )}

            {roles.length === 0 ? (
              <div className="py-12 text-center text-gray-500 border-2 border-dashed rounded-3xl">
                <p className="text-xl font-medium">No candidates registered for your eligible roles in this election yet.</p>
              </div>
            ) : (
              roles.map(role => (
                <div key={role} className="mb-12">
                  <div className="flex items-center gap-4 mb-6 border-b pb-3">
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-widest">{role}</h3>
                    {hasVotedForRole(role) && (
                       <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-green-300 shadow-sm"><CheckCircle size={14}/> VOTED</span>
                    )}
                    {!isEligibleForRole(role) && (
                       <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><Info size={14}/> VIEW ONLY</span>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {candidatesByRole[role].map(candidate => {
                      const votedCandidateId = getVotedCandidateIdForRole(role);
                      const isSelected = votedCandidateId === candidate._id;
                      const hasVotedThisRole = !!votedCandidateId;

                      return (
                        <div key={candidate._id} className={`bg-white rounded-3xl p-6 text-center border-2 transition-all duration-300 relative group overflow-hidden
                            ${isSelected ? "border-green-500 shadow-xl bg-green-50/30 transform scale-105" : "border-gray-100 shadow hover:shadow-2xl hover:-translate-y-1 block"}`}>
                          
                          {isSelected && (
                            <div className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full absolute top-4 left-4 shadow-md flex items-center gap-1">
                              <CheckCircle size={14} /> YOUR VOTE
                            </div>
                          )}

                          <div className="relative inline-block mt-4 mb-4">
                            {candidate.photo ? (
                              <img src={`http://localhost:5000${candidate.photo}`} alt={candidate.name} className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover" />
                            ) : (
                              <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg mx-auto"></div>
                            )}
                          </div>

                          <h4 className="font-black text-xl text-gray-800 mb-1">{candidate.name}</h4>
                          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2 h-16 overflow-y-auto">
                            {candidate.bio || "No biography provided."}
                          </p>

                          {activeElection.status === "active" && user?.role === 'voter' && user?.isVerified && !hasVotedThisRole && isEligibleForRole(role) && (
                            <button
                              onClick={() => handleVote(candidate)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 border border-blue-700"
                            >
                              Vote for {candidate.name.split(" ")[0]}
                            </button>
                          )}

                          {isSelected && (
                            <div className="w-full bg-green-100 text-green-700 font-bold py-3.5 rounded-xl border border-green-200 flex justify-center items-center gap-2 shadow-inner mt-4">
                              <CheckCircle size={20} /> Voted
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
