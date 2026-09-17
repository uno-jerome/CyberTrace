import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const IntegrityBadge = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
        <span>Verified</span>
      </span>
    );
  }

  if (status === 'Tampered') {
    return (
      <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse w-fit">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-800 dark:text-rose-400" />
        <span>Tampered</span>
      </span>
    );
  }

  return (
    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit">
      <HelpCircle className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      <span>Unchecked</span>
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Critical: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/60',
    High: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
    Medium: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/60',
    Low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const style = styles[priority] || styles.Medium;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} inline-flex items-center gap-1.5`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Reported: {
      class: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/60',
      icon: Clock,
      display: 'Reported',
    },
    'Under Review': {
      class: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
      icon: Clock,
      display: 'Under Review',
    },
    'Under Triage': {
      class: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
      icon: Clock,
      display: 'Under Review',
    },
    Investigating: {
      class: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/60',
      icon: ShieldAlert,
      display: 'Investigating',
    },
    Resolved: {
      class: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60',
      icon: CheckCircle2,
      display: 'Resolved',
    },
    Closed: {
      class: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      icon: CheckCircle2,
      display: 'Closed',
    },
  };

  const current = styles[status] || styles.Reported;
  const Icon = current.icon;
  const displayText = current.display || status;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.class} inline-flex items-center gap-1.5`}>
      <Icon className="w-3 h-3" />
      {displayText}
    </span>
  );
};

export default { IntegrityBadge, PriorityBadge, StatusBadge };
