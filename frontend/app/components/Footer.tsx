import React from "react";
import { Link } from "react-router";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)] mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-3 sm:space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="JobFit Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs flex-shrink-0"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                JobFit
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Precision AI-driven resume scoring and ATS optimization. Receive real-time insights, keyword matching, and tailored suggestions to land your dream role.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 sm:mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block py-0.5"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block py-0.5"
                >
                  Analyze Resume
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block py-0.5"
                >
                  Account Access
                </Link>
              </li>
              <li>
                <Link
                  to="/wipe"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-block py-0.5"
                >
                  Settings & Data
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 sm:mb-3">
              Technology
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                <span>ATS Scoring Engine</span>
              </li>
              <li className="flex items-center gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                <span>PyMuPDF Parsing</span>
              </li>
              <li className="flex items-center gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                <span>Ultra-fast AI Inference</span>
              </li>
              <li className="flex items-center gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                <span>Client-side Privacy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[var(--text-muted)] text-center sm:text-left">
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
