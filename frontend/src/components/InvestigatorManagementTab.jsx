import React from 'react';
import { UserPlus, Lock, Clock, Info } from 'lucide-react';

const InvestigatorManagementTab = ({ recentProvisioned, onOpenProvisionModal }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 cyber-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Investigator Staff Access</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Authorize digital forensic investigators for evidence intake, dossier review, and integrity verification.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenProvisionModal}
            className="cyber-btn-primary text-xs !py-2 !px-4"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            <span>Provision New Staff</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Forensic Role Clearance Architecture</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Investigator accounts are provisioned with Level-2 system clearance. They are permitted to stream digital evidence files, execute SHA-256 tamper verifications, and append internal notes.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Role: INVESTIGATOR
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Streaming SHA-256 Vault
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              Bcrypt 10 Rounds
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Session Provisioning Log</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{recentProvisioned.length} Added</span>
          </div>

          {recentProvisioned.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs space-y-1">
              <p>No new investigators provisioned in this active browser session.</p>
              <button
                type="button"
                onClick={onOpenProvisionModal}
                className="text-indigo-600 dark:text-indigo-400 underline font-mono text-[11px] mt-2 block mx-auto"
              >
                Click to provision an investigator now
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentProvisioned.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-300">{item.email}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Role: {item.role}</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cyber-card p-6 space-y-3 border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/10">
          <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Forensic Security &amp; Audit Trail</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All investigator activities—logging in, viewing evidence files, calculating checksums, and updating notes—are recorded in the append-only Chain of Custody ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestigatorManagementTab;
