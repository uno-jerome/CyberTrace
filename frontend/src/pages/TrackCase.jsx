import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Shield, Lock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useTranslation } from '../context/LanguageContext';
import TrackingSearchCard from '../components/track/TrackingSearchCard';
import VerificationSlip from '../components/track/VerificationSlip';
import ProgressStepper from '../components/track/ProgressStepper';

const TrackCase = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();

  const trackingStages = [
    { key: 'Reported', label: t('stages.Reported.name'), definition: t('stages.Reported.desc') },
    { key: 'Under Review', label: t('stages.Under Review.name'), definition: t('stages.Under Review.desc') },
    { key: 'Investigating', label: t('stages.Investigating.name'), definition: t('stages.Investigating.desc') },
    { key: 'Resolved', label: t('stages.Resolved.name'), definition: t('stages.Resolved.desc') },
  ];

  const initialId = searchParams.get('id') || searchParams.get('trackingId') || routeParams.trackingId || '';
  const [trackingId, setTrackingId] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [incidentData, setIncidentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const performLookup = useCallback(async (idToSearch) => {
    const cleanId = (idToSearch || trackingId).trim().toUpperCase();
    if (!cleanId) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosClient.get(`/incidents/track/${encodeURIComponent(cleanId)}`);
      if (response.data?.incident) setIncidentData(response.data.incident);
      else setErrorMessage('Unexpected response from tracking server.');
    } catch (err) {
      setIncidentData(null);
      setErrorMessage(err.response?.data?.message || `No case found matching "${cleanId}". Please verify that your tracking ID follows the format CASE-YYYY-XXXXX.`);
    } finally {
      setIsLoading(false);
    }
  }, [trackingId]);

  useEffect(() => {
    if (initialId) { setTrackingId(initialId); performLookup(initialId); }
  }, [initialId, performLookup]);

  const getCurrentStageIndex = (status) => {
    if (!status) return 0;
    if (status === 'Closed') return 3;
    const clean = status.toLowerCase();
    if (clean === 'under triage' || clean === 'under review') return 1;
    const index = trackingStages.findIndex((s) => s.key.toLowerCase() === clean);
    return index !== -1 ? index : 0;
  };

  const currentStageIndex = incidentData ? getCurrentStageIndex(incidentData.status) : 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span>&larr; Back to Overview</span>
        </Link>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{t('track.badge')}
        </span>
      </div>

      <TrackingSearchCard trackingId={trackingId} setTrackingId={setTrackingId} isLoading={isLoading} performLookup={performLookup} t={t} />

      {errorMessage && (
        <div className="cyber-card p-6 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">Incident Not Found</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{errorMessage}</p>
              <div className="pt-3 border-t border-rose-200 dark:border-rose-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-300">Troubleshooting Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Ensure the tracking ID matches the format: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">CASE-YYYY-XXXXX</span>.</li>
                  <li>Check for missing hyphens or transposed digits.</li>
                  <li>If you submitted the report recently, allow a few moments for database persistence.</li>
                </ul>
              </div>
              <div className="pt-2">
                <Link to="/report" className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                  <span>File a new incident report</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!incidentData && !errorMessage && !isLoading && (
        <div className="cyber-card p-10 text-center border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('track.awaiting_title')}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">{t('track.awaiting_desc')}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /><span>{t('track.privacy_note')}</span>
          </div>
        </div>
      )}

      {incidentData && (
        <div className="space-y-8">
          <VerificationSlip incidentData={incidentData} t={t} />
          <ProgressStepper trackingStages={trackingStages} currentStageIndex={currentStageIndex} incidentData={incidentData} t={t} />
        </div>
      )}
    </div>
  );
};

export default TrackCase;
