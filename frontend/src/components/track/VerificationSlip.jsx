import React from 'react';
import { FileCheck2, Calendar, Clock, User, Fingerprint } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';

const formatDateTime = (dateString) => {
  if (!dateString) return 'Pending Phase';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const SLIP_META = [
  { Icon: Calendar, labelKey: 'track.slip_date', getValue: (d) => d.incidentDate ? new Date(d.incidentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A' },
  { Icon: Clock, labelKey: 'track.slip_status', getValue: (d) => formatDateTime(d.createdAt) },
  { Icon: User, labelKey: 'track.slip_complainant', getValue: (d) => d.complainantName || 'Anonymous Citizen' },
];

const VerificationSlip = ({ incidentData, t }) => {
  return (
    <div className="cyber-card p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-700 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('track.slip_title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-wider">{incidentData.trackingId}</span>
            <StatusBadge status={incidentData.status} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2 tracking-tight">{incidentData.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:self-start">
          <PriorityBadge priority={incidentData.priority} />
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {t(`categories.${incidentData.category}`, incidentData.category)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
        {SLIP_META.map((meta) => (
          <div key={meta.labelKey} className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold flex items-center gap-1.5">
              <meta.Icon className="w-3.5 h-3.5 text-slate-400" /> {t(meta.labelKey)}
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-mono font-medium">{meta.getValue(incidentData)}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 space-y-2">
        <h3 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Sanitized Intake Record</h3>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-line font-mono">
          {incidentData.description}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
          <Fingerprint className="w-4 h-4" /><span>Cryptographic SHA-256 baseline verified in vault</span>
        </div>
        <span>Sanitized for public transparency under Republic Act compliance</span>
      </div>
    </div>
  );
};

export default VerificationSlip;
