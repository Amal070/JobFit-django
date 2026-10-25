import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { getCurrentUsername, isAuthenticated, signOut } from "~/lib/api";

export function meta() {
  return [
    { title: "Account & Data Settings — JobFit" },
    { name: "description", content: "Manage your JobFit account and data storage settings." },
  ];
}

const WipeApp = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loggedIn = isAuthenticated();
    setAuthenticated(loggedIn);
    if (!loggedIn) {
      navigate("/auth?next=/wipe");
    } else {
      setUsername(getCurrentUsername());
    }
  }, [navigate]);

  const handleLogout = () => {
    signOut();
    setAuthenticated(false);
    navigate("/auth?next=/wipe");
  };

  return (
    <div className="app-page">
      <Navbar />

      <main className="flex-1 py-6 sm:py-12">
        <div className="app-container max-w-2xl space-y-6 sm:space-y-8">
          <div className="space-y-1 sm:space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Account & Settings
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Manage your active session, privacy settings, and resume storage preferences.
            </p>
          </div>

          {/* Account Profile Card */}
          <div className="card p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Profile & Session Information
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Username
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5 truncate">
                    {username || "Authenticated User"}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] flex-shrink-0">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Authentication Mode
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] mt-0.5 truncate">
                    JWT Session Token (Encrypted)
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">Secure</span>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-xs text-[var(--text-muted)] text-center sm:text-left">
                Signing out clears your credentials from this device.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary !text-xs !py-2.5 !px-5 w-full sm:w-auto"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Data & Privacy Card */}
          <div className="card p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Data Storage & Privacy
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Resumes and analysis results are stored securely in your private workspace database and isolated to your user ID. You can delete individual reports anytime from your dashboard.
            </p>

            <div className="pt-2">
              <Link to="/" className="btn-primary !text-xs !py-2.5 !px-5 w-full sm:w-auto text-center">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WipeApp;