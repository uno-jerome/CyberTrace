import React from 'react';
import { FileText, Eye, Download, ShieldCheck, ShieldAlert, Copy, Check, Fingerprint } from 'lucide-react';
import { IntegrityBadge } from '../common/StatusBadge';

const EvidenceManifest = ({ evidence, verifyStates, fileActionLoading, onVerify, onDownload, onPreview, copiedHash, onCopyHash }) => {
  return (
    <div className="cyber-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Digital Evidence Files &amp; Integrity Verification</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Securely stored evidence files. Recalculate SHA-256 checksums on demand to verify integrity against original intake records.</p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 self-start sm:self-auto">
          Attached Files: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{evidence.length}</span>
        </span>
      </div>

      {evidence.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">No physical evidence files attached to this case.</div>
      ) : (
        <div className="space-y-6">
          {evidence.map((ev) => {
            const vs = verifyStates[ev._id] || { loading: false, result: null };
            const isDlLoading = !!fileActionLoading[`dl-${ev._id}`];
            const isPrevLoading = !!fileActionLoading[`prev-${ev._id}`];

            return (
              <div key={ev._id} className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ev.originalFilename}</span>
                      <IntegrityBadge status={ev.integrityStatus} />
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      <span>Type: <span className="text-slate-700 dark:text-slate-300">{ev.mimeType}</span></span>
                      <span>Size: <span className="text-slate-300">{ev.fileSizeBytes.toLocaleString()} bytes ({(ev.fileSizeBytes / 1024).toFixed(2)} KB)</span></span>
                      <span>Vault UUID: <span className="text-slate-500 select-all">{ev.storedFilename}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    <button type="button" onClick={() => onPreview(ev)} disabled={isPrevLoading} className="cyber-btn-secondary !py-1.5 !px-3 text-xs font-mono" title="Stream and preview evidence file in browser">
                      <Eye className="w-3.5 h-3.5 text-blue-400" /><span>{isPrevLoading ? 'Streaming...' : 'Preview'}</span>
                    </button>
                    <button type="button" onClick={() => onDownload(ev)} disabled={isDlLoading} className="cyber-btn-secondary !py-1.5 !px-3 text-xs font-mono" title="Download raw file through authenticated route">
                      <Download className="w-3.5 h-3.5 text-indigo-400" /><span>{isDlLoading ? 'Downloading...' : 'Download'}</span>
                    </button>
                    <button type="button" onClick={() => onVerify(ev._id)} disabled={vs.loading} className="cyber-btn-primary !py-1.5 !px-3 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" title="Recalculate SHA-256 hash against baseline to detect unauthorized tampering">
                      {vs.loading ? (<><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Computing SHA-256 Stream...</span></>) : (<><ShieldCheck className="w-3.5 h-3.5" /><span>Verify Evidence Integrity</span></>)}
                    </button>
                  </div>
                </div>

                {/* Hash Display */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-slate-400 text-[11px] uppercase font-bold shrink-0">Original SHA-256:</span>
                      <span className="text-indigo-300 font-mono truncate select-all">{ev.sha256Hash}</span>
                    </div>
                    <button type="button" onClick={() => onCopyHash(ev.sha256Hash)} className="cyber-btn-secondary !py-1 !px-2 text-[10px] self-start sm:self-auto shrink-0" title="Copy original SHA-256 baseline">
                      {copiedHash === ev.sha256Hash ? (<><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>) : (<><Copy className="w-3 h-3" /><span>Copy</span></>)}
                    </button>
                  </div>
                  {ev.md5Hash && (
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <span className="text-[11px] uppercase font-bold shrink-0">Baseline MD5:</span>
                      <span className="text-slate-400 select-all">{ev.md5Hash}</span>
                    </div>
                  )}
                </div>

                {/* Verification Result */}
                {vs.result && (
                  <div className="pt-2">
                    {vs.result.match ? (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono space-y-2 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm"><ShieldCheck className="w-5 h-5 text-emerald-400" /><span>CRYPTOGRAPHIC INTEGRITY CONFIRMED (CLEAN HASH)</span></div>
                          <span className="text-[10px] text-emerald-400/80">Verified at: {new Date(vs.result.verifiedAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">Recalculated SHA-256 byte stream matches the original ingestion baseline perfectly. Zero bits altered since deposit.</p>
                        <div className="bg-slate-950/80 p-2.5 rounded border border-emerald-500/20 text-indigo-300 select-all truncate">SHA-256: {vs.result.currentHash}</div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl bg-rose-950/60 border-2 border-rose-500/80 text-rose-200 text-xs font-mono space-y-4 shadow-2xl animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0"><ShieldAlert className="w-6 h-6" /></div>
                          <div>
                            <h4 className="text-sm font-bold text-rose-400 tracking-wider uppercase">CRITICAL TAMPER WARNING — CHECKSUM MISMATCH</h4>
                            <p className="text-slate-300 text-xs font-sans mt-0.5">Recalculated file hash differs from the ingestion baseline! The evidence file has been modified, corrupted, or replaced.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-700/80 space-y-1">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Baseline Ingestion Hash:</div>
                            <div className="text-indigo-300 font-mono break-all text-xs select-all">{vs.result.baselineHash}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-rose-950/90 border border-rose-500/60 space-y-1">
                            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Recalculated Current Hash:</div>
                            <div className="text-rose-200 font-mono break-all text-xs select-all">{vs.result.currentHash}</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-rose-300 font-sans border-t border-rose-500/30 pt-2 flex items-center justify-between">
                          <span>Audit status recorded: VERIFY_FAIL appended to immutable chain of custody ledger.</span>
                          <span className="font-mono text-[10px] text-slate-400">Timestamp: {new Date(vs.result.verifiedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvidenceManifest;
