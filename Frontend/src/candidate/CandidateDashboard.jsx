import React, { useEffect, useState, useMemo } from "react";
import { FiRefreshCw, FiExternalLink, FiAward, FiPieChart, FiTrendingUp, FiSettings, FiGrid, FiUsers, FiLogOut } from "react-icons/fi";
import { FaUsers, FaChartBar, FaBullhorn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getElectionResults } from "../api/electionService";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";
import "./candidate.css";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const CandidateDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Overview");

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

  // Data processing for Recharts
  const chartData = useMemo(() => {
    if (!results?.results) return [];
    return results.results.map((c) => ({
      name: c.name,
      value: c.voteCount,
      percentage: parseFloat(c.percentage),
    }));
  }, [results]);

  const myStats = results?.results?.find(c => c._id === user?._id);
  const myRank = results?.results?.findIndex(c => c._id === user?._id) + 1;
  const isWinner = myRank === 1 && user?.election?.status === "completed";

  // Margins
  const marginData = useMemo(() => {
    if (!results?.results || results.results.length < 2 || !myStats) return { value: 0, text: "Margin" };
    if (myRank === 1) {
      return { value: myStats.voteCount - results.results[1].voteCount, text: "Lead Over 2nd" };
    }
    return { value: results.results[0].voteCount - myStats.voteCount, text: "Trail Behind 1st" };
  }, [results, myStats, myRank]);

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-72 cand-glass-nav p-8 flex flex-col justify-between fixed h-full z-20">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiAward className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Samashti</h1>
          </div>

          <nav className="space-y-2">
            <SidebarLink active={activeMenu === "Overview"} icon={<FiGrid />} text="Overview" onClick={() => setActiveMenu("Overview")} />
            <SidebarLink active={activeMenu === "Analytics"} icon={<FiTrendingUp />} text="Detailed Analytics" onClick={() => setActiveMenu("Analytics")} />
            <SidebarLink icon={<FiUsers />} text="Supporter Base" disabled />
            <SidebarLink icon={<FiPieChart />} text="Final Report" disabled />
            <SidebarLink icon={<FiSettings />} text="Settings" disabled />
          </nav>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
            {user?.photo ? (
              <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">C</div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Candidate</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-4 px-6 rounded-2xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <FiLogOut className="group-hover:rotate-12 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <main className="flex-1 ml-72 p-10 winner-backdrop h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-12">
          <div className="animate-in">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${user?.election?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {user?.election?.status} Election
              </span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">{activeMenu === 'Overview' ? 'Dashboard Overview' : 'Campaign Analytics'}</h2>
            <p className="text-slate-400 mt-2 font-medium">Monitoring <span className="text-blue-400">{user?.election?.title}</span></p>
          </div>

          <div className="flex gap-4 items-center animate-in">
            <button 
              onClick={fetchResults} 
              className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-extrabold text-white transition-all shadow-xl backdrop-blur-xl"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Fetching Live Intelligence...</p>
          </div>
        ) : !results ? (
          <div className="h-64 flex items-center justify-center cand-glass rounded-[2rem] border border-white/5 text-slate-500 font-bold uppercase tracking-widest italic animate-in">
            Election Infrastructure Pending...
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* 🎯 Primary Intelligence Card */}
            <section className="animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="cand-glass p-10 rounded-[3rem] border border-white/10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <FiAward size={180} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                      <FiTrendingUp /> Ranked #{myRank} Overall
                    </div>
                    
                    <div className="flex items-baseline gap-4 mb-2">
                       <h1 className="text-9xl font-black text-white tracking-tighter leading-none italic">{myStats?.voteCount || 0}</h1>
                       <div className="flex flex-col">
                         <span className="text-2xl font-black text-emerald-400">+{myStats?.percentage}%</span>
                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Election Share</span>
                       </div>
                    </div>
                    <p className="text-xl text-slate-400 font-bold tracking-tight">Total Valid Ballots Secured</p>

                    <div className="grid grid-cols-2 gap-6 mt-12">
                      <MetricPanel label={marginData.text} value={marginData.value.toString()} color="blue" />
                      <MetricPanel label="Total Participation" value={results.totalVotes.toString()} color="slate" />
                    </div>
                  </div>

                  {/* DONUT CHART */}
                  <div className="h-[320px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="transparent"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                          ))}
                        </Pie>
                        <ReTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Voter Split</span>
                      <span className="text-3xl font-black text-white">{chartData.length}</span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Candidates</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 📊 Detailed Metrics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              
              {/* BAR CHART SECTION */}
              <div className="xl:col-span-2 cand-glass rounded-[2.5rem] p-8 animate-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full" /> Tally Distribution
                  </h3>
                  <div className="bg-white/5 rounded-lg px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Candidate Scaling
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                        width={100}
                      />
                      <ReTooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 20, 20, 0]} 
                        barSize={32}
                        className="cursor-pointer"
                      >
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.name === user?.name ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PROFILE SPOTLIGHT */}
              <div className="cand-glass rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center animate-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 scale-150 rounded-full animate-pulse" />
                  {user?.photo ? (
                    <img src={user.photo} alt="hero" className="w-40 h-40 rounded-[2.5rem] object-cover relative z-10 border-4 border-white/5 shadow-2xl" />
                  ) : (
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl font-black text-slate-700 relative z-10 border-2 border-white/5 italic">C</div>
                  )}
                  {myRank === 1 && (
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl z-20 shadow-xl rotate-12">
                      <FiAward />
                    </div>
                  )}
                </div>

                <h4 className="text-3xl font-black text-white italic truncate w-full px-4">{user?.name}</h4>
                <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mt-2 mb-6">Running for {user?.year} CR</p>
                
                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/5">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Manifesto Sentiment</p>
                   <p className="text-sm font-medium leading-relaxed italic text-slate-300">
                     "{user?.bio || 'Committed to representing the voice of the students with integrity and dedication.'}"
                   </p>
                </div>

                <button className="mt-8 flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
                  View Full Profile <FiExternalLink />
                </button>
              </div>
            </div>

            {/* 🏆 Result Spotlight (Shown if Election Completed) */}
            {user?.election?.status === "completed" && (
              <div className="cand-glass bg-emerald-500/5 rounded-[3rem] border border-emerald-500/20 p-12 text-center relative overflow-hidden animate-in" style={{ animationDelay: '0.4s' }}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-emerald-400 tracking-widest uppercase mb-4">Election Finalized</h3>
                  <h1 className="text-5xl font-black text-white mb-6">
                    {isWinner ? "🏆 Congratulations! You have been Elected" : "The Results are In"}
                  </h1>
                  <p className="max-w-2xl mx-auto text-slate-400 font-medium text-lg leading-relaxed mb-8">
                    {isWinner 
                      ? "The student body has placed their trust in your leadership. Your mandate is now official. Prepare for the induction process."
                      : "The participation period has concluded. We thank all candidates for their dedication to the democratic process."}
                  </p>
                  <button className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-sm">
                    View Complete Result Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/* ── Sub-Components ─────────────────────────────────────────── */

const SidebarLink = ({ icon, text, active, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 cursor-pointer border
      ${active 
        ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 scale-[1.02]" 
        : disabled ? "opacity-30 cursor-not-allowed border-transparent text-slate-600" : "bg-transparent border-transparent text-slate-500 hover:bg-white/5 hover:text-white"}
      `}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-sm">{text}</span>
  </div>
);

const MetricPanel = ({ label, value, color }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
    <h4 className={`text-4xl font-black italic ${color === 'blue' ? 'text-blue-400' : 'text-white'}`}>{value}</h4>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.name || label}</p>
        <p className="text-lg font-black text-white">
          {payload[0].value} <span className="text-xs text-blue-400">Votes</span>
        </p>
        <p className="text-[10px] font-bold text-slate-400">{payload[0].payload.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export default CandidateDashboard;
