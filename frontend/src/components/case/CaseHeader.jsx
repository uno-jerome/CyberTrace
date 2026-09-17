import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileDown, AlertTriangle, Fingerprint } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';

const CaseHeader = ({ incident, onExportDossier, exportingDossier, exportError }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Back to Cases</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onExportDossier} disabled={exportingDossier} className="cyber-btn-primary !py-2 !px-4 text-xs font-mono" title="Download full case investigation report as a cryptographic PDF">
            {exportingDossier ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Compiling Report PDF...</span></>
            ) : (
              <><FileDown className="w-4 h-4" /><span>Export Case Report (PDF)</span></>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{exportError}</span>
        </div>
      )}

      <div className="cyber-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-400">{incident.trackingId}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{incident.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{incident.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Incident Description &amp; Narrative</h3>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800/70 whitespace-pre-wrap">{incident.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800/60">
          {[
            { label: 'Complainant:', value: incident.complainantName || 'Anonymous', cls: 'text-slate-800 dark:text-slate-200 font-semibold' },
            { label: 'Contact Details:', value: incident.complainantContact || 'N/A', cls: 'text-slate-700 dark:text-slate-300 truncate block' },
            { label: 'Incident Date:', value: incident.incidentDate ? new Date(incident.incidentDate).toISOString().slice(0, 10) : 'N/A', cls: 'text-slate-800 dark:text-slate-200' },
            { label: 'Date Filed:', value: incident.createdAt ? new Date(incident.createdAt).toISOString().slice(0, 10) : 'N/A', cls: 'text-slate-800 dark:text-slate-200' },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">{item.label}</span>
              <span className={item.cls}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CaseHeader;
