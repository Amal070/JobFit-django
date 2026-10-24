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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] rounded-lg">
          <img
            src="/logo.png"
            alt="JobFit Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-none">
              JobFit
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-0.5">
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

        {/* Actions & Theme Toggle */}
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
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-medium ${
                isActive("/")
                  ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className={`px-3 py-2 rounded-xl text-sm font-medium ${
                isActive("/upload")
                  ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Analyze Resume
            </Link>
            {loggedIn && (
              <Link
                to="/wipe"
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive("/wipe")
                    ? "bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                Account & Settings
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
            {loggedIn ? (
              <>
                <div className="text-xs text-[var(--text-muted)] px-3">
                  Signed in as <span className="font-semibold text-[var(--text-primary)]">{username}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary w-full"
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
      )}
    </header>
  );
};

export default Navbar;
