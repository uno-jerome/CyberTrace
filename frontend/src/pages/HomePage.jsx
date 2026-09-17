import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, FilePlus, Search, ArrowRight, ShieldCheck, AlertOctagon,
  FileCheck2, Activity, CheckCircle2, Lock
} from 'lucide-react';
import apiClient from '../api/axiosClient';
import { useTranslation } from '../context/LanguageContext';
import FaqSection from '../components/home/FaqSection';

const ADVISORY_TIPS = [
  { Icon: FileCheck2, titleKey: 'home.advisory_tip1_title', descKey: 'home.advisory_tip1_desc' },
  { Icon: Lock, titleKey: 'home.advisory_tip2_title', descKey: 'home.advisory_tip2_desc' },
  { Icon: ShieldCheck, titleKey: 'home.advisory_tip3_title', descKey: 'home.advisory_tip3_desc' },
];

const ACTION_CARDS = [
  {
    to: '/report',
    Icon: FilePlus,
    titleKey: 'home.card1_title',
    descKey: 'home.card1_desc',
    ctaKey: 'home.card1_cta',
    border: 'border-slate-200 hover:border-indigo-600 dark:border-slate-800 dark:hover:border-indigo-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    heading: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    cta: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    to: '/track',
    Icon: Search,
    titleKey: 'home.card2_title',
    descKey: 'home.card2_desc',
    ctaKey: 'home.card2_cta',
    border: 'border-slate-200 hover:border-emerald-600 dark:border-slate-800 dark:hover:border-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    heading: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
];

const HomePage = () => {
  const { t } = useTranslation();
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', service: 'CyberTrace API' });

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await apiClient.get('/health');
        if (isMounted) {
          setSystemHealth({
            status: res.data?.status === 'ok' ? 'ok' : 'degraded',
            service: res.data?.service || 'CyberTrace API',
          });
        }
      } catch {
        if (isMounted) {
          setSystemHealth({ status: 'offline', service: 'CyberTrace API' });
        }
      }
    };
    checkApi();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-12 pb-16">
      <section className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t('home.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
          {t('home.hero_title')}
        </h1>
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-normal">
          {t('home.hero_sub')}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACTION_CARDS.map((card) => (
            <Link key={card.to} to={card.to} className={`cyber-card p-6 sm:p-8 flex flex-col justify-between border-2 ${card.border} transition-all group`}>
              <div>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} border flex items-center justify-center ${card.iconText} mb-5`}>
                  <card.Icon className="w-6 h-6" />
                </div>
                <h2 className={`text-xl font-bold text-slate-900 dark:text-white mb-2 ${card.heading} transition-colors`}>{t(card.titleKey)}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(card.descKey)}</p>
              </div>
              <div className={`mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-sm font-semibold ${card.cta}`}>
                <span>{t(card.ctaKey)}</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('home.advisory_title')}</h3>
              <p className="text-xs text-slate-300">{t('home.advisory_sub')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 text-xs leading-relaxed text-slate-300">
            {ADVISORY_TIPS.map((tip, idx) => (
              <div key={tip.titleKey} className="space-y-1.5 p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <tip.Icon className="w-4 h-4" />
                  <span>{idx + 1}. {t(tip.titleKey)}</span>
                </div>
                <p>{t(tip.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection t={t} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="cyber-card p-4 sm:p-5 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">CyberTrace Ingestion Gateway: </span>
                <span className={systemHealth.status === 'ok' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                  {systemHealth.status === 'ok' ? t('home.status_live') : t('home.status_offline')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SHA-256 Vault Ready
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" /> Immutable CoC Active
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
