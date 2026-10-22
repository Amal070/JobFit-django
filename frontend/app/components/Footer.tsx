import React from "react";
import { Link } from "react-router";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)] mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="JobFit Logo"
                className="w-8 h-8 rounded-lg object-contain shadow-xs"
              />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                JobFit
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Precision AI-driven resume scoring and ATS optimization. Receive real-time insights, keyword matching, and tailored suggestions to land your dream role.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Analyze Resume
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Account Access
                </Link>
              </li>
              <li>
                <Link
                  to="/wipe"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Settings & Data
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Technology
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                ATS Scoring Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                PyMuPDF Parsing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                Ultra-fast AI Inference
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                Client-side Privacy
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} JobFit — Precision Resume ATS Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
