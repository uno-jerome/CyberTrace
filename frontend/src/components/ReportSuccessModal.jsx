import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, Copy, AlertTriangle, ArrowRight } from 'lucide-react';

const SUMMARY_FIELDS = [
  { labelKey: 'Incident:', valueKey: 'title', mono: false, truncate: true },
  { labelKey: 'Category:', valueKey: 'category', translate: true, translatePrefix: 'categories' },
  { labelKey: 'Platform:', valueKey: 'platform', translate: true, translatePrefix: 'platforms' },
  { labelKey: 'Evidence File:', valueKey: 'fileName', mono: true, truncate: true },
];

const ReportSuccessModal = ({ submission, isCopied, onCopy, onReset, t }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card max-w-xl w-full p-6 sm:p-8 border border-emerald-500/40 shadow-2xl relative">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="text-center mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
            Official Intake Recorded
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {t('report.modal_title')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {t('report.modal_sub')}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-center mb-6">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            {t('report.modal_tracking_label')}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 tracking-wider select-all">
              {submission.trackingId}
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Copy Tracking ID"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {isCopied && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 inline-block">
              {t('report.modal_copied')}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          {SUMMARY_FIELDS.map((field) => (
            <div key={field.labelKey} className="flex justify-between">
              <span className="text-slate-500">{field.labelKey}</span>
              <span
                className={`${field.mono ? 'font-mono text-indigo-700 dark:text-indigo-400' : 'font-medium text-slate-900 dark:text-slate-200'} ${field.truncate ? 'text-right truncate max-w-xs' : ''}`}
              >
                {field.translate
                  ? t(`${field.translatePrefix}.${submission[field.valueKey]}`, submission[field.valueKey])
                  : submission[field.valueKey]}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs mb-6 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">{t('report.modal_warning')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to={`/track/${encodeURIComponent(submission.trackingId)}`}
            className="cyber-btn-primary w-full text-center text-xs py-2.5"
          >
            <span>{t('report.modal_track_btn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="cyber-btn-secondary w-full text-center text-xs py-2.5"
          >
            <span>{t('report.modal_new_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccessModal;
