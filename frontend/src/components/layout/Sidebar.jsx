import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/assistant", label: "Assistant", icon: "chat_bubble" },
  { to: "/activity", label: "Activity Logs", icon: "receipt_long" },
  { to: "/health", label: "System Health", icon: "health_metrics" }
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-2xl">location_city</span>
        </div>
        <div>
          <h1 className="text-white text-base font-bold leading-none">CityFlow Sentinel</h1>
          <p className="text-slate-400 text-xs mt-1">Urban Command Center</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "sidebar-item-active text-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-8 pb-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Account</p>
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "sidebar-item-active text-slate-100"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >
          <span className="material-symbols-outlined">person</span>
          <span>Profile</span>
        </NavLink>

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "sidebar-item-active text-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Admin Settings</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2">
          <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_gWoUbkbvb4BHLlevi_vEBhXCgV2mztUDZ2Nl5S1M_1MvkQ4tqXUvOI6gSwkxcvEykNRIb3a5YCfe-FNh1JHvADfpdp88vpcYBQXu5nESc-D8vIi0o85k36U79uLGX58SVReyMbwRy90AY-NeC6TEEOrfPyDeMVpFj70MW2GgXQmtFrDew1Uo7QE4iGspDj8TuLZfKbAsWjWna3i4XHiclRIDyC-MaDEkIydLy0F1ggplyGyvGbTMPamJHOBblyBQcEHZ6LImc9o"
              alt="User profile avatar photo"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name ?? "Marcus Vane"}</p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role === "admin" ? "Senior Admin" : "Operator"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
