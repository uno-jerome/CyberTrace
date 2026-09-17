import React from 'react';
import { Search, ArrowRight, RefreshCw } from 'lucide-react';

const TrackingSearchCard = ({ trackingId, setTrackingId, isLoading, performLookup, t }) => {
  const handleFormSubmit = (e) => { e.preventDefault(); performLookup(); };

  return (
    <div className="cyber-card p-6 sm:p-8 mb-8 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('track.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{t('track.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input type="text" required value={trackingId} onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            placeholder={t('track.input_placeholder')} className="cyber-input w-full font-mono text-sm tracking-wider uppercase pl-10" disabled={isLoading} />
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
        </div>
        <button type="submit" disabled={isLoading || !trackingId.trim()} className="cyber-btn-primary px-6 py-2.5 sm:py-0 whitespace-nowrap text-sm font-semibold">
          {isLoading ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>{t('track.searching_btn')}</span></>) : (<><span>{t('track.search_btn')}</span><ArrowRight className="w-4 h-4" /></>)}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-mono">{t('track.quick_samples')}</span>
        {['CASE-2026-00001', 'CASE-2026-00002', 'CASE-2026-00003'].map((sampleId) => (
          <button key={sampleId} type="button" onClick={() => { setTrackingId(sampleId); performLookup(sampleId); }}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-indigo-700 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-indigo-300 dark:hover:text-indigo-200 border border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-500 font-mono text-[11px] transition-colors">
            {sampleId}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrackingSearchCard;
