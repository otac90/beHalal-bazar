import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, HelpCircle, Mail, FileText, 
  Lock, CheckCircle2, Send, ArrowRight, Heart, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  pageType: 'about' | 'rules' | 'safety' | 'faq' | 'contact' | 'impressum' | 'datenschutz' | 'agb';
}

export const StaticPages: React.FC<Props> = ({ pageType }) => {
  const { navigate, showToast, t } = useApp();
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast(t.contactFillFields || 'Bitte fülle alle Pflichtfelder aus.', 'warning');
      return;
    }
    setContactSent(true);
    showToast(t.contactSuccess || 'Nachricht gesendet', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-16 animate-fade-in">
      
      {/* ==================================================== */}
      {/* ÜBER UNS / ABOUT */}
      {/* ==================================================== */}
      {pageType === 'about' && (
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">
              {t.aboutCommunityTitle}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.aboutTitle}
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl mx-auto leading-relaxed">
              {t.aboutUsText1}
            </p>
          </div>

          <div className="space-y-12 border-t border-gray-200 dark:border-white/10 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  {t.aboutSafetyTitle}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.aboutSafetyDesc}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  {t.aboutSustainTitle}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.aboutUsText2}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* COMMUNITY REGELN */}
      {/* ==================================================== */}
      {pageType === 'rules' && (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.communityRules}
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed">
              {t.rulesIntro}
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.rulesNotAllowedTitle}</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited1}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited2}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited3}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited4}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited5}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited6}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited7}</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-red-600 font-bold mt-0.5">✕</span>
                  <span>{t.rulesProhibited8}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <CheckCircle2 className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430]" />
                <span>{t.rulesBehaviorTitle}</span>
              </h2>
              <div className="space-y-6 text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>• <strong className="text-[#171A17] dark:text-white font-bold">{t.rulesHonestTitle}</strong> {t.rulesHonestDesc}</p>
                <p>• <strong className="text-[#171A17] dark:text-white font-bold">{t.rule1Title}</strong> {t.rule1Desc}</p>
                <p>• <strong className="text-[#171A17] dark:text-white font-bold">{t.rule2Title}</strong> {t.rule2Desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SICHERHEITSTIPPS */}
      {/* ==================================================== */}
      {pageType === 'safety' && (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.safetyTips}
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed">
              {t.safetyIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <div className="space-y-4">
              <div className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">01</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                {t.safetyPersonalTitle}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.safetyPersonalDesc}
              </p>
            </div>
            <div className="space-y-4">
              <div className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">02</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                {t.safetyNoAdvanceTitle}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.safetyNoAdvanceDesc}
              </p>
            </div>
            <div className="space-y-4">
              <div className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">03</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                {t.safetyProtectDataTitle}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.safetyProtectDataDesc}
              </p>
            </div>
            <div className="space-y-4">
              <div className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">04</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                {t.safetyReportTitle}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.safetyTip1}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FAQ */}
      {/* ==================================================== */}
      {pageType === 'faq' && (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.faq}
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed">
              {t.faqIntro}
            </p>
          </div>

          <div className="space-y-8">
            {[
              { q: t.faqQ1, a: t.faqA1 },
              { q: t.faqQ2, a: t.faqA2 },
              { q: t.faqQ3, a: t.faqA3 },
              { q: t.faqQ4, a: t.faqA4 },
              { q: t.faqQ5, a: t.faqA5 },
            ].map((faq, i) => (
              <div
                key={i}
                className="pb-8 border-b border-gray-200 dark:border-white/10 space-y-4"
              >
                <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* KONTAKT */}
      {/* ==================================================== */}
      {pageType === 'contact' && (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.contactUs}
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed">
              {t.contactIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              {contactSent ? (
                <div className="border border-[#123D2A] dark:border-white/30 p-8 text-center space-y-4">
                  <CheckCircle2 className="w-8 h-8 text-[#123D2A] dark:text-[#F4C430] mx-auto" />
                  <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                    {t.contactSentTitle}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.contactSentDesc}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t.contactFormName}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t.contactFormEmail}
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t.contactFormMessage}
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full py-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
                  >
                    {t.contactFormSubmit}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                  {t.contactSupportTitle}
                </h3>
                <p className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  support@behalal-bazar.at
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                  {t.contactResponseTimeTitle}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t.contactResponseTime }} />
              </div>

              <div className="pt-8 border-t border-gray-200 dark:border-white/10 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                  {t.contactNoteTitle}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.contactWarning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* IMPRESSUM / DATENSCHUTZ / AGB */}
      {/* ==================================================== */}
      {(pageType === 'impressum' || pageType === 'datenschutz' || pageType === 'agb') && (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {pageType === 'impressum' && t.impressum}
              {pageType === 'datenschutz' && t.privacyPolicy}
              {pageType === 'agb' && t.termsOfService}
            </h1>
          </div>

          <div className="space-y-8 text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            
            {pageType === 'impressum' && (
              <>
                <p><strong className="text-[#171A17] dark:text-white font-bold">{t.impressumProvider}</strong></p>
                <p dangerouslySetInnerHTML={{ __html: t.impressumAddress }} />
                
                <p className="pt-4"><strong className="text-[#171A17] dark:text-white font-bold">{t.impressumObjectTitle}</strong><br /> {t.impressumObjectDesc}</p>
                
                <p className="pt-4"><strong className="text-[#171A17] dark:text-white font-bold">{t.impressumDisclaimerTitle}</strong><br /> {t.impressumDisclaimerDesc}</p>
              </>
            )}

            {pageType === 'datenschutz' && (
              <>
                <p>{t.privacyText1}</p>
                <div className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.privacyLocationTitle}</h3>
                    <p>{t.privacyLocationDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.privacyImageTitle}</h3>
                    <p>{t.privacyText2}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.privacyRightsTitle}</h3>
                    <p>{t.privacyText3}</p>
                  </div>
                </div>
              </>
            )}

            {pageType === 'agb' && (
              <>
                <p>{t.agbIntro}</p>
                <div className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.agbScopeTitle}</h3>
                    <p>{t.agbScopeDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.agbBrokerageTitle}</h3>
                    <p>{t.agbBrokerageDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">{t.agbProhibitedTitle}</h3>
                    <p>{t.agbProhibitedDesc}</p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
