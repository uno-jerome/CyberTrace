import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import MetricCards from '../components/dashboard/MetricCards';
import CaseLedgerTable from '../components/dashboard/CaseLedgerTable';

const Dashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/cases');
      const caseList = res.data.incidents || res.data.cases || res.data || [];
      setCases(Array.isArray(caseList) ? caseList : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve forensic cases from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const metrics = useMemo(() => ({
    total: cases.length,
    triagePending: cases.filter((c) => c.status === 'Reported' || c.status === 'Under Review' || c.status === 'Under Triage').length,
    highPriority: cases.filter((c) => c.priority === 'High' || c.priority === 'Critical').length,
    activeInvestigations: cases.filter((c) => c.status === 'Investigating').length,
    resolved: cases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
  }), [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING') {
          if (c.status !== 'Reported' && c.status !== 'Under Review' && c.status !== 'Under Triage') return false;
        } else if (statusFilter === 'Under Review') {
          if (c.status !== 'Under Review' && c.status !== 'Under Triage') return false;
        } else if (c.status !== statusFilter) return false;
      }
      if (priorityFilter !== 'ALL') {
        if (priorityFilter === 'HIGH_CRITICAL') {
          if (c.priority !== 'High' && c.priority !== 'Critical') return false;
        } else if (c.priority !== priorityFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!c.trackingId?.toLowerCase().includes(q) && !c.title?.toLowerCase().includes(q) &&
            !c.category?.toLowerCase().includes(q) && !c.complainantName?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [cases, statusFilter, priorityFilter, searchQuery]);

  const handleResetFilters = () => { setStatusFilter('ALL'); setPriorityFilter('ALL'); setSearchQuery(''); };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 tracking-wider uppercase">Case &amp; Incident Overview</span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Forensic Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Case Management &amp; Investigation Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Logged in as <span className="text-slate-900 dark:text-slate-200 font-semibold">{user?.name}</span> ({user?.role}) • Authorized for cryptographic forensic verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchCases} disabled={loading} className="cyber-btn-secondary !py-2 !px-3 text-xs" title="Refresh database records">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} /><span>Refresh Cases</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" /><span>{error}</span></div>
          <button type="button" onClick={fetchCases} className="text-xs font-mono text-rose-300 underline hover:text-white">Retry</button>
        </div>
      )}

      <MetricCards metrics={metrics} statusFilter={statusFilter} priorityFilter={priorityFilter} setStatusFilter={setStatusFilter} setPriorityFilter={setPriorityFilter} />

      <CaseLedgerTable
        filteredCases={filteredCases} totalCases={cases.length} loading={loading}
        statusFilter={statusFilter} priorityFilter={priorityFilter} searchQuery={searchQuery}
        setStatusFilter={setStatusFilter} setPriorityFilter={setPriorityFilter} setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default Dashboard;
