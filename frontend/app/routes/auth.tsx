import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { signIn, signUp, isAuthenticated } from "~/lib/api";
import { ThemeToggle } from "~/lib/theme";

export function meta() {
  return [
    { title: "Account Sign In & Registration — JobFit" },
    { name: "description", content: "Access your JobFit account to manage resumes and review ATS reports." },
  ];
}

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const next = new URLSearchParams(location.search).get("next") || "/";
      navigate(next, { replace: true });
    }
  }, [location.search, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await signUp(username.trim(), password);
      } else {
        await signIn(username.trim(), password);
      }
      const next = new URLSearchParams(location.search).get("next") || "/";
      navigate(next, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header with Brand and Theme Switcher */}
      <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-surface)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="JobFit Logo"
              className="w-8 h-8 rounded-lg object-contain shadow-xs"
            />
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              JobFit
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="card max-w-md w-full p-8 sm:p-10 space-y-6 shadow-xl">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {isRegister ? "Create Your JobFit Account" : "Welcome Back"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {isRegister
                ? "Sign up to track applications and store detailed resume assessments."
                : "Sign in with your username and password to access your dashboard."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-xs text-[var(--color-error)] flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-username" className="input-label">
                Username
              </label>
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="input-label">
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full !py-3 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isRegister ? "Create Account" : "Sign In to Dashboard"}</span>
                )}
              </button>
            </div>
          </form>

          {/* Toggle between Login and Register */}
          <div className="pt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
            <span>
              {isRegister ? "Already have an account?" : "Don't have an account yet?"}
            </span>
            <button
              type="button"
              className="text-[var(--text-primary)] font-bold ml-1.5 hover:underline cursor-pointer"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
            >
              {isRegister ? "Sign In" : "Register Now"}
            </button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]">
        JobFit — Precision Resume ATS Intelligence
      </footer>
    </div>
  );
};

export default Auth;