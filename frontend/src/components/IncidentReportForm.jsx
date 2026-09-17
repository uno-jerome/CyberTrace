import React from 'react';
import { Info, UserX } from 'lucide-react';

const CATEGORIES = [
  'Phishing',
  'Financial Fraud',
  'Extortion',
  'Identity Theft',
  'Unauthorized Access',
];

const PLATFORMS = [
  'FB/Messenger',
  'Telegram/WhatsApp',
  'GCash/E-Wallet',
  'Banking',
  'Phishing Email',
  'SMS/Smishing',
  'Other',
];

const CURRENCIES = ['PHP (₱)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'Other'];

const OPTION_CLASS = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100';
const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2';
const FIELD_LABEL_CLASS = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5';

const IncidentReportForm = ({ formData, onChange, disabled, t }) => {
  return (
    <>
      {/* Incident Title */}
      <div>
        <label htmlFor="title" className={LABEL_CLASS}>
          {t('report.incident_title_label')} <span className="text-rose-500">*</span>
        </label>
        <input id="title" name="title" type="text" required value={formData.title} onChange={onChange} placeholder={t('report.incident_title_placeholder')} className="cyber-input w-full text-sm" disabled={disabled} />
      </div>

      {/* Category & Date Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className={LABEL_CLASS}>
            {t('report.category_label')} <span className="text-rose-500">*</span>
          </label>
          <select id="category" name="category" required value={formData.category} onChange={onChange} className="cyber-input w-full text-sm cursor-pointer" disabled={disabled}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className={OPTION_CLASS}>{t(`categories.${cat}`, cat)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="incidentDate" className={LABEL_CLASS}>
            {t('report.incident_date_label')} <span className="text-rose-500">*</span>
          </label>
          <input id="incidentDate" name="incidentDate" type="date" required max={new Date().toISOString().split('T')[0]} value={formData.incidentDate} onChange={onChange} className="cyber-input w-full text-sm font-mono" disabled={disabled} />
        </div>
      </div>

      {/* Structured Forensic Fields: Platform, Suspect Identifiers, Financial Loss */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="platform" className={FIELD_LABEL_CLASS}>
              {t('report.platform_label')} <span className="text-rose-500">*</span>
            </label>
            <select id="platform" name="platform" required value={formData.platform} onChange={onChange} className="cyber-input w-full text-sm cursor-pointer" disabled={disabled}>
              {PLATFORMS.map((plat) => (
                <option key={plat} value={plat} className={OPTION_CLASS}>{t(`platforms.${plat}`, plat)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="financialLoss" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t('report.loss_label')}</span>
              <span className="text-slate-500 text-[10px] font-normal">Optional</span>
            </label>
            <div className="flex gap-2">
              <select name="currency" value={formData.currency} onChange={onChange} className="cyber-input text-xs w-28 shrink-0 cursor-pointer" disabled={disabled}>
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr} className={OPTION_CLASS}>{curr}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <input id="financialLoss" name="financialLoss" type="number" min="0" step="0.01" value={formData.financialLoss} onChange={onChange} placeholder={t('report.loss_placeholder')} className="cyber-input w-full text-sm font-mono" disabled={disabled} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="suspectIdentifiers" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('report.suspect_label')}</span>
            </span>
            <span className="text-slate-500 text-[10px] font-normal">Optional</span>
          </label>
          <input id="suspectIdentifiers" name="suspectIdentifiers" type="text" value={formData.suspectIdentifiers} onChange={onChange} placeholder={t('report.suspect_placeholder')} className="cyber-input w-full text-sm font-mono" disabled={disabled} />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t('report.suspect_hint')}</p>
        </div>
      </div>

      {/* Contextual Guided Helper Text in Narrative box */}
      <div>
        <label htmlFor="description" className={LABEL_CLASS}>
          {t('report.desc_label')} <span className="text-rose-500">*</span>
        </label>
        <textarea id="description" name="description" required rows={5} value={formData.description} onChange={onChange} placeholder={t('report.desc_placeholder')} className="cyber-input w-full text-sm leading-relaxed" disabled={disabled} />
      </div>

      {/* Optional Complainant Information */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{t('report.section_complainant')}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t('report.anonymous_notice')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="complainantName" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t('report.name_label')}</label>
            <input id="complainantName" name="complainantName" type="text" value={formData.complainantName} onChange={onChange} placeholder={t('report.name_placeholder')} className="cyber-input w-full text-sm" disabled={disabled} />
          </div>
          <div>
            <label htmlFor="complainantContact" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t('report.contact_label')}</label>
            <input id="complainantContact" name="complainantContact" type="text" value={formData.complainantContact} onChange={onChange} placeholder={t('report.contact_placeholder')} className="cyber-input w-full text-sm" disabled={disabled} />
          </div>
        </div>
      </div>
    </>
  );
};

export { CATEGORIES, PLATFORMS, CURRENCIES };
export default IncidentReportForm;
