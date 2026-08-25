import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME: Record<string, string> = {
  applicant: "/dashboard",
  visa_officer: "/visa-officer",
  immigration_officer: "/border/check-in",
  admin: "/admin",
};

export default function UnauthorizedPage() {
  const { profile, signOut } = useAuth();
  const home = profile ? ROLE_HOME[profile.role] ?? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex items-center justify-center px-8">
      <div className="max-w-sm text-center">
        <p className="font-display text-2xl text-status-rejected mb-2">Access denied</p>
        <p className="text-sm text-ink-soft mb-8">
          Your account doesn't have permission to view that page.
          {profile && (
            <>
              {" "}You're signed in as <span className="font-medium">{profile.role.replace("_", " ")}</span>.
            </>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to={home}
            className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark transition"
          >
            Go to my dashboard
          </Link>
          {profile && (
            <button
              onClick={signOut}
              className="border border-primary-light text-ink-soft px-5 py-2.5 rounded-md text-sm font-medium hover:border-primary/40 transition"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
