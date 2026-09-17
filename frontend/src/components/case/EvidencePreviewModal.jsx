import React from 'react';
import { FileText, X } from 'lucide-react';

const EvidencePreviewModal = ({ previewModal, onClose }) => {
  if (!previewModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-slate-700">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold text-white">{previewModal.filename}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{previewModal.mimeType}</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors" title="Close preview">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-950">
          {previewModal.textContent ? (
            <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-all bg-slate-900/80 p-4 rounded-lg border border-slate-800 overflow-x-auto">{previewModal.textContent}</pre>
          ) : previewModal.url && previewModal.mimeType?.startsWith('image/') ? (
            <div className="flex justify-center items-center">
              <img src={previewModal.url} alt={previewModal.filename} className="max-h-[60vh] max-w-full rounded-lg border border-slate-800 object-contain shadow-lg" />
            </div>
          ) : previewModal.url ? (
            <iframe src={previewModal.url} title={previewModal.filename} className="w-full h-[60vh] rounded-lg border border-slate-800 bg-white" />
          ) : (
            <div className="text-center py-12 text-xs font-mono text-slate-500">Cannot preview this file format inline. Please use the Download button.</div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button type="button" onClick={onClose} className="cyber-btn-secondary !py-1.5 !px-4 text-xs font-mono">Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default EvidencePreviewModal;
