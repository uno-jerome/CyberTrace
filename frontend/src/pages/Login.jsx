import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock, Mail, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
  { label: 'Administrator', badge: 'ADMIN', badgeCls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', email: 'admin@cybertrace.local', pass: 'AdminPass123!' },
  { label: 'Investigator 1', badge: 'STAFF', badgeCls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', email: 'analyst1@cybertrace.local', pass: 'AnalystPass123!' },
];

const Login = () => {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const redirectTarget = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setValidationError('Please enter both your staff email and password.');
      return;
    }
    const result = await login(trimmedEmail, password);
    if (result.success) {
      navigate(redirectTarget, { replace: true });
    }
  };

  const fillPreset = (seedEmail, seedPassword) => {
    setEmail(seedEmail);
    setPassword(seedPassword);
    setValidationError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>Authorized Staff Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Officer &amp; Staff Login
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Official staff portal to verify evidence checksums and manage case investigations.
          </p>
        </div>

        <div className="cyber-card p-6 sm:p-8 relative">
          {(validationError || authError) && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{validationError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst1@cybertrace.local"
                  autoComplete="email"
                  className="cyber-input w-full pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="cyber-input w-full pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn-primary w-full py-3 text-sm font-semibold tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Quick Login Presets (Demo)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Click to Auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => fillPreset(p.email, p.pass)}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    <span>{p.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${p.badgeCls}`}>
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {p.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            Citizen reporting or tracking a case without an account?
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link to="/report" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Submit New Incident
            </Link>
            <span className="text-slate-400 dark:text-slate-700">•</span>
            <Link to="/track" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Track Public Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
