import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, FilePlus, Search, LayoutDashboard, ShieldAlert,
  LogOut, Lock, Menu, X, User as UserIcon, Sun, Moon, PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';

const NAV_ITEMS = [
  { to: '/report', labelKey: 'nav.file_report', Icon: FilePlus, iconColor: 'text-indigo-600 dark:text-indigo-400', auth: false },
  { to: '/track', labelKey: 'nav.track_case', Icon: Search, iconColor: 'text-emerald-600 dark:text-emerald-400', auth: false },
  { to: '/dashboard', labelKey: 'nav.dashboard', Icon: LayoutDashboard, iconColor: 'text-amber-500 dark:text-amber-400', auth: true },
  { to: '/admin', labelKey: 'nav.audit_users', Icon: ShieldAlert, iconColor: 'text-rose-500 dark:text-rose-400', auth: true, adminOnly: true },
];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 border border-transparent'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800'
    }`;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAuthenticated && isAdmin;
    if (item.auth) return isAuthenticated;
    return true;
  });

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="bg-slate-900 text-slate-200 dark:bg-black dark:text-slate-300 border-b border-slate-800 text-[11px] font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{t('nav.advisory_desk')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-indigo-400" />
              <span>{t('nav.hotline_label')} <strong>{t('nav.hotline_number')}</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">{t('nav.emergency_label')}: <strong className="text-rose-400">{t('nav.emergency_number')}</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                CyberTrace
              </span>
              <span className="hidden min-[420px]:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold whitespace-nowrap">
                Gov Vault
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-start overflow-x-auto no-scrollbar">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
              <span className="whitespace-nowrap">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0 ml-auto">
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'en' ? 'Lumipat sa Filipino' : 'Switch to English'}
            aria-label={t('nav.toggle_lang')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-mono font-bold text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className={language === 'en' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}>EN</span>
            <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
            <span className={language === 'fil' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}>FIL</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? t('nav.switch_theme_light') : t('nav.switch_theme_dark')}
            aria-label={isDark ? t('nav.switch_theme_light') : t('nav.switch_theme_dark')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shrink-0" title={`${user?.name || user?.email} (${user?.role})`}>
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight shrink-0">
                  <span className="font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">{user?.name || user?.email}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider whitespace-nowrap">{user?.role}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex cyber-btn-secondary !py-2 !px-3 text-xs text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 hover:border-rose-300 dark:hover:border-rose-500/40 hover:bg-rose-50 dark:hover:bg-rose-500/10 whitespace-nowrap items-center gap-1.5 shrink-0"
                title={t('nav.logout')}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap shrink-0"
              title="Investigator and Administrator Login"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">{t('nav.officer_login')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              <item.Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
              <span className="whitespace-nowrap">{t(item.labelKey)}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-2 text-xs text-slate-600 dark:text-slate-400">
                  Signed in as <strong className="text-slate-900 dark:text-slate-200">{user?.name}</strong> ({user?.role})
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full cyber-btn-secondary text-xs text-rose-600 dark:text-rose-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full cyber-btn-secondary text-xs flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="whitespace-nowrap">{t('nav.officer_login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
