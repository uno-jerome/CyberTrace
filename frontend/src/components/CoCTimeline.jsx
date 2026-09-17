import React, { useState, useMemo } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, UploadCloud, Eye, Download,
  GitCommit, Clock, User, Globe, ArrowDownUp, Filter
} from 'lucide-react';

const ACTION_META = {
  INGESTION: { label: 'Ingestion & Hashing', icon: UploadCloud, badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20', dotClass: 'bg-sky-400 ring-4 ring-sky-500/20' },
  VIEW: { label: 'File Inspected', icon: Eye, badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dotClass: 'bg-blue-400 ring-4 ring-blue-500/20' },
  DOWNLOAD: { label: 'File Downloaded', icon: Download, badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', dotClass: 'bg-indigo-400 ring-4 ring-indigo-500/20' },
  VERIFY_PASS: { label: 'Cryptographic Check PASSED', icon: ShieldCheck, badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dotClass: 'bg-emerald-400 ring-4 ring-emerald-500/20' },
  VERIFY_FAIL: { label: 'TAMPER DETECTED / FAILED', icon: ShieldAlert, badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse', dotClass: 'bg-rose-500 ring-4 ring-rose-500/30 animate-pulse' },
  STATUS_CHANGE: { label: 'Status Transition', icon: GitCommit, badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dotClass: 'bg-amber-400 ring-4 ring-amber-500/20' },
};

const DEFAULT_META = { label: 'Audit Action', icon: Shield, badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dotClass: 'bg-slate-400 ring-4 ring-slate-500/20' };

const ROLE_BADGES = {
  ADMIN: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  INVESTIGATOR: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  CITIZEN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

const CoCTimeline = ({ timeline = [] }) => {
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterAction, setFilterAction] = useState('ALL');

  const processedLogs = useMemo(() => {
    let result = [...timeline];
    if (filterAction !== 'ALL') {
      result = result.filter((log) => log.action === filterAction);
    }
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
    return result;
  }, [timeline, sortOrder, filterAction]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ledger Records: <span className="text-slate-900 dark:text-white font-bold">{timeline.length}</span> Total
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Append-Only
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="cyber-input !py-1 !px-2.5 text-[11px] font-mono"
            >
              <option value="ALL">All Actions ({timeline.length})</option>
              <option value="INGESTION">Ingestion</option>
              <option value="VERIFY_PASS">Verify Pass</option>
              <option value="VERIFY_FAIL">Verify Fail / Tamper</option>
              <option value="STATUS_CHANGE">Status Changes</option>
              <option value="VIEW">Views</option>
              <option value="DOWNLOAD">Downloads</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="cyber-btn-secondary !py-1 !px-2.5 text-[11px] font-mono"
          >
            <ArrowDownUp className="w-3 h-3 text-indigo-400" />
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      </div>

      {processedLogs.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 cyber-card">
          No audit entries matching the selected filter criteria.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {processedLogs.map((log, index) => {
            const meta = ACTION_META[log.action] || DEFAULT_META;
            const Icon = meta.icon;
            const logDate = new Date(log.timestamp);

            return (
              <div key={log._id || `${log.timestamp}-${index}`} className="relative group">
                <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 ${meta.dotClass} flex items-center justify-center`} />

                <div
                  className={`cyber-card p-4 transition-all duration-200 ${
                    log.action === 'VERIFY_FAIL'
                      ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20'
                      : log.action === 'VERIFY_PASS'
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 ${meta.badgeClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{log.action}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{meta.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{logDate.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 mb-2.5 font-sans leading-relaxed break-words">
                    {log.details}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Actor:</span>
                      <span className="text-slate-900 dark:text-slate-200 font-semibold">{log.performedBy}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border ${ROLE_BADGES[log.role] || 'border-slate-500/20 text-slate-400'}`}>
                        {log.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Globe className="w-3 h-3" />
                      <span>IP:</span>
                      <span className="text-slate-700 dark:text-slate-400 select-all">{log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoCTimeline;
