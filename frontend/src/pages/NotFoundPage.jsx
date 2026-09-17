import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-xl shadow-rose-500/10">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
        ERROR CODE 404 • TARGET NOT FOUND
      </span>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Sector Does Not Exist</h1>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        The requested endpoint or forensic evidence record is not present in the CyberTrace directory.
      </p>

      <Link to="/" className="cyber-btn-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Operations Center</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
