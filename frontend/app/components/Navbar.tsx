import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getCurrentUsername, isAuthenticated, signOut } from "~/lib/api";
import { ThemeToggle } from "~/lib/theme";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setUsername(getCurrentUsername());
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
    setLoggedIn(false);
    navigate("/auth?next=/", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] rounded-lg min-w-0"
        >
          <img
            src="/logo.png"
            alt="JobFit Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] leading-none truncate">
              JobFit
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-0.5 truncate">
              Resume ANALYZE AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive("/")
                ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive("/upload")
                ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            }`}
          >
            Analyze Resume
          </Link>
          {loggedIn && (
            <Link
              to="/wipe"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive("/wipe")
                  ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              Account
            </Link>
          )}
        </nav>

        {/* Actions & Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <div className="h-4 w-px bg-[var(--border-color)]" />

          {loggedIn ? (
            <div className="flex items-center gap-2">
              {username && (
                <span className="text-xs font-medium text-[var(--text-muted)] px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)]">
                  @{username}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary !text-xs !py-1.5 !px-3.5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth?next=/" className="btn-secondary !text-xs !py-1.5 !px-3.5">
                Sign In
              </Link>
              <Link to="/upload" className="btn-primary !text-xs !py-1.5 !px-3.5">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button & Quick Toggle */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer active:scale-95 transition-transform"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 md:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                }`}
              >
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/upload"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/upload")
                    ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                }`}
              >
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Analyze Resume</span>
              </Link>
              {loggedIn && (
                <Link
                  to="/wipe"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive("/wipe")
                      ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                  }`}
                >
                  <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Account & Settings</span>
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2.5">
              {loggedIn ? (
                <>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-3 py-1 bg-[var(--bg-surface-secondary)] rounded-lg">
                    <span>Signed in as</span>
                    <span className="font-semibold text-[var(--text-primary)]">@{username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary w-full text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/auth?next=/" className="btn-secondary w-full text-center">
                    Sign In
                  </Link>
                  <Link to="/upload" className="btn-primary w-full text-center">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
