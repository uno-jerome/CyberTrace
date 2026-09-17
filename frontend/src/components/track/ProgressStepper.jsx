import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const formatDateTime = (dateString) => {
  if (!dateString) return 'Pending Phase';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const ProgressStepper = ({ trackingStages, currentStageIndex, incidentData, t }) => {
  return (
    <div className="cyber-card p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('track.progress_title')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('track.progress_sub')}</p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {t('track.stage_counter', { current: currentStageIndex + 1, total: trackingStages.length })}
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8">
        {trackingStages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage.key} className="relative group">
              {index !== trackingStages.length - 1 && (
                <div className={`absolute left-[-18px] sm:left-[-22px] top-7 bottom-[-32px] w-0.5 transition-colors ${
                  isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-gradient-to-b from-indigo-600 to-slate-200 dark:to-slate-800' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}

              <div className={`absolute left-[-28px] sm:left-[-32px] top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                isCompleted ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                : isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : isCurrent ? <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  : <span className="text-[10px] font-mono">{index + 1}</span>}
              </div>

              <div className={`p-5 rounded-xl border transition-all ${
                isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-sm'
                : isCompleted ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                : 'bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      : isCurrent ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>{stage.label}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{stage.title}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {isCompleted ? (index === 0 ? formatDateTime(incidentData.createdAt) : 'Completed')
                        : isCurrent ? `Active Since ${formatDateTime(incidentData.updatedAt || incidentData.createdAt)}`
                        : 'Pending'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{stage.definition}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
