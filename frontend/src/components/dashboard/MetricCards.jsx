import React from 'react';
import { Layers, Clock, AlertTriangle, ShieldAlert, ChevronRight } from 'lucide-react';

const METRIC_DEFS = [
  {
    key: 'total',
    label: 'Total Logged Cases',
    subtitle: 'incidents',
    cta: 'Show all entries',
    Icon: Layers,
    color: 'blue',
    filterFn: (set) => { set.status('ALL'); set.priority('ALL'); },
    isActive: (sf, pf) => sf === 'ALL' && pf === 'ALL',
  },
  {
    key: 'triagePending',
    label: 'Pending Review',
    subtitle: 'awaiting review',
    cta: 'Reported / Under Review',
    Icon: Clock,
    color: 'amber',
    filterFn: (set) => { set.status('PENDING'); set.priority('ALL'); },
    isActive: (sf) => sf === 'PENDING',
  },
  {
    key: 'highPriority',
    label: 'High / Critical Risk',
    subtitle: 'urgent attention',
    cta: 'Critical & High tier',
    Icon: AlertTriangle,
    color: 'rose',
    filterFn: (set) => { set.status('ALL'); set.priority('HIGH_CRITICAL'); },
    isActive: (_, pf) => pf === 'HIGH_CRITICAL',
  },
  {
    key: 'activeInvestigations',
    label: 'Active Investigations',
    subtitle: 'in progress',
    cta: 'Active forensic scrutiny',
    Icon: ShieldAlert,
    color: 'blue',
    filterFn: (set) => { set.status('Investigating'); set.priority('ALL'); },
    isActive: (sf) => sf === 'Investigating',
  },
];

const COLOR_MAP = {
  blue: {
    label: 'text-blue-800 dark:text-blue-400',
    icon: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-400',
    value: 'text-blue-800 dark:text-blue-400',
    active: 'border-blue-500/60 ring-1 ring-blue-500/40',
  },
  amber: {
    label: 'text-amber-800 dark:text-amber-400',
    icon: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-400',
    value: 'text-amber-800 dark:text-amber-400',
    active: 'border-amber-500/60 ring-1 ring-amber-500/40',
  },
  rose: {
    label: 'text-rose-800 dark:text-rose-400',
    icon: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-400',
    value: 'text-rose-800 dark:text-rose-400',
    active: 'border-rose-500/60 ring-1 ring-rose-500/40',
  },
  emerald: {
    label: 'text-emerald-800 dark:text-emerald-400',
    icon: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-400',
    value: 'text-emerald-800 dark:text-emerald-400',
    active: 'border-emerald-500/60 ring-1 ring-emerald-500/40',
  },
};

const MetricCards = ({ metrics, statusFilter, priorityFilter, setStatusFilter, setPriorityFilter }) => {
  const setters = { status: setStatusFilter, priority: setPriorityFilter };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRIC_DEFS.map((m) => {
        const c = COLOR_MAP[m.color];
        const active = m.isActive(statusFilter, priorityFilter);
        return (
          <div
            key={m.key}
            onClick={() => m.filterFn(setters)}
            className={`cyber-card p-5 cursor-pointer transition-all duration-200 ${active ? c.active : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${c.label}`}>{m.label}</span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.icon}`}>
                <m.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono tracking-tight ${m.key === 'total' ? 'text-slate-900 dark:text-white' : c.value}`}>
                {metrics[m.key]}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">{m.subtitle}</span>
            </div>
            <div className={`mt-2 text-[11px] flex items-center gap-1 font-mono font-semibold ${c.label}`}>
              <span>{m.cta}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
