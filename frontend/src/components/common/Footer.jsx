import React from 'react';
import { Shield, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-sm text-slate-600 dark:text-slate-400 text-xs py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">CyberTrace Forensic Framework</span>
              <span className="mx-2 text-slate-400 dark:text-slate-600">|</span>
              <span>SHA-256 Evidence Vault &amp; Immutable Chain of Custody</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tamper Guard Active</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Lock className="w-3 h-3" />
              <span>AES-256 / SHA-256 Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 CyberTrace Incident Response &amp; Digital Forensics System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-slate-500 dark:text-slate-600">
            Node v20 • Express 5 • MongoDB • React 18 • Vite
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
