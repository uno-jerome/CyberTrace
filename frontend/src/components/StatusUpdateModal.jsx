import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './common/StatusBadge';

const STATUS_OPTIONS = [
  { value: 'Reported', label: 'Reported — Initial intake logged' },
  { value: 'Under Review', label: 'Under Review — Assigned for assessment' },
  { value: 'Investigating', label: 'Investigating — Active forensic analysis' },
  { value: 'Resolved', label: 'Resolved — Findings documented' },
  { value: 'Closed', label: 'Closed — Case investigation concluded' },
];

const StatusUpdateModal = ({
  isOpen,
  onClose,
  currentStatus,
  onUpdateStatus,
  statusUpdating,
  successMessage,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Reported');

  useEffect(() => {
    if (currentStatus) setSelectedStatus(currentStatus);
  }, [currentStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStatus && selectedStatus !== currentStatus) {
      onUpdateStatus(selectedStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Update Case Status</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
          <StatusBadge status={currentStatus} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400">
              Select New Status:
            </label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedStatus === opt.value
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white font-medium'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="case-status"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cyber-btn-secondary text-xs !py-2 !px-4"
              disabled={statusUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusUpdating || selectedStatus === currentStatus}
              className="cyber-btn-primary text-xs !py-2 !px-4"
            >
              {statusUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Confirm Status Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
