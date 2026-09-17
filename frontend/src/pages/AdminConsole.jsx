import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, UserPlus, Database, CheckCircle2, AlertTriangle, User as UserIcon, X
} from 'lucide-react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProvisionUserModal from '../components/ProvisionUserModal';
import AuditLogTable from '../components/AuditLogTable';
import InvestigatorManagementTab from '../components/InvestigatorManagementTab';

const AdminConsole = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('investigators');
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [recentProvisioned, setRecentProvisioned] = useState([]);
  const [toast, setToast] = useState({ visible: false, type: 'success', title: '', message: '', user: null });

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [actionFilter, setActionFilter] = useState('');
  const [incidentIdFilter, setIncidentIdFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [incidentOptions, setIncidentOptions] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const fetchIncidentsForFilter = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const res = await apiClient.get('/cases');
      const list = res.data.incidents || res.data.cases || res.data || [];
      if (Array.isArray(list)) setIncidentOptions(list);
    } catch {
      setIncidentOptions([]);
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (pageToFetch = 1) => {
    setLoadingLogs(true);
    setLogsError('');
    try {
      const params = new URLSearchParams({ page: pageToFetch.toString(), limit: limit.toString() });
      if (actionFilter) params.set('action', actionFilter);
      if (incidentIdFilter) params.set('incidentId', incidentIdFilter);
      if (startDateFilter) params.set('startDate', new Date(startDateFilter).toISOString());
      if (endDateFilter) {
        const endObj = new Date(endDateFilter);
        endObj.setHours(23, 59, 59, 999);
        params.set('endDate', endObj.toISOString());
      }
      const res = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      setTotalLogs(res.data.totalLogs || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.page || pageToFetch);
    } catch (err) {
      setLogsError(err.response?.data?.message || 'Failed to query administrative chain of custody ledger.');
    } finally {
      setLoadingLogs(false);
    }
  }, [actionFilter, incidentIdFilter, startDateFilter, endDateFilter, limit]);

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs(1);
      fetchIncidentsForFilter();
    }
  }, [isAdmin, fetchAuditLogs, fetchIncidentsForFilter]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'ledger' && logs.length === 0) fetchAuditLogs(1);
  };

  const handleResetFilters = () => {
    setActionFilter(''); setIncidentIdFilter(''); setStartDateFilter('');
    setEndDateFilter(''); setSearchKeyword(''); setCurrentPage(1);
    setTimeout(() => fetchAuditLogs(1), 0);
  };

  const handleDatePreset = (preset) => {
    const now = new Date();
    const toDateStr = now.toISOString().slice(0, 10);
    const past = new Date();
    if (preset === 'today') {
      setStartDateFilter(toDateStr); setEndDateFilter(toDateStr);
    } else if (preset === '7days') {
      past.setDate(now.getDate() - 7);
      setStartDateFilter(past.toISOString().slice(0, 10)); setEndDateFilter(toDateStr);
    } else if (preset === '30days') {
      past.setDate(now.getDate() - 30);
      setStartDateFilter(past.toISOString().slice(0, 10)); setEndDateFilter(toDateStr);
    } else {
      setStartDateFilter(''); setEndDateFilter('');
    }
    setCurrentPage(1);
  };

  const handleUserProvisioned = (newUser) => {
    setToast({
      visible: true, type: 'success', title: 'Investigator Account Provisioned',
      message: `Credentials granted for ${newUser.name} (${newUser.email}).`, user: newUser,
    });
    setRecentProvisioned((prev) => [
      { id: newUser.id || newUser._id || Date.now().toString(), name: newUser.name, email: newUser.email, role: newUser.role, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="cyber-card p-10 border-rose-500/40 bg-rose-950/10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clearance Insufficient: Access Restricted</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            The Administrative Command Console is restricted exclusively to authenticated users with the <strong className="text-rose-500 dark:text-rose-400 font-mono">ADMIN</strong> clearance level.
          </p>
          <div className="pt-2">
            <a href="/dashboard" className="cyber-btn-secondary inline-flex text-xs">Return to Case Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'investigators', label: 'Investigator Management', Icon: UserPlus, activeCls: 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-500' },
    { id: 'ledger', label: 'Global Chain of Custody Ledger', Icon: Database, activeCls: 'text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-500', count: totalLogs },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {toast.visible && (
        <div role="alert" className={`fixed top-20 right-6 z-50 max-w-md w-full p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' : 'bg-rose-950/90 border-rose-500/40 text-rose-100'}`}>
          <div className="flex items-start gap-3">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm tracking-tight text-white mb-0.5">{toast.title}</h4>
              <p className="text-slate-300">{toast.message}</p>
            </div>
            <button type="button" onClick={() => setToast((prev) => ({ ...prev, visible: false }))} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" /> ADMINISTRATIVE COMMAND CONSOLE
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded">
              ● APPEND-ONLY LEDGER ENFORCED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Security Control &amp; Global Audit Ledger</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Provision forensic investigator staff credentials and inspect the immutable cross-case chain of custody event log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-sm">
            <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400">Active Operator:</span>
            <span className="text-slate-900 dark:text-white font-medium">{user?.email}</span>
            <span className="text-[10px] font-mono bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 px-1.5 py-0.5 rounded">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabSwitch(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? `bg-white dark:bg-slate-900 ${tab.activeCls} shadow-sm`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'investigators' && (
        <InvestigatorManagementTab recentProvisioned={recentProvisioned} onOpenProvisionModal={() => setIsProvisionModalOpen(true)} />
      )}

      {activeTab === 'ledger' && (
        <AuditLogTable
          logs={logs} loadingLogs={loadingLogs} logsError={logsError}
          totalLogs={totalLogs} totalPages={totalPages} currentPage={currentPage}
          limit={limit} setLimit={setLimit}
          actionFilter={actionFilter} setActionFilter={setActionFilter}
          incidentIdFilter={incidentIdFilter} setIncidentIdFilter={setIncidentIdFilter}
          startDateFilter={startDateFilter} setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter} setEndDateFilter={setEndDateFilter}
          searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword}
          incidentOptions={incidentOptions} loadingIncidents={loadingIncidents}
          onRefresh={fetchAuditLogs} onResetFilters={handleResetFilters}
          onPageChange={fetchAuditLogs} onDatePreset={handleDatePreset}
        />
      )}

      <ProvisionUserModal isOpen={isProvisionModalOpen} onClose={() => setIsProvisionModalOpen(false)} onSuccess={handleUserProvisioned} />
    </div>
  );
};

export default AdminConsole;
