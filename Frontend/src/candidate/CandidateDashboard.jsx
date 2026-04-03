import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { FaChartBar, FaUsers, FaBullhorn, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getElectionResults } from "../api/electionService";

const CandidateDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      if (user?.election?._id) {
        const data = await getElectionResults(user.election._id, token);
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to load results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user, token]);

  // Find candidate's own stats
  const myStats = results?.results?.find(c => c._id === user?._id);
  const myRank = results?.results?.findIndex(c => c._id === user?._id) + 1;

  // Calculate margin of lead (difference between me and the person behind me, or if I am second, difference between me and 1st)
  let margin = 0;
  let marginText = "Margin";
  if (results?.results?.length > 1 && myStats) {
    if (myRank === 1) {
      margin = myStats.voteCount - results.results[1].voteCount;
      marginText = "Lead over 2nd Place";
    } else {
      margin = results.results[0].voteCount - myStats.voteCount;
      marginText = "Trailing 1st Place by";
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1220] border-r border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-extrabold mb-8 tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Samashti</h1>

          <nav className="space-y-4">
            <SidebarItem active icon={<FaChartBar />} text="Overview" />
            <SidebarItem icon={<FaChartBar />} text="Detailed Analytics" />
            <SidebarItem icon={<FaUsers />} text="Supporter List" />
            <SidebarItem icon={<FaBullhorn />} text="Campaign Media" />
            <SidebarItem icon={<FaCog />} text="Settings" />
          </nav>
        </div>

        <div>
          <div className="flex items-center gap-3 mt-10">
            {user?.photo ? (
              <img src={`http://localhost:5000${user.photo}`} alt="profile" className="w-10 h-10 rounded-full border border-gray-600 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">C</div>
            )}
            <div>
              <p className="text-sm font-semibold truncate w-32">{user?.name}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mt-6 text-sm py-3 px-4 w-full rounded-xl bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 transition"
          >
            <FaSignOutAlt /> Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Candidate Overview</h2>
            <p className="text-gray-400 mt-1">
              Real-time performance metrics for <span className="text-blue-400 font-medium">{user?.election?.title}</span>.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wider 
                            ${user?.election?.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-500/30' :
                user?.election?.status === 'completed' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                  'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'}`}>
              ● {user?.election?.status.toUpperCase()}
            </span>
            <button onClick={fetchResults} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20">
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center bg-[#1e293b] rounded-3xl border border-gray-700">
            <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : !results ? (
          <div className="h-64 flex items-center justify-center bg-[#1e293b] rounded-3xl border border-gray-700 text-gray-400">
            No election data available.
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-10 rounded-3xl shadow-2xl border border-gray-700/50">
              <div className="flex justify-between items-end mb-6 border-b border-gray-700/50 pb-6">
                <div>
                  <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-3">
                    LIVE RANK: {myRank === 1 ? '1ST PLACE 🏆' : `${myRank}TH PLACE`}
                  </p>
                  <h1 className="text-7xl font-black bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                    {myStats?.voteCount || 0}
                  </h1>
                  <p className="text-gray-400 font-medium mt-2 text-lg">Total Valid Votes Secured</p>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-8 mt-8">
                <SmallCard title="Vote Share" value={`${myStats?.percentage || 0}%`} />
                <SmallCard title={marginText} value={margin.toString()} />
                <SmallCard title="Total Election Votes" value={results.totalVotes.toString()} />
              </div>
            </div>

            {/* Trend + Profile Section */}
            <div className="grid grid-cols-3 gap-8">
              {/* Chart Section */}
              <div className="col-span-2 bg-[#1e293b] p-8 rounded-3xl border border-gray-700/50 flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-gray-200">
                  Live Leaderboard
                </h3>

                <div className="flex-1 space-y-4">
                  {results.results?.map((c, i) => (
                    <div key={c._id} className="relative">
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className={c._id === user?._id ? "text-blue-400" : "text-gray-400"}>
                          {i + 1}. {c.name} {c._id === user?._id && "(You)"}
                        </span>
                        <span className="text-white">{c.voteCount} ({c.percentage}%)</span>
                      </div>
                      <div className="w-full bg-[#0f172a] rounded-full h-3 overflow-hidden border border-gray-700/50">
                        <div
                          className={`h-full rounded-full ${c._id === user?._id ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-600'}`}
                          style={{ width: `${c.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-[#1e293b] p-8 rounded-3xl text-center border border-gray-700/50 flex flex-col items-center">
                {user?.photo ? (
                  <img src={`http://localhost:5000${user.photo}`} alt="candidate" className="w-32 h-32 rounded-full border-4 border-[#0f172a] shadow-xl mb-6 object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-[#0f172a] bg-gray-700 mb-6 mx-auto flex items-center justify-center text-3xl font-bold">C</div>
                )}
                <h3 className="text-2xl font-black mb-1">{user?.name}</h3>

                <div className="bg-[#0f172a] p-5 rounded-2xl text-sm text-gray-400 border border-gray-800 leading-relaxed shadow-inner w-full">
                  Official candidate for {user?.election?.title}.
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

const SidebarItem = ({ icon, text, active }) => (
  <div
    className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer font-medium transition ${active
      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
      : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
      }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{text}</span>
  </div>
);

const SmallCard = ({ title, value }) => (
  <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-700/50 shadow-inner">
    <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase mb-1">{title}</p>
    <h4 className="text-3xl font-black text-white">{value}</h4>
  </div>
);

export default CandidateDashboard;
