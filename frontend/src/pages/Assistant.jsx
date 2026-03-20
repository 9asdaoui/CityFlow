import { Link } from "react-router-dom";
import EmptyStateCard from "../components/ui/EmptyStateCard";

const Assistant = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Assistant</h1>
        <p className="text-sm text-slate-300">
          <Link to="/" className="text-slate-400 hover:text-white">
            Home
          </Link>{" "}
          &gt; Assistant
        </p>
      </header>

      <EmptyStateCard
        title="Command Assistant placeholder"
        description="A conversational assistant for urban operations will appear here. Ask about traffic patterns, incident reports, or system status."
      />
    </div>
  );
};

export default Assistant;
