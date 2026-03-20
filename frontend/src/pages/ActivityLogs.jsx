import { Link } from "react-router-dom";
import EmptyStateCard from "../components/ui/EmptyStateCard";

const ActivityLogs = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <p className="text-sm text-slate-300">
          <Link to="/" className="text-slate-400 hover:text-white">
            Home
          </Link>{" "}
          &gt; Activity Logs
        </p>
      </header>

      <EmptyStateCard
        title="Activity logs placeholder"
        description="All system events, alerts, and operator actions will be listed here for audit and review."
      />
    </div>
  );
};

export default ActivityLogs;
