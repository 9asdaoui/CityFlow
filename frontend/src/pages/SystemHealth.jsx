import { Link } from "react-router-dom";
import EmptyStateCard from "../components/ui/EmptyStateCard";

const SystemHealth = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">System Health</h1>
        <p className="text-sm text-slate-300">
          <Link to="/" className="text-slate-400 hover:text-white">
            Home
          </Link>{" "}
          &gt; System Health
        </p>
      </header>

      <EmptyStateCard
        title="System health placeholder"
        description="Key services, telemetry streams, and infrastructure status will be shown here in a live dashboard."
      />
    </div>
  );
};

export default SystemHealth;
