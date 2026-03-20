import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("operator");

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    login(role);
    const next = new URLSearchParams(location.search).get("next") || "/";
    navigate(next, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-control-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-control-border bg-[#07102c]/70 p-8 shadow-lg backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">CityFlow Sentinel</h1>
        <p className="mt-2 text-sm text-slate-300">
          Sign in as an Operator or Administrator to access the command center.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Select role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="operator">Operator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          This is a mock login for development. Use the role selector to test Admin vs
          Operator access.
        </p>
      </div>
    </div>
  );
};

export default Login;
