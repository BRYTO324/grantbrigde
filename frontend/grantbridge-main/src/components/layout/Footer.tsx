import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-bold text-white font-[Outfit] tracking-tight">
                GrantBridge
              </span>
            </Link>
            <p className="text-sm text-slate-200 leading-relaxed">
              Connecting African entrepreneurs with forward-thinking funders to
              build the future together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              For Entrepreneurs
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#submit-project"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Submit a project
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Verification Process
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Track your Project
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              For Funders
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Browse Projects
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  How funding works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Impact Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Payment Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Funder FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Career
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-200 hover:text-brand-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 GrantBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
