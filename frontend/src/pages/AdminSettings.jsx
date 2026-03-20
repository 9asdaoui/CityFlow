import { Link } from "react-router-dom";
import EmptyStateCard from "../components/ui/EmptyStateCard";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Admin Settings</h1>
        <p className="text-sm text-slate-300">
          <Link to="/" className="text-slate-400 hover:text-white">
            Home
          </Link>{" "}
          &gt; Admin Settings
        </p>
      </header>

      <EmptyStateCard
        title="Administration settings placeholder"
        description="This section will let administrators manage users, system policies, and deployment controls."
      />
    </div>
  );
};

export default AdminSettings;
