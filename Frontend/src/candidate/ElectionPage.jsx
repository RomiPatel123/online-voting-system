import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Info, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { FaUsers, FaUserGraduate, FaIdCard, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getElections } from "../api/electionService";
import { castVote, getMyVotes } from "../api/voteService";
import "./voter.css";

export default function ElectionPage() {
  const { user, token, logout } = useAuth();
  const [activeElection, setActiveElection] = useState(null);
  const [allRegisteredElections, setAllRegisteredElections] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(user?.year === "1st Year" ? "CR" : "Secretary");

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
      toast.success("Vote cast successfully!");
      fetchData(); // Refresh UI
    } catch (err) {
      toast.error(err.message);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Voter";

  let candidatesByRole = {};
  if (activeElection && activeElection.candidates) {
    const visibleCandidates = activeElection.candidates.filter(c => {
      const role = c.role || "CR";
      const matchesTab = role === activeTab;
      if (!matchesTab) return false;

      if (role !== "CR") return true; 

      const yearMatch = c.targetYear === "All" || c.targetYear === user?.year;
      const deptMatch = c.targetDepartment === "All" || c.targetDepartment === user?.department;
      return yearMatch && deptMatch;
    });

    visibleCandidates.forEach(c => {
      const role = c.role || "CR";
      if (!candidatesByRole[role]) candidatesByRole[role] = [];
      candidatesByRole[role].push(c);
    });
  }

  const allRoles = ["Secretary", "Joint Secretary", "Additional Joint Secretary", "CR"];

  const isEligibleForRole = (role) => {
    if (role === "CR") return true; 
    return user?.year !== "1st Year"; 
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
  const showObservationWarning = user?.year === "1st Year" && activeTab !== "CR";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="px-4 md:px-8 py-4 md:py-5 flex justify-between items-center glass-panel sticky top-0 z-[100] border-b border-gray-200/50">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-indigo-600 text-white w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center font-black text-base md:text-lg tracking-tighter">
            VC
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter">Samashti</h1>
            <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Institutional Voting Core</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex flex-col items-end">
            <p className="font-extrabold text-slate-800 text-sm leading-none">{user?.name}</p>
            <p className="text-[10px] font-black text-indigo-500 tracking-wider uppercase mt-1.5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               {user?.role} • {user?.year}
            </p>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-slate-600 font-extrabold text-[10px] md:text-xs uppercase tracking-widest bg-slate-50 border border-slate-200/60 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
            <LogOut size={14} /> <span className="hidden xs:inline">Exit</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full animate-fade-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Loading Mandates</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 md:p-8 rounded-3xl border border-red-100 font-bold flex flex-col items-center gap-4 max-w-lg mx-auto animate-scale-in">
            <AlertCircle size={40} className="opacity-50" />
            <p className="text-center">{error}</p>
          </div>
        ) : !activeElection ? (
          <div className="bg-white p-12 md:p-20 text-center rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 animate-scale-in">
            <FaUsers size={60} className="mx-auto text-slate-100 mb-6" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">No active elections</h2>
            <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm md:text-base">There are currently no elections available for participation in your sector.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-100 pb-8 md:pb-12">
              <div className="animate-slide-up">
                 <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100/50">Mandate Container</span>
                    <span className="hidden xs:block w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Election ID: {activeElection._id.slice(-8)}</span>
                 </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">{activeElection.title}</h2>
                <p className="text-slate-500 font-medium max-w-2xl text-base md:text-lg leading-relaxed">
                   Welcome to the digital ballot, <span className="text-indigo-600 font-black">{firstName}</span>. {activeElection.description}
                </p>
              </div>

              {allRegisteredElections.length > 1 && (
                <div className="flex flex-col gap-3 w-full lg:min-w-[320px] lg:w-auto animate-slide-up">
                  <label htmlFor="election-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Environment Selector
                  </label>
                  <div className="relative group">
                    <select
                      id="election-select"
                      className="w-full appearance-none px-5 md:px-6 py-3 md:py-4 bg-white border-2 border-slate-100/80 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-extrabold text-slate-700 shadow-sm cursor-pointer pr-12 text-sm md:text-base"
                      value={activeElection._id}
                      onChange={(e) => setActiveElection(allRegisteredElections.find(el => el._id === e.target.value))}
                    >
                      {allRegisteredElections.map(el => (
                        <option key={el._id} value={el._id}>
                          {el.title} {el.status === "active" ? "(LOCKED IN)" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                       <ChevronRight size={20} className="rotate-90" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Observation / Warning Info */}
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12 animate-slide-up">
              {user?.role === 'voter' && !user?.isVerified && (
                <div className="soft-info-banner border-yellow-200 bg-yellow-50/50 text-yellow-800">
                  <FaIdCard className="soft-info-icon text-yellow-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-extrabold text-[11px] md:text-sm uppercase tracking-wide mb-1">Authorization Pending</h3>
                    <p className="text-[13px] md:text-sm font-medium opacity-80 leading-relaxed">Your digital credentials are currently being encrypted and validated by the primary administration. Voting functions remain locked until verification is finalized.</p>
                  </div>
                </div>
              )}

              {showObservationWarning && activeElection?.status === "active" && (
                <div className="soft-info-banner border-indigo-100 bg-indigo-50/50">
                  <FaUserGraduate className="soft-info-icon mt-1" size={24} />
                  <div>
                    <h3 className="font-extrabold text-[11px] md:text-sm uppercase tracking-wide mb-1">Observation Protocol Active</h3>
                    <p className="text-[13px] md:text-sm font-medium opacity-80 leading-relaxed">As a primary stage student, your voting power is exclusively allocated to Class Representatives (CR). Executive roles are visible for observation purposes only to ensure systemic integrity.</p>
                  </div>
                </div>
              )}

              {activeElection.status !== "active" && (
                <div className="soft-info-banner border-slate-200 bg-slate-100/50 text-slate-600">
                  <Info className="soft-info-icon text-slate-400 mt-1" size={24} />
                  <div>
                    <h3 className="font-extrabold text-[11px] md:text-sm uppercase tracking-wide mb-1">System Locked</h3>
                    <p className="text-[13px] md:text-sm font-medium opacity-80 leading-relaxed">The digital ballot box for this mandate is currently closed. Current Status: <span className="font-black text-slate-900 uppercase">{activeElection.status}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabbed Role Switcher */}
            <div className="flex flex-col items-center mb-10 md:mb-16 animate-slide-up w-full">
               <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Mandate Role Filter</span>
               <div className="w-full flex justify-center no-scrollbar overflow-x-auto pb-2">
                 <div className="voter-tabs-container glass-panel shadow-indigo-600/5 border-slate-100 w-fit">
                  {allRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => setActiveTab(role)}
                      className={`voter-tab-btn ${activeTab === role ? "active" : ""}`}
                    >
                      {role}
                      {hasVotedForRole(role) && (
                        <span className="ml-2 inline-flex w-4 h-4 bg-green-500 text-white text-[8px] rounded-full items-center justify-center shadow-lg shadow-green-500/30">✓</span>
                      )}
                    </button>
                  ))}
                 </div>
               </div>
            </div>

            {/* Candidate List Display */}
            <div className="roles-container animate-fade-in">
              {!candidatesByRole[activeTab] || candidatesByRole[activeTab].length === 0 ? (
                <div className="py-20 md:py-32 text-center bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] shadow-sm animate-scale-in">
                   <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                      <FaUserTie size={36} className="text-slate-200" />
                   </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-300 tracking-tight uppercase">Vacancy Available</h3>
                  <p className="text-slate-400 mt-2 font-bold text-[11px] md:text-sm uppercase tracking-widest">No valid candidates found for {activeTab}</p>
                </div>
              ) : (
                <div className="animate-slide-up">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                           <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                           <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[.25em]">Eligible Ballot</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">{activeTab}</h3>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 h-fit mb-1">
                        {hasVotedForRole(activeTab) && (
                           <span className="bg-green-50 text-green-700 text-[9px] md:text-[10px] font-black px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl flex items-center gap-2 border border-green-200/50 shadow-sm animate-bounce"><CheckCircle size={14}/> TRANSACTION CONFIRMED</span>
                        )}
                        {!isEligibleForRole(activeTab) && (
                           <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-black px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl flex items-center gap-2 tracking-widest border border-slate-200/50 shadow-sm"><Info size={14}/> SYSTEM OBSERVER</span>
                        )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                    {candidatesByRole[activeTab].map(candidate => {
                      const votedCandidateId = getVotedCandidateIdForRole(activeTab);
                      const isSelected = votedCandidateId === candidate._id;
                      const hasVotedThisRole = !!votedCandidateId;

                      return (
                        <div key={candidate._id} className={`glass-card group flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] relative ${isSelected ? "ring-2 ring-green-400/50 bg-green-50/30" : ""}`}>
                          
                          {isSelected && (
                            <div className="voted-badge-float animate-pulse sm:top-12 sm:right-12 top-4 right-4">
                              <CheckCircle size={16} />
                            </div>
                          )}

                          <div className="relative w-20 h-20 sm:w-full sm:h-64 sm:mb-8 rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner flex-shrink-0">
                            {candidate.photo ? (
                              <img src={`http://localhost:5000${candidate.photo}`} alt={candidate.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 saturate-[0.8] group-hover:saturate-[1.1]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
                                <FaUsers size={32} className="opacity-20 sm:w-14 sm:h-14" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 text-left sm:text-center px-1 md:px-2 min-w-0">
                             <h4 className="candidate-name-title text-base sm:text-xl mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate sm:whitespace-normal">{candidate.name}</h4>
                             
                             <p className="bio-text text-[11px] sm:text-sm mb-3 sm:mb-8 font-medium italic sm:px-2">
                                {candidate.bio || "No mission statement provided."}
                             </p>

                             <div className="pt-0 sm:pt-2">
                                {activeElection.status === "active" && user?.role === 'voter' && user?.isVerified && !hasVotedThisRole && isEligibleForRole(activeTab) ? (
                                  <button
                                    onClick={() => handleVote(candidate)}
                                    className="vote-cta-btn py-2 sm:py-4 text-[10px] sm:text-sm"
                                  >
                                    <span className="hidden sm:inline">Cast Ballot</span>
                                    <span className="sm:hidden">Vote</span> 
                                    <ChevronRight size={14} className="sm:size-18 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                ) : isSelected ? (
                                  <div className="w-full bg-green-500 text-white font-black py-2 sm:py-4 rounded-xl sm:rounded-2xl flex justify-center items-center gap-2 sm:gap-3 shadow-lg shadow-green-500/20 text-[9px] sm:text-xs tracking-widest uppercase">
                                    <CheckCircle size={14} className="sm:size-16" /> <span className="sm:inline hidden">Finalized</span><span className="sm:hidden">DONE</span>
                                  </div>
                                ) : (
                                  <div className="w-full bg-slate-100 text-slate-400 font-black py-2 sm:py-4 rounded-xl sm:rounded-2xl text-center text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase border border-slate-200/50">
                                    {hasVotedThisRole ? "LOCKED" : !isEligibleForRole(activeTab) ? "VIEW" : "INFO"}
                                  </div>
                                )}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
