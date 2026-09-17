import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import apiClient from '../api/axiosClient';
import CoCTimeline from '../components/CoCTimeline';
import CaseHeader from '../components/case/CaseHeader';
import CaseSidebar from '../components/case/CaseSidebar';
import EvidenceManifest from '../components/case/EvidenceManifest';
import EvidencePreviewModal from '../components/case/EvidencePreviewModal';
import StatusUpdateModal from '../components/StatusUpdateModal';

const CaseDetails = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState('');

  const [exportingDossier, setExportingDossier] = useState(false);
  const [exportError, setExportError] = useState('');
  const [verifyStates, setVerifyStates] = useState({});
  const [fileActionLoading, setFileActionLoading] = useState({});
  const [previewModal, setPreviewModal] = useState({ isOpen: false, filename: '', mimeType: '', url: null, textContent: null });
  const [copiedHash, setCopiedHash] = useState('');

  const fetchCaseDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/cases/${id}`);
      setCaseData(res.data);
      if (res.data.incident) setSelectedStatus(res.data.incident.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve case investigation data from vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCaseDetail(); }, [id]);

  const refreshTimeline = async () => {
    try {
      const res = await apiClient.get(`/cases/${id}`);
      if (res.data?.custodyTimeline) setCaseData((prev) => ({ ...prev, custodyTimeline: res.data.custodyTimeline }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (statusOverride) => {
    const targetStatus = statusOverride || selectedStatus;
    if (!targetStatus || targetStatus === caseData?.incident?.status) return;
    setStatusUpdating(true);
    setStatusSuccessMessage('');
    try {
      const res = await apiClient.patch(`/cases/${id}/status`, { status: targetStatus });
      setSelectedStatus(res.data.incident.status);
      setStatusSuccessMessage(`Status updated to "${res.data.incident.status}".`);
      await fetchCaseDetail();
      setTimeout(() => { setStatusSuccessMessage(''); setIsStatusModalOpen(false); }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update case status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSubmitting(true);
    setNoteError('');
    try {
      const res = await apiClient.post(`/cases/${id}/notes`, { text: noteText.trim() });
      setCaseData((prev) => ({ ...prev, incident: res.data.incident }));
      setNoteText('');
    } catch (err) {
      setNoteError(err.response?.data?.message || 'Failed to append note to case file.');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleExportDossier = async () => {
    setExportingDossier(true);
    setExportError('');
    try {
      const res = await apiClient.get(`/cases/${id}/export-dossier`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CyberTrace_Dossier_${caseData.incident.trackingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.response?.data?.message || 'Error generating PDF dossier. Please verify server logs.');
    } finally {
      setExportingDossier(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId) => {
    setVerifyStates((prev) => ({ ...prev, [evidenceId]: { loading: true, result: null } }));
    try {
      const res = await apiClient.post(`/evidence/${evidenceId}/verify`);
      const { match, baselineHash, currentHash, integrityStatus, verifiedAt } = res.data;
      setVerifyStates((prev) => ({ ...prev, [evidenceId]: { loading: false, result: { match, baselineHash, currentHash, integrityStatus, verifiedAt } } }));
      setCaseData((prev) => {
        if (!prev) return prev;
        const updatedEvidence = (prev.evidence || []).map((ev) => ev._id === evidenceId ? { ...ev, integrityStatus } : ev);
        return { ...prev, evidence: updatedEvidence };
      });
      await refreshTimeline();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification process encountered an unexpected error.');
      setVerifyStates((prev) => ({ ...prev, [evidenceId]: { loading: false, result: null } }));
    }
  };

  const handleDownloadEvidence = async (ev) => {
    setFileActionLoading((prev) => ({ ...prev, [`dl-${ev._id}`]: true }));
    try {
      const res = await apiClient.get(`/evidence/${ev._id}/file?disposition=download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: ev.mimeType || 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ev.originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await refreshTimeline();
    } catch {
      alert('Failed to download evidence file. Vault access error.');
    } finally {
      setFileActionLoading((prev) => ({ ...prev, [`dl-${ev._id}`]: false }));
    }
  };

  const handlePreviewEvidence = async (ev) => {
    setFileActionLoading((prev) => ({ ...prev, [`prev-${ev._id}`]: true }));
    try {
      const res = await apiClient.get(`/evidence/${ev._id}/file`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: ev.mimeType || 'application/octet-stream' });
      if (ev.mimeType?.startsWith('text/') || ev.originalFilename.endsWith('.log') || ev.originalFilename.endsWith('.csv') || ev.originalFilename.endsWith('.txt')) {
        setPreviewModal({ isOpen: true, filename: ev.originalFilename, mimeType: ev.mimeType, url: null, textContent: await blob.text() });
      } else {
        setPreviewModal({ isOpen: true, filename: ev.originalFilename, mimeType: ev.mimeType, url: window.URL.createObjectURL(blob), textContent: null });
      }
      await refreshTimeline();
    } catch {
      alert('Failed to preview evidence file.');
    } finally {
      setFileActionLoading((prev) => ({ ...prev, [`prev-${ev._id}`]: false }));
    }
  };

  const copyToClipboard = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2500);
  };

  const closePreviewModal = () => {
    if (previewModal.url) window.URL.revokeObjectURL(previewModal.url);
    setPreviewModal({ isOpen: false, filename: '', mimeType: '', url: null, textContent: null });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 text-center">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-slate-600 dark:text-slate-300">Decrypting case evidence manifest...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="cyber-card p-8 border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Investigation Dossier Inaccessible</h2>
          <p className="text-xs text-rose-600 dark:text-rose-300">{error || 'Case could not be found.'}</p>
          <Link to="/dashboard" className="cyber-btn-secondary inline-flex text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /><span>Return to Cases</span>
          </Link>
        </div>
      </div>
    );
  }

  const { incident, evidence = [], custodyTimeline = [] } = caseData;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <CaseHeader incident={incident} onExportDossier={handleExportDossier} exportingDossier={exportingDossier} exportError={exportError} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EvidenceManifest
            evidence={evidence} verifyStates={verifyStates} fileActionLoading={fileActionLoading}
            onVerify={handleVerifyEvidence} onDownload={handleDownloadEvidence} onPreview={handlePreviewEvidence}
            copiedHash={copiedHash} onCopyHash={copyToClipboard}
          />
        </div>
        <div className="space-y-6">
          <CaseSidebar
            incident={incident} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            onStatusUpdate={() => handleStatusUpdate()} statusUpdating={statusUpdating} statusSuccessMessage={statusSuccessMessage}
            noteText={noteText} setNoteText={setNoteText} onAddNote={handleAddNote}
            noteSubmitting={noteSubmitting} noteError={noteError} onOpenStatusModal={() => setIsStatusModalOpen(true)}
          />
        </div>
      </div>
      <div className="cyber-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Chain of Custody Activity Log</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Sequential, cryptographically verified audit trail. Guaranteed append-only by database schema hooks.
          </p>
        </div>
        <CoCTimeline timeline={custodyTimeline} />
      </div>
      <EvidencePreviewModal previewModal={previewModal} onClose={closePreviewModal} />
      <StatusUpdateModal
        isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}
        currentStatus={incident.status} onUpdateStatus={handleStatusUpdate}
        statusUpdating={statusUpdating} successMessage={statusSuccessMessage}
      />
    </div>
  );
};

export default CaseDetails;
