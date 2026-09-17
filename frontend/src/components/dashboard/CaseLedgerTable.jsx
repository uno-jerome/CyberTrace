import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Shield, SlidersHorizontal } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';

const CaseLedgerTable = ({
  filteredCases, totalCases, loading,
  statusFilter, priorityFilter, searchQuery,
  setStatusFilter, setPriorityFilter, setSearchQuery,
  onResetFilters,
}) => {
  const hasFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery.trim() !== '';

  return (
    <>
      {/* Filter and Search Bar */}
      <div className="cyber-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking ID (CASE-...), Title, Complainant, or Category..."
              className="w-full pl-10 pr-3.5 py-2 rounded-lg text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase font-semibold">Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs font-mono cursor-pointer bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors">
                <option value="ALL">All Statuses</option>
                <option value="PENDING">All Pending (Reported + Under Review)</option>
                <option value="Reported">Reported</option>
                <option value="Under Review">Under Review</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase font-semibold">Priority:</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg text-xs font-mono cursor-pointer bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors">
                <option value="ALL">All Priorities</option>
                <option value="HIGH_CRITICAL">High &amp; Critical</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            {hasFilters && (
              <button type="button" onClick={onResetFilters} className="text-xs font-mono text-blue-700 dark:text-blue-400 hover:underline px-1 font-semibold">Reset</button>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <div>Showing <span className="text-slate-900 dark:text-white font-bold">{filteredCases.length}</span> of <span className="text-slate-700 dark:text-slate-300 font-semibold">{totalCases}</span> recorded cases</div>
          {filteredCases.length !== totalCases && <div className="text-blue-700 dark:text-blue-400 font-semibold">Active filters applied</div>}
        </div>
      </div>

      {/* Case Ledger Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-600 dark:text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            <span className="font-mono">Streaming forensic cases from database...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-20 text-center text-slate-600 dark:text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <span className="font-mono text-slate-700 dark:text-slate-300">No cases match your active filters.</span>
            {hasFilters && <button type="button" onClick={onResetFilters} className="cyber-btn-secondary !py-1.5 !px-3 text-xs mt-1 font-mono">Reset All Filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-mono text-[11px] sticky top-0">
                  <th className="py-3.5 px-4 font-semibold">Tracking ID</th>
                  <th className="py-3.5 px-4 font-semibold">Incident Title</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Complainant</th>
                  <th className="py-3.5 px-4 font-semibold">Reported Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                {filteredCases.map((c) => (
                  <tr key={c._id || c.trackingId} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <Link to={`/cases/${c._id}`} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /><span>{c.trackingId}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      <Link to={`/cases/${c._id}`} className="hover:text-blue-700 dark:hover:text-white transition-colors" title={c.title}>{c.title}</Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700">{c.category}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap"><PriorityBadge priority={c.priority} /></td>
                    <td className="py-3.5 px-4 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">{c.complainantName || 'Anonymous'}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {c.incidentDate ? new Date(c.incidentDate).toISOString().slice(0, 10) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link to={`/cases/${c._id}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-400 dark:border-blue-900/60 text-xs font-mono transition-all shadow-sm font-semibold">
                        <Eye className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" /><span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CaseLedgerTable;
