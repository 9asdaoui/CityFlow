import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, switchRole } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const roleButtons = useMemo(
    () => [
      {
        label: "ADMIN",
        role: "admin"
      },
      {
        label: "OPERATOR",
        role: "operator"
      }
    ],
    []
  );

  return (
    <header className="h-16 border-b border-slate-800 glass flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-6">
        <label className="relative flex items-center min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-xl">search</span>
          <input
            className="w-full bg-slate-800/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-primary placeholder:text-slate-500"
            placeholder="Search infrastructure..."
            type="text"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-slate-800 rounded-lg p-1">
          {roleButtons.map((btn) => {
            const active = user?.role === btn.role;
            return (
              <button
                key={btn.role}
                type="button"
                onClick={() => {
                  if (user?.role !== btn.role) switchRole();
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-slate-700 mx-2" />

        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-slate-900" />
        </button>

        <button
          className="p-2 text-slate-400 hover:text-white transition-colors"
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          title="Toggle dark mode"
        >
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
