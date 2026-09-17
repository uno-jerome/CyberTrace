import React from 'react';
import { Terminal, X } from 'lucide-react';

const AuditLogInspectorModal = ({ log, onClose, renderActionBadge, renderRoleBadge }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card max-w-2xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Log Deep Inspection</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div><span className="text-slate-500 block text-[10px]">LOG ENTRY ID</span><span className="text-indigo-600 dark:text-indigo-300 select-all">{log._id}</span></div>
          <div><span className="text-slate-500 block text-[10px]">EVENT ACTION</span><div className="pt-0.5">{renderActionBadge(log.action)}</div></div>
          <div><span className="text-slate-500 block text-[10px]">PERFORMER IDENTITY</span><span className="text-slate-900 dark:text-slate-200 select-all">{log.performedBy}</span></div>
          <div><span className="text-slate-500 block text-[10px]">ROLE</span><div className="pt-0.5">{renderRoleBadge(log.role)}</div></div>
          <div><span className="text-slate-500 block text-[10px]">CLIENT IP</span><span className="text-slate-700 dark:text-slate-300 select-all">{log.ipAddress}</span></div>
          <div><span className="text-slate-500 block text-[10px]">TIMESTAMP</span><span className="text-slate-700 dark:text-slate-300">{new Date(log.timestamp).toISOString()}</span></div>
          <div><span className="text-slate-500 block text-[10px]">INCIDENT REF</span><span className="text-slate-700 dark:text-slate-300 select-all">{log.incidentId?.toString() || 'N/A'}</span></div>
          <div><span className="text-slate-500 block text-[10px]">EVIDENCE REF</span><span className="text-slate-700 dark:text-slate-300 select-all">{log.evidenceId?.toString() || 'N/A'}</span></div>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium block text-xs mb-1">Event Description & Hashes:</span>
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs whitespace-pre-wrap leading-relaxed select-all">
            {log.details || 'No descriptive payload attached.'}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="button" onClick={onClose} className="cyber-btn-secondary !py-1.5 !px-4 text-xs">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogInspectorModal;
