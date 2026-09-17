import React, { useState } from 'react';
import { UserPlus, User as UserIcon, Mail, Key, Sparkles, Eye, EyeOff, Lock, RefreshCw, X, AlertTriangle } from 'lucide-react';
import apiClient from '../api/axiosClient';

const ProvisionUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'INVESTIGATOR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
    let generated = '';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      generated += charset[array[i] % charset.length];
    }
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const handleProvisionInvestigator = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const password = formData.password;

    if (!trimmedName || !trimmedEmail || !password) {
      setFormError('Please enter Full Name, Official Email, and Password.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters in length.');
      return;
    }

    setIsProvisioning(true);

    try {
      const response = await apiClient.post('/admin/users', {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        password,
        role: 'INVESTIGATOR',
      });

      const newUser = response.data.user;
      setFormData({ name: '', email: '', password: '', role: 'INVESTIGATOR' });
      setShowPassword(false);

      if (onSuccess) {
        onSuccess(newUser);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to provision investigator credentials.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Provision Investigator Account</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grant authorized investigator staff access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleProvisionInvestigator} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Senior Analyst Marcus Vance"
              className="cyber-input w-full text-xs"
              disabled={isProvisioning}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Agency Email <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., m.vance@cybertrace.local"
              className="cyber-input w-full text-xs"
              disabled={isProvisioning}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Temporary Password <span className="text-rose-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Strong</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="cyber-input w-full text-xs pr-10 font-mono"
                disabled={isProvisioning}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-900 dark:text-white">INVESTIGATOR</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              LEVEL-2 CLEARANCE
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cyber-btn-secondary text-xs !py-2 !px-4"
              disabled={isProvisioning}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProvisioning}
              className="cyber-btn-primary text-xs !py-2 !px-5"
            >
              {isProvisioning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Authorize Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProvisionUserModal;
