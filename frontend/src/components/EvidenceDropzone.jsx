import React from 'react';
import {
  UploadCloud,
  FileText,
  FileCheck,
  Lock,
  X,
  AlertTriangle,
} from 'lucide-react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const EvidenceDropzone = ({
  fileInputRef,
  evidenceFile,
  isDragging,
  fileError,
  isSubmitting,
  onFileSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  t,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t('report.section_evidence')} <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Max 50 MB</span>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => onFileSelection(e.target.files[0])}
        className="hidden"
        disabled={isSubmitting}
      />

      {/* Drag & Drop Visual Area */}
      {!evidenceFile ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-sm scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-950/50 dark:hover:bg-slate-900/60'
          }`}
        >
          <UploadCloud
            className={`w-10 h-10 mx-auto mb-3 transition-colors ${
              isDragging ? 'text-indigo-600 dark:text-indigo-400 animate-bounce' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'
            }`}
          />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {t('report.dropzone_title')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {t('report.dropzone_sub')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm transition-colors">
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('report.dropzone_title')}</span>
          </div>
        </div>
      ) : (
        /* File Selected Preview State */
        <div className="cyber-card p-4 sm:p-5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                {evidenceFile.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{formatFileSize(evidenceFile.size)}</span>
                <span>&bull;</span>
                <span className="truncate">{evidenceFile.type || 'Binary File'}</span>
                <span>&bull;</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" /> Ready for Intake
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm transition-colors"
            >
              Change File
            </button>
            <button
              type="button"
              onClick={onRemoveFile}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* File Error Notice */}
      {fileError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{fileError}</span>
        </p>
      )}
    </div>
  );
};

export default EvidenceDropzone;
