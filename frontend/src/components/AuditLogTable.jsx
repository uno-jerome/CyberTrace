import React, { useState, useMemo } from 'react';
import {
  Database, Filter, RefreshCw, AlertTriangle, ShieldCheck, Eye, FileText,
  SlidersHorizontal, Calendar, Search, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react';
import AuditLogInspectorModal from './AuditLogInspectorModal';

const ACTION_BADGES = {
  VERIFY_FAIL: { bg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 animate-pulse', Icon: AlertTriangle, label: 'VERIFY_FAIL (TAMPER DETECTED)' },
  VERIFY_PASS: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', Icon: ShieldCheck, label: 'VERIFY_PASS' },
  INGESTION: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', Icon: Database, label: 'INGESTION' },
  VIEW: { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', Icon: Eye, label: 'VIEW' },
  DOWNLOAD: { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', Icon: FileText, label: 'DOWNLOAD' },
  STATUS_CHANGE: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', Icon: SlidersHorizontal, label: 'STATUS_CHANGE' },
};

export const renderActionBadge = (action) => {
  const meta = ACTION_BADGES[action];
  if (meta) {
    const { Icon, bg, label } = meta;
    return (
      <span className={`${bg} border px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono w-fit">
      {action}
    </span>
  );
};

export const renderRoleBadge = (role) => {
  const styles = {
    ADMIN: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold',
    INVESTIGATOR: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-medium',
    CITIZEN: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${styles[role] || 'border-slate-500/20 text-slate-400'}`}>
      {role}
    </span>
  );
};

const AuditLogTable = ({
  logs, loadingLogs, logsError, totalLogs, totalPages, currentPage, limit, setLimit,
  actionFilter, setActionFilter, incidentIdFilter, setIncidentIdFilter,
  startDateFilter, setStartDateFilter, endDateFilter, setEndDateFilter,
  searchKeyword, setSearchKeyword, incidentOptions, loadingIncidents,
  onRefresh, onResetFilters, onPageChange, onDatePreset,
}) => {
  const [inspectedLog, setInspectedLog] = useState(null);

  const displayedLogs = useMemo(() => {
    if (!searchKeyword.trim()) return logs;
    const q = searchKeyword.toLowerCase().trim();
    return logs.filter((l) =>
      l.performedBy?.toLowerCase().includes(q) ||
      l.ipAddress?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.incidentId?.toString().toLowerCase().includes(q)
    );
  }, [logs, searchKeyword]);

  return (
    <div className="space-y-6">
      <div className="cyber-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Chain of Custody Stream Filters
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onResetFilters} className="cyber-btn-secondary !py-1.5 !px-3 text-xs">
              <X className="w-3.5 h-3.5" /><span>Clear Filters</span>
            </button>
            <button type="button" onClick={() => onRefresh(currentPage)} disabled={loadingLogs} className="cyber-btn-secondary !py-1.5 !px-3 text-xs text-indigo-600 dark:text-indigo-300">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Stream</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">Action Event Type</label>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-full cyber-input text-xs !py-2">
              <option value="">All CoC Actions</option>
              <option value="VERIFY_FAIL">VERIFY_FAIL (Tamper Alert)</option>
              <option value="VERIFY_PASS">VERIFY_PASS (Verified Hash)</option>
              <option value="INGESTION">INGESTION (File Ingested)</option>
              <option value="VIEW">VIEW (Evidence Preview)</option>
              <option value="DOWNLOAD">DOWNLOAD (Evidence Download)</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE (Stage Update)</option>
            </select>
          </div>

          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">Target Incident Case</label>
            <select value={incidentIdFilter} onChange={(e) => setIncidentIdFilter(e.target.value)} className="w-full cyber-input text-xs !py-2" disabled={loadingIncidents}>
              <option value="">All Forensic Cases</option>
              {incidentOptions.map((inc) => (
                <option key={inc._id} value={inc._id}>[{inc.trackingId}] {inc.title?.slice(0, 28)}...</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /><span>Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full cyber-input text-[11px] !py-1.5 !px-2" />
              <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full cyber-input text-[11px] !py-1.5 !px-2" />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" /><span>Keyword Search</span>
            </label>
            <div className="relative">
              <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Performer, IP, details..." className="w-full cyber-input text-xs !py-2 pr-8" />
              {searchKeyword && (
                <button type="button" onClick={() => setSearchKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-500 font-mono text-[10px]">PRESETS:</span>
          {['all', 'today', '7days', '30days'].map((p) => (
            <button key={p} type="button" onClick={() => onDatePreset(p)} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
              {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {logsError && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{logsError}</span>
        </div>
      )}

      <div className="cyber-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Global Chain of Custody Ledger</h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">(Showing {displayedLogs.length} of {totalLogs})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 dark:text-slate-400">Rows per page:</label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="cyber-input text-xs !py-1 !px-2">
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {loadingLogs ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            <span className="font-mono">Streaming immutable audit records from vault...</span>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">No Chain of Custody records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Performer Identity</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">Forensic Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
                {displayedLogs.map((log) => {
                  const isTampered = log.action === 'VERIFY_FAIL';
                  return (
                    <tr key={log._id} className={`transition-colors ${isTampered ? 'bg-rose-500/10 border-l-4 border-l-rose-500' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'}`}>
                      <td className="py-3 px-4 whitespace-nowrap">{renderActionBadge(log.action)}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-200 font-medium truncate max-w-[180px]">{log.performedBy}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{renderRoleBadge(log.role)}</td>
                      <td className="py-3 px-4 whitespace-nowrap"><span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{log.ipAddress}</span></td>
                      <td className="py-3 px-4 font-sans text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">{log.details || '—'}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button type="button" onClick={() => setInspectedLog(log)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1">Inspect</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-900 dark:text-white font-mono font-medium">{currentPage}</span> of <span className="text-slate-900 dark:text-white font-mono font-medium">{totalPages}</span> • <span className="font-mono">{totalLogs}</span> Total Events
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => onPageChange(1)} disabled={currentPage <= 1 || loadingLogs} className="cyber-btn-secondary !p-2 disabled:opacity-40"><ChevronsLeft className="w-4 h-4" /></button>
            <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1 || loadingLogs} className="cyber-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /><span>Prev</span></button>
            <span className="px-3 py-1 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">{currentPage} / {totalPages}</span>
            <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages || loadingLogs} className="cyber-btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 disabled:opacity-40"><span>Next</span><ChevronRight className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages || loadingLogs} className="cyber-btn-secondary !p-2 disabled:opacity-40"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <AuditLogInspectorModal
        log={inspectedLog}
        onClose={() => setInspectedLog(null)}
        renderActionBadge={renderActionBadge}
        renderRoleBadge={renderRoleBadge}
      />
    </div>
  );
};

export default AuditLogTable;
