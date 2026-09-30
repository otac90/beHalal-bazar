import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, HelpCircle, Mail, FileText, 
  Lock, CheckCircle2, Send, ArrowRight, Heart, Sparkles, ChevronDown, BookOpen, MapPin, Users, Recycle, MessageCircle, Flag, Eye, CreditCard, UserRound, Lightbulb, Search, PhoneCall, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIVACY_POLICY_SECTIONS } from '../data/privacyPolicy';
import { TERMS_OF_SERVICE_SECTIONS } from '../data/termsOfService';
import { IMPRINT_SECTIONS } from '../data/imprint';

interface Props {
  pageType: 'about' | 'rules' | 'safety' | 'faq' | 'contact' | 'impressum' | 'datenschutz' | 'agb';
}

export const StaticPages: React.FC<Props> = ({ pageType }) => {
  const { navigate, showToast, t, language } = useApp();
  const [openPrivacySections, setOpenPrivacySections] = useState<number[]>([1, 2, 3]);
  const [openTermsSections, setOpenTermsSections] = useState<number[]>([1, 2, 3]);
  const [openImprintSections, setOpenImprintSections] = useState<number[]>([1, 2, 3]);
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([0]);
  
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
    <div className="mx-auto max-w-7xl px-4 py-16 space-y-16 animate-fade-in">
      
      {/* ==================================================== */}
      {/* ÜBER UNS / ABOUT */}
      {/* ==================================================== */}
      {pageType === 'about' && (
        <div className="max-w-6xl space-y-16">
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

          <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-12 dark:border-white/10 sm:grid-cols-2">
            {[
              { icon: Users, title: t.aboutSafetyTitle, text: t.aboutSafetyDesc },
              { icon: Recycle, title: t.aboutSustainTitle, text: t.aboutUsText2 },
              { icon: MessageCircle, title: language === 'de' ? 'Direkte Kommunikation' : 'Direct communication', text: language === 'de' ? 'Schreibe sicher über den integrierten Chat und kläre Details direkt mit anderen Nutzern.' : 'Use the integrated chat to communicate safely and clarify details directly with other users.' },
              { icon: Heart, title: language === 'de' ? 'Für alle Menschen' : 'For everyone', text: language === 'de' ? 'Online Bazar verbindet Menschen mit einem fairen, respektvollen und zugänglichen Marktplatz.' : 'Online Bazar connects people through a fair, respectful, and accessible marketplace.' },
            ].map(({ icon: Icon, title, text }) => <article key={title} className="border border-[#123D2A]/15 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-5 flex h-11 w-11 items-center justify-center bg-[#FAF2CC] text-[#123D2A] dark:bg-[#F4C430] dark:text-[#123D2A]"><Icon className="h-5 w-5" /></div><h3 className="font-serif text-2xl font-bold text-[#171A17] dark:text-white">{title}</h3><p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{text}</p></article>)}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* COMMUNITY REGELN */}
      {/* ==================================================== */}
      {pageType === 'rules' && (
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.communityRules}
            </h1>
            <p className="mx-auto max-w-xl font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
              {t.rulesIntro}
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-8 border border-[#123D2A]/15 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]">
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

            <div className="space-y-8 border border-[#123D2A]/15 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]">
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
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.safetyTips}
            </h1>
            <p className="mx-auto max-w-xl font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
              {t.safetyIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: MapPin, title: t.safetyPersonalTitle, text: t.safetyPersonalDesc },
              { icon: CreditCard, title: t.safetyNoAdvanceTitle, text: t.safetyNoAdvanceDesc },
              { icon: Lock, title: t.safetyProtectDataTitle, text: t.safetyProtectDataDesc },
              { icon: Flag, title: t.safetyReportTitle, text: t.safetyTip1 },
              { icon: Eye, title: language === 'de' ? 'Angebote genau prüfen' : 'Check listings carefully', text: language === 'de' ? 'Lies Beschreibung, Preis und Zustandsangaben aufmerksam. Frage bei Unklarheiten nach.' : 'Read the description, price, and condition carefully. Ask questions if anything is unclear.' },
              { icon: PhoneCall, title: language === 'de' ? 'Bei Problemen handeln' : 'Act when something goes wrong', text: language === 'de' ? 'Blockiere auffällige Nutzer, melde Inhalte und kontaktiere den Support bei dringenden Anliegen.' : 'Block suspicious users, report content, and contact support for urgent concerns.' },
            ].map(({ icon: Icon, title, text }, index) => <article key={title} className="border border-[#123D2A]/15 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center bg-[#FAF2CC] text-[#123D2A] dark:bg-[#F4C430] dark:text-[#123D2A]"><Icon className="h-5 w-5" /></div><span className="font-serif text-3xl font-bold text-[#F4C430]">{String(index + 1).padStart(2, '0')}</span></div><h3 className="mt-6 font-serif text-xl font-bold text-[#171A17] dark:text-white">{title}</h3><p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{text}</p></article>)}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FAQ */}
      {/* ==================================================== */}
      {pageType === 'faq' && (
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.faq}
            </h1>
            <p className="mx-auto max-w-xl font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
              {t.faqIntro}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: t.faqQ1, a: t.faqA1 },
              { q: t.faqQ2, a: t.faqA2 },
              { q: t.faqQ3, a: t.faqA3 },
              { q: t.faqQ4, a: t.faqA4 },
              { q: t.faqQ5, a: t.faqA5 },
            ].map((faq, i) => (
              <div key={i} className={`border ${openFaqItems.includes(i) ? 'border-[#F4C430]/70' : 'border-[#123D2A]/15'} bg-white/60 dark:border-white/10 dark:bg-white/[0.03]`}>
                <button type="button" aria-expanded={openFaqItems.includes(i)} onClick={() => setOpenFaqItems((current) => current.includes(i) ? current.filter((item) => item !== i) : [...current, i])} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"><span className="flex items-center gap-3"><HelpCircle className="h-5 w-5 shrink-0 text-[#F4C430]" /><span className="font-serif text-xl font-bold text-[#171A17] dark:text-white">{faq.q}</span></span><ChevronDown className={`h-5 w-5 shrink-0 text-[#123D2A] transition-transform dark:text-[#F4C430] ${openFaqItems.includes(i) ? 'rotate-180' : ''}`} /></button>
                {openFaqItems.includes(i) && <div className="border-t border-[#123D2A]/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-gray-600 dark:border-white/10 dark:text-gray-400">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* KONTAKT */}
      {/* ==================================================== */}
      {pageType === 'contact' && (
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {t.contactUs}
            </h1>
            <p className="mx-auto max-w-xl font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
              {t.contactIntro}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6">
            <div className="order-last w-full">
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
                <form onSubmit={handleContactSubmit} className="space-y-6 border border-[#123D2A]/15 bg-white/60 p-5 sm:p-7 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3 border-b border-[#F4C430]/60 pb-5"><Mail className="h-5 w-5 text-[#123D2A] dark:text-[#F4C430]" /><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">{language === 'de' ? 'Schreib uns' : 'Write to us'}</p><p className="mt-1 text-xs text-gray-500">{language === 'de' ? 'Wir melden uns so bald wie möglich.' : 'We will get back to you as soon as possible.'}</p></div></div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t.contactFormName}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-[#123D2A]/30 bg-white/80 px-3 py-3 text-sm font-bold text-[#171A17] outline-none transition-colors focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 dark:border-white/20 dark:bg-[#111511] dark:text-white"
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
                      className="w-full border border-[#123D2A]/30 bg-white/80 px-3 py-3 text-sm font-bold text-[#171A17] outline-none transition-colors focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 dark:border-white/20 dark:bg-[#111511] dark:text-white"
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
                      className="w-full resize-none border border-[#123D2A]/30 bg-white/80 px-3 py-3 text-sm font-bold text-[#171A17] outline-none transition-colors focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/30 dark:border-white/20 dark:bg-[#111511] dark:text-white"
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

            <div className="order-first grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-[#123D2A]/15 bg-[#FAF2CC]/70 p-6 dark:border-white/10 dark:bg-[#191E19]"><div className="mb-4 flex h-10 w-10 items-center justify-center bg-[#F4C430] text-[#123D2A]"><Clock className="h-5 w-5" /></div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                  {language === 'de' ? 'Sorgfältige Bearbeitung' : 'Careful review'}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">{language === 'de' ? 'Dein Anliegen wird so rasch wie möglich geprüft und an die zuständige Stelle weitergeleitet. Je nach Anfrage kann die Bearbeitung etwas Zeit in Anspruch nehmen.' : 'Your request will be reviewed as quickly as possible and forwarded to the appropriate team. Depending on the request, processing may take some time.'}</p>
              </div>

              <div className="border border-[#123D2A]/15 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]"><div className="mb-4 flex h-10 w-10 items-center justify-center bg-[#CBD9C6] text-[#123D2A]"><ShieldCheck className="h-5 w-5" /></div>
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
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
              {pageType === 'impressum' && t.impressum}
              {pageType === 'datenschutz' && t.privacyPolicy}
              {pageType === 'agb' && t.termsOfService}
            </h1>
          </div>

          <div className="mx-auto max-w-5xl space-y-8 text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
            
            {pageType === 'impressum' && (
              <div className="mx-auto max-w-4xl space-y-8">
                <div className="border border-[#F4C430]/60 bg-[#FAF2CC]/70 p-6 dark:bg-[#191E19]"><div className="flex items-start gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-[#123D2A] dark:text-[#F4C430]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{language === 'de' ? 'Impressum auf einen Blick' : 'Imprint at a glance'}</p><p className="mt-3 text-sm leading-relaxed text-[#171A17] dark:text-gray-200">{language === 'de' ? 'Angaben zum Betreiber, zur Erreichbarkeit, zu rechtlichen Hinweisen und zur Verantwortlichkeit für diese Plattform.' : 'Information about the operator, contact details, legal notices, and responsibility for this platform.'}</p></div></div></div>
                <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setOpenImprintSections(IMPRINT_SECTIONS.map((section) => section.number))} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle öffnen' : 'Open all'}</button><button type="button" onClick={() => setOpenImprintSections([])} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle schließen' : 'Close all'}</button></div>
                <div className="space-y-3">{IMPRINT_SECTIONS.map((section) => { const isOpen = openImprintSections.includes(section.number); return <div key={section.number} className={`border ${isOpen ? 'border-[#F4C430]/70' : 'border-[#123D2A]/15'} bg-white/60 dark:bg-white/[0.03]`}><button type="button" aria-expanded={isOpen} onClick={() => setOpenImprintSections((current) => isOpen ? current.filter((number) => number !== section.number) : [...current, section.number])} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"><span className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#123D2A] text-xs font-bold text-[#F4C430]">{section.number}</span><span className="font-serif text-lg font-bold text-[#171A17] dark:text-white">{section.title[language]}</span></span><ChevronDown className={`h-5 w-5 shrink-0 text-[#123D2A] transition-transform dark:text-[#F4C430] ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="border-t border-[#123D2A]/10 px-5 pb-5 pt-4 dark:border-white/10"><ul className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.body[language].map((paragraph) => <li key={paragraph} className="flex gap-3"><FileText className="mt-1 h-4 w-4 shrink-0 text-[#F4C430]" /><span>{paragraph}</span></li>)}</ul></div>}</div>; })}</div>
              </div>
            )}

            {pageType === 'datenschutz' && (
              <div className="mx-auto max-w-4xl space-y-8">
                <div className="border border-[#F4C430]/60 bg-[#FAF2CC]/70 p-6 dark:bg-[#191E19]">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-[#123D2A] dark:text-[#F4C430]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{language === 'de' ? 'Datenschutz auf einen Blick' : 'Privacy at a glance'}</p>
                      <p className="mt-3 text-sm leading-relaxed text-[#171A17] dark:text-gray-200">{language === 'de' ? 'Diese Erklärung beschreibt transparent, welche Daten der Online Bazar verarbeitet und welche Rechte du hast.' : 'This notice explains transparently which data Online Bazar processes and which rights you have.'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setOpenPrivacySections(PRIVACY_POLICY_SECTIONS.map((section) => section.number))} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle öffnen' : 'Open all'}</button>
                  <button type="button" onClick={() => setOpenPrivacySections([])} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle schließen' : 'Close all'}</button>
                </div>
                <div className="space-y-3">
                  {PRIVACY_POLICY_SECTIONS.map((section) => {
                    const isOpen = openPrivacySections.includes(section.number);
                    const title = section.title[language];
                    return (
                      <div key={section.number} className={`border ${isOpen ? 'border-[#F4C430]/70' : 'border-[#123D2A]/15'} bg-white/60 dark:bg-white/[0.03]`}>
                        <button type="button" aria-expanded={isOpen} onClick={() => setOpenPrivacySections((current) => isOpen ? current.filter((number) => number !== section.number) : [...current, section.number])} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                          <span className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#123D2A] text-xs font-bold text-[#F4C430]">{section.number}</span><span className="font-serif text-lg font-bold text-[#171A17] dark:text-white">{title}</span></span>
                          <ChevronDown className={`h-5 w-5 shrink-0 text-[#123D2A] transition-transform dark:text-[#F4C430] ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && <div className="border-t border-[#123D2A]/10 px-5 pb-5 pt-4 dark:border-white/10"><ul className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.body[language].map((paragraph) => <li key={paragraph} className="flex gap-3"><BookOpen className="mt-1 h-4 w-4 shrink-0 text-[#F4C430]" /><span>{paragraph}</span></li>)}</ul></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pageType === 'agb' && (
              <div className="mx-auto max-w-4xl space-y-8">
                <div className="border border-[#F4C430]/60 bg-[#FAF2CC]/70 p-6 dark:bg-[#191E19]">
                  <div className="flex items-start gap-4"><FileText className="mt-1 h-6 w-6 shrink-0 text-[#123D2A] dark:text-[#F4C430]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{language === 'de' ? 'Rechtliche Informationen' : 'Legal information'}</p><p className="mt-3 text-sm leading-relaxed text-[#171A17] dark:text-gray-200">{language === 'de' ? 'Diese AGB regeln die Nutzung des Online Bazar und die Beziehung zwischen Plattform, Anbietern und Nutzern.' : 'These Terms govern use of Online Bazar and the relationship between the platform, providers, and users.'}</p></div></div>
                </div>
                <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setOpenTermsSections(TERMS_OF_SERVICE_SECTIONS.map((section) => section.number))} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle öffnen' : 'Open all'}</button><button type="button" onClick={() => setOpenTermsSections([])} className="border border-[#123D2A]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:border-[#F4C430] dark:border-white/20 dark:text-white">{language === 'de' ? 'Alle schließen' : 'Close all'}</button></div>
                <div className="space-y-3">{TERMS_OF_SERVICE_SECTIONS.map((section) => { const isOpen = openTermsSections.includes(section.number); return <div key={section.number} className={`border ${isOpen ? 'border-[#F4C430]/70' : 'border-[#123D2A]/15'} bg-white/60 dark:bg-white/[0.03]`}><button type="button" aria-expanded={isOpen} onClick={() => setOpenTermsSections((current) => isOpen ? current.filter((number) => number !== section.number) : [...current, section.number])} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"><span className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#123D2A] text-xs font-bold text-[#F4C430]">{section.number}</span><span className="font-serif text-lg font-bold text-[#171A17] dark:text-white">{section.title[language]}</span></span><ChevronDown className={`h-5 w-5 shrink-0 text-[#123D2A] transition-transform dark:text-[#F4C430] ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="border-t border-[#123D2A]/10 px-5 pb-5 pt-4 dark:border-white/10"><ul className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.body[language].map((paragraph) => <li key={paragraph} className="flex gap-3"><FileText className="mt-1 h-4 w-4 shrink-0 text-[#F4C430]" /><span>{paragraph}</span></li>)}</ul></div>}</div>; })}</div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
