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

      <main className="flex-1 py-12">
        <div className="app-container max-w-2xl space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Account & Settings
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage your active session, privacy settings, and resume storage preferences.
            </p>
          </div>

          {/* Account Profile Card */}
          <div className="card p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Profile & Session Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Username
                  </p>
                  <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                    {username || "Authenticated User"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Authentication Mode
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                    JWT Session Token (Encrypted)
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">Secure</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[var(--text-muted)]">
                Signing out clears your credentials from this device.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary !text-xs !py-2 !px-5 w-full sm:w-auto"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Data & Privacy Card */}
          <div className="card p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Data Storage & Privacy
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Resumes and analysis results are stored securely in your private workspace database and isolated to your user ID. You can delete individual reports anytime from your dashboard.
            </p>

            <div className="pt-2">
              <Link to="/" className="btn-primary !text-xs !py-2.5 !px-5">
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