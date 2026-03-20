import { Link } from "react-router-dom";
import EmptyStateCard from "../components/ui/EmptyStateCard";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">User Profile</h1>
        <p className="text-sm text-slate-300">
          <Link to="/" className="text-slate-400 hover:text-white">
            Home
          </Link>{" "}
          &gt; Profile
        </p>
      </header>

      <EmptyStateCard
        title="Profile placeholder"
        description={`Name: ${user?.name ?? "Guest"} — Role: ${user?.role ?? "none"}. Profile settings will appear here.`}
      />
    </div>
  );
};

export default Profile;
