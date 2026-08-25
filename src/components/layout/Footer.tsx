import React from 'react';
import { ShieldCheck, Heart, Globe, Lock, ArrowUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate, language, setLanguage, t } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#123D2A] dark:bg-[#111511] text-[#F5F1E8]/70 pt-16 pb-24 md:pb-16 border-t border-[#171A17] dark:border-[#F5F1E8]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-[#F5F1E8]/10">
          
          {/* BRAND COL */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#123D2A] text-[#F4C430] font-bold text-xl flex items-center justify-center rounded pt-0.5">
                حلال
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl text-[#F5F1E8] uppercase">ONLINE BAZAR</span>
              </div>
            </div>
            <p className="text-sm font-medium text-[#F5F1E8]/60 leading-relaxed">
              {t.footerAboutText}
            </p>
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#F5F1E8]/20 text-[9px] font-bold uppercase tracking-widest text-[#F5F1E8]">
              <Lock className="w-3.5 h-3.5" />
              <span>{t.closedCommunityBadge}</span>
            </div>
          </div>

          {/* COMMUNITY & WISSEN */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8] border-b border-[#F5F1E8]/10 pb-4">
              {t.communityAndInfo}
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <button
                  id="btn-footer-about"
                  onClick={() => navigate('about')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.aboutUs}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-rules"
                  onClick={() => navigate('rules')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.communityRules}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-safety"
                  onClick={() => navigate('safety')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.safetyTips}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-faq"
                  onClick={() => navigate('faq')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.faq}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-contact"
                  onClick={() => navigate('contact')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.contactUs}
                </button>
              </li>
            </ul>
          </div>

          {/* RECHTLICHES (AUSTRIA / EU) */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8] border-b border-[#F5F1E8]/10 pb-4">
              Rechtliches
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <button
                  id="btn-footer-impressum"
                  onClick={() => navigate('impressum')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.impressum}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-datenschutz"
                  onClick={() => navigate('datenschutz')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-agb"
                  onClick={() => navigate('agb')}
                  className="hover:text-[#F5F1E8] transition-colors"
                >
                  {t.termsOfService}
                </button>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8] border-b border-[#F5F1E8]/10 pb-4">
              Newsletter
            </h4>
            <p className="text-sm font-medium text-[#F5F1E8]/60 leading-relaxed">
              {t.newsletterDesc}
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t.emailPlaceholder} 
                className="w-full bg-transparent border border-[#F5F1E8]/20 px-4 py-3 text-sm text-[#F5F1E8] placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
              />
              <button 
                type="submit" 
                className="bg-[#F4C430] text-[#123D2A] px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"
              >
                Go
              </button>
            </form>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8]/60 pt-2">
              {t.noSpam}
            </p>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-widest text-[#F5F1E8]/60">
          <div>
            © {new Date().getFullYear()} ONLINE BAZAR. {t.allRightsReserved}
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#F5F1E8]">
              <Heart className="w-3 h-3 text-[#F4C430]" />
              <span>{t.communityPowered}</span>
            </span>

            <button
              onClick={scrollToTop}
              className="p-3 border border-[#F5F1E8]/20 hover:bg-white/10 hover:border-white/40 text-[#F5F1E8] transition-colors"
              title="Nach oben scrollen"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
