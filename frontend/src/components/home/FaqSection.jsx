import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQ_IDS = ['faq-1', 'faq-2', 'faq-3', 'faq-4'];

const FaqSection = ({ t }) => {
  const [openFaq, setOpenFaq] = useState('faq-1');

  const toggleFaq = (id) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <span className="text-xs uppercase font-mono tracking-widest font-semibold text-indigo-600 dark:text-indigo-400">
          CyberTrace FAQ
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
          {t('home.faq_title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('home.faq_sub')}
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_IDS.map((id) => {
          const num = id.split('-')[1];
          const isOpen = openFaq === id;
          return (
            <div key={id} className="cyber-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleFaq(id)}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{t(`home.faq_q${num}`)}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(`home.faq_a${num}`)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
