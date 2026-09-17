import React from 'react';
import { Shield, CheckCircle2, MessageSquare, Send, Sliders } from 'lucide-react';

const CaseSidebar = ({
  incident, selectedStatus, setSelectedStatus, onStatusUpdate, statusUpdating, statusSuccessMessage,
  noteText, setNoteText, onAddNote, noteSubmitting, noteError, onOpenStatusModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Investigation Status</span>
          </h2>
          {onOpenStatusModal && (
            <button
              type="button"
              onClick={onOpenStatusModal}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono"
              title="Open full status update dialog"
            >
              <Sliders className="w-3 h-3" />
              <span>Dialog</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate-600 dark:text-slate-400">
            Current State: <span className="text-slate-900 dark:text-white font-bold">{incident.status}</span>
          </label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} disabled={statusUpdating} className="cyber-input w-full text-xs font-mono cursor-pointer">
            <option value="Reported">Reported</option>
            <option value="Under Review">Under Review</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button type="button" onClick={onStatusUpdate} disabled={statusUpdating || selectedStatus === incident.status} className="cyber-btn-secondary w-full text-xs font-mono !py-2">
            {statusUpdating ? (
              <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 dark:border-white/20 dark:border-t-white rounded-full animate-spin" /><span>Updating Status...</span></>
            ) : (<span>Update Case Status</span>)}
          </button>
          {statusSuccessMessage && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /><span>{statusSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /><span>Internal Notes ({incident.notes?.length || 0})</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">Restricted to Staff</span>
        </div>
        <form onSubmit={onAddNote} className="space-y-2">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Log investigative notes, observations, or hypotheses..." rows={3} className="cyber-input w-full text-xs font-sans resize-none" />
          {noteError && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-mono">{noteError}</p>}
          <button type="submit" disabled={noteSubmitting || !noteText.trim()} className="cyber-btn-primary w-full text-xs font-mono !py-2">
            {noteSubmitting ? <span>Saving Note...</span> : <><Send className="w-3.5 h-3.5" /><span>Add Internal Note</span></>}
          </button>
        </form>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mt-3">
          {(!incident.notes || incident.notes.length === 0) ? (
            <p className="text-xs text-slate-500 italic text-center py-4 font-mono">No investigator notes logged for this incident yet.</p>
          ) : (
            incident.notes.slice().reverse().map((n, i) => (
              <div key={n._id || i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{n.author}</span>
                  <span className="text-slate-500">{new Date(n.date).toLocaleString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{n.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseSidebar;
