import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, FilePlus, AlertTriangle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useTranslation } from '../context/LanguageContext';
import IncidentReportForm from '../components/IncidentReportForm';
import EvidenceDropzone from '../components/EvidenceDropzone';
import ReportSuccessModal from '../components/ReportSuccessModal';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const INITIAL_FORM = {
  title: '', category: 'Phishing',
  incidentDate: new Date().toISOString().split('T')[0],
  platform: 'FB/Messenger', suspectIdentifiers: '',
  currency: 'PHP (₱)', financialLoss: '', description: '',
  complainantName: '', complainantContact: '',
};

const PublicReport = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelection = (file) => {
    setFileError('');
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Selected file exceeds maximum limit of 50 MB (${formatFileSize(file.size)}).`);
      return;
    }
    if (file.size === 0) {
      setFileError('Selected file is empty (0 Bytes). Please upload a valid evidence file.');
      return;
    }
    setEvidenceFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null); setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!evidenceFile) {
      setFileError('An evidence file (screenshot, receipt, document, or email) is required to submit your report.');
      return;
    }
    setIsSubmitting(true);
    try {
      const structuredNarrative = [
        `[Incident Medium / Platform]: ${formData.platform}`,
        formData.suspectIdentifiers.trim() ? `[Suspect Identifiers]: ${formData.suspectIdentifiers.trim()}` : null,
        formData.financialLoss.trim()
          ? `[Estimated Financial Loss]: ${formData.currency} ${Number(formData.financialLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : null,
        '', '[Incident Narrative]:', formData.description.trim(),
      ].filter((line) => line !== null).join('\n');

      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('incidentDate', formData.incidentDate);
      payload.append('description', structuredNarrative);
      if (formData.platform) payload.append('platform', formData.platform);
      if (formData.suspectIdentifiers.trim()) payload.append('suspectIdentifiers', formData.suspectIdentifiers.trim());
      if (formData.financialLoss.trim()) payload.append('estimatedLoss', formData.financialLoss.trim());
      if (formData.complainantName.trim()) payload.append('complainantName', formData.complainantName.trim());
      if (formData.complainantContact.trim()) payload.append('complainantContact', formData.complainantContact.trim());
      payload.append('evidence', evidenceFile);

      const response = await axiosClient.post('/incidents/public', payload);
      if (response.data && response.data.trackingId) {
        setSubmissionSuccess({
          trackingId: response.data.trackingId, title: formData.title,
          category: formData.category, platform: formData.platform,
          timestamp: new Date().toISOString(), fileName: evidenceFile.name,
        });
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Unable to process incident submission. Please check network connectivity and file constraints.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingId = async () => {
    if (!submissionSuccess?.trackingId) return;
    try {
      await navigator.clipboard.writeText(submissionSuccess.trackingId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleResetForm = () => {
    setFormData({ ...INITIAL_FORM, incidentDate: new Date().toISOString().split('T')[0] });
    setEvidenceFile(null); setFileError(''); setSubmitError('');
    setSubmissionSuccess(null); setIsCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span>&larr; Back to Overview</span>
        </Link>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {t('report.badge')}
        </span>
      </div>

      <div className="cyber-card p-6 sm:p-10 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('report.title')}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('report.subtitle')}</p>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">Submission Rejected</p>
              <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <IncidentReportForm formData={formData} onChange={handleInputChange} disabled={isSubmitting} t={t} />

          <EvidenceDropzone
            fileInputRef={fileInputRef} evidenceFile={evidenceFile} isDragging={isDragging}
            fileError={fileError} isSubmitting={isSubmitting} onFileSelection={handleFileSelection}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onRemoveFile={handleRemoveFile} t={t}
          />

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">Evidentiary Assurance: </span>
              Your file is cryptographically hashed using streaming SHA-256 upon reception. This mathematical
              signature is recorded to an append-only ledger to ensure court admissibility.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fields marked with <span className="text-rose-500 font-bold">*</span> are required for official intake.
            </p>
            <button type="submit" disabled={isSubmitting || !evidenceFile} className="cyber-btn-primary w-full sm:w-auto px-8 py-3 text-sm font-semibold">
              {isSubmitting ? (
                <><Clock className="w-4 h-4 animate-spin" /><span>{t('report.submitting_btn')}</span></>
              ) : (
                <><FilePlus className="w-4 h-4" /><span>{t('report.submit_btn')}</span><ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </div>
        </form>
      </div>

      <ReportSuccessModal submission={submissionSuccess} isCopied={isCopied} onCopy={handleCopyTrackingId} onReset={handleResetForm} t={t} />
    </div>
  );
};

export default PublicReport;
