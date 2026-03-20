import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getTensionScore } from "../utils/api";

const Dashboard = () => {
  const [tensionScore, setTensionScore] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payload = useMemo(() => {
    const now = new Date();
    return {
      date_time: now.toISOString().slice(0, 19).replace("T", " "),
      temp: 286.15,
      rain_1h: 0.0,
      snow_1h: 0.0
    };
  }, []);

  const refreshTension = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTensionScore(payload);
      setTensionScore(data.tension_score.toFixed(1));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTension();
  }, []);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link className="hover:text-primary transition-colors" to="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-100 font-medium">Dashboard</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Urban Dashboard</h2>
          <p className="text-slate-400 mt-1">
            Real-time city monitoring and strategic management
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="glass rounded-xl px-4 py-3 text-sm text-slate-200">
            <p className="text-xs text-slate-400">Current tension score</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {tensionScore ?? "—"}
            </p>
            <p className="text-[11px] text-slate-400">Last updated: {lastUpdated ?? "—"}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshTension}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
              <span className="material-symbols-outlined text-sm">add_chart</span>
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization + Sidebar Stats */}
      <div className="w-full">
        <div className="glass rounded-xl overflow-hidden shadow-2xl">
          {error ? (
            <div className="p-6">
              <p className="text-sm text-rose-300">Error fetching tension score: {error}</p>
              <button
                onClick={refreshTension}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="p-6">
              <p className="text-sm text-slate-200">Loading tension score...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
              <div className="lg:col-span-3 relative group">
              <div
                className="absolute inset-0 bg-slate-900 flex items-center justify-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAymzmnq2OlxipYvEZEFCdyPBHGGWPGipYs8Pg5VisXiJaR5H4MsWcmFhaOZE4fK7C4yKYIhPrK9Pyy_hZZb4_s-p8pGCaPVE-jeilERyeqq_Qi2ZF7UAx3m8YTpH0YNCGQErMmPyKjBrSOJPXVNzpmU6C5G6e13mvBMvbHIoxYx9UkjAzeEEKvp3DixqUt7naWNHq0W6j5qchqUKEV41HQWTyqaI7Q5zp-xyPiEHQnbW5S-jsgNovY17Y-1-4MBVgnhjRUmeBL0a0')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
                <div className="z-10 text-center bg-slate-900/80 backdrop-blur-md px-8 py-10 rounded-2xl border border-white/10 shadow-2xl">
                  <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">map</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Urban Map Visualization</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                    The Urban Map visualization will be integrated here. Real-time traffic, utility, and security layers will overlay the city grid.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 border-l border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Quick Stats
                </h4>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400">Total Incidents</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">124</span>
                      <span className="text-[10px] text-green-400 flex items-center">
                        <span className="material-symbols-outlined text-[12px]">trending_down</span> 12%
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400">Network Load</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">82%</span>
                      <span className="text-[10px] text-red-400 flex items-center">
                        <span className="material-symbols-outlined text-[12px]">trending_up</span> 5%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Active Layers
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "Traffic Flow", checked: true },
                    { label: "Public Transit", checked: true },
                    { label: "Emergency Services", checked: false },
                    { label: "Utility Grid", checked: false }
                  ].map((layer) => (
                    <label
                      key={layer.label}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-slate-800 cursor-pointer"
                    >
                      <span className="text-xs text-slate-300">{layer.label}</span>
                      <input
                        type="checkbox"
                        checked={layer.checked}
                        readOnly
                        className="rounded bg-slate-700 border-none text-primary focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <button className="w-full bg-slate-100 text-slate-900 py-2.5 rounded-lg text-sm font-bold hover:bg-white transition-colors">
                  View Full Legend
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-white text-sm">System Health</h5>
            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[94%]" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All core subsystems operating within nominal parameters. Last check: 2m ago.
          </p>
        </div>

        <div className="glass p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-white text-sm">Security Alerts</h5>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold">
              2 PENDING
            </span>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-slate-400">warning</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-200">Zone 4 Boundary Sensor</p>
              <p className="text-[10px] text-slate-500">Signal noise detected</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl flex flex-col justify-center items-center text-center space-y-2 border-dashed border-2 border-slate-700 bg-transparent">
          <span className="material-symbols-outlined text-slate-500">add</span>
          <p className="text-xs text-slate-500 font-medium">Add Widget to Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
