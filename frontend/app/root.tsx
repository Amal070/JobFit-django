import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ThemeProvider } from "~/lib/theme";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "apple-touch-icon", href: "/logo.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('jobfit-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark) || (stored === 'system' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-150">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-primary)] border-t-transparent" />
        <p className="text-sm text-[var(--text-muted)] font-medium">Loading JobFit AI...</p>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page Not Found (404)" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "The page you're looking for does not exist or has been moved."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      <div className="card p-8 max-w-lg w-full text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{message}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{details}</p>
        <div className="pt-2">
          <a href="/" className="btn-primary">
            Return to Homepage
          </a>
        </div>
        {stack && (
          <pre className="mt-4 p-4 text-left text-xs bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] rounded-xl overflow-x-auto text-[var(--text-muted)]">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
