import React, { useState } from 'react';
import { 
  Lock, Mail, ShieldCheck, UserCheck, ArrowRight, 
  Sparkles, CheckCircle2, UserIcon, KeyRound, AlertTriangle, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';

interface Props {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<Props> = ({ initialMode = 'login' }) => {
  const { setUser, navigate, showToast, t } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('amina.k@example.at');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('1100');
  const [regCity, setRegCity] = useState('Wien');
  const [regAcceptRules, setRegAcceptRules] = useState(false);
  const [hasReadRules, setHasReadRules] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const sampleUsers = storage.getUsers();

  const handleQuickLogin = (userId: string) => {
    const target = sampleUsers.find((u) => u.id === userId);
    if (target) {
      storage.setCurrentUser(target);
      setUser(target);
      showToast(`Willkommen zurück, ${target.firstName}!`, 'success');
      navigate('home');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sampleUsers.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      storage.setCurrentUser(found);
      setUser(found);
      showToast(`Erfolgreich angemeldet als ${found.firstName}`, 'success');
      navigate('home');
    } else {
      showToast('E-Mail oder Passwort nicht erkannt. Wähle ein Test-Profil.', 'error');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regUsername || !regPassword) {
      showToast('Bitte fülle alle Pflichtfelder aus.', 'warning');
      return;
    }
    if (!hasReadRules) {
      showToast('Bitte lies die Community-Regeln vor der Registrierung.', 'warning');
      setShowRulesModal(true);
      return;
    }
    if (!regAcceptRules) {
      showToast('Bitte akzeptiere die Community-Regeln.', 'warning');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username: regUsername.toLowerCase().trim(),
      email: regEmail.trim(),
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      postalCode: regPostalCode.trim(),
      city: regCity.trim(),
      country: 'Österreich',
      language: 'de' as const,
      role: 'MEMBER' as const,
      status: 'ACTIVE' as const,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160`,
      ratingAverage: 5.0,
      ratingCount: 0,
      responseRate: 'Neu in der Community',
      activeListingsCount: 0,
      blockedUserIds: [],
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = storage.addUser(newUser);
    storage.setCurrentUser(saved);
    setUser(saved);
    showToast('Konto erfolgreich erstellt und verifiziert! Willkommen bei ONLINE BAZAR.', 'success');
    navigate('home');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-16 pb-32 md:py-16 space-y-16">
      
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#123D2A] text-[#F5F1E8] dark:bg-[#123D2A] dark:text-[#F5F1E8] text-[10px] uppercase tracking-widest font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Geschlossene vertrauensvolle Community</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#171A17] dark:text-white">
          {mode === 'login' ? 'Willkommen zurück' : 'Mitglied werden'}
        </h1>
        <p className="font-sans text-xs uppercase tracking-widest text-gray-500">
          Kaufen, Verkaufen und Verschenken unter verifizierten Mitgliedern.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
        
        {/* LEFT / MAIN AUTH FORM */}
        <div className="space-y-12">
          
          {/* TAB SWITCH */}
          <div className="flex border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                mode === 'login'
                  ? 'border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'
                  : 'border-transparent text-gray-400 hover:text-[#171A17] dark:hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                mode === 'register'
                  ? 'border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'
                  : 'border-transparent text-gray-400 hover:text-[#171A17] dark:hover:text-white'
              }`}
            >
              Registrieren
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"
              >
                Anmelden
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Benutzername (@username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="amina_wien"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors placeholder:font-sans placeholder:font-normal placeholder:uppercase placeholder:text-[10px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPostalCode}
                    onChange={(e) => setRegPostalCode(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Stadt *
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Passwort *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-[#F4C430] transition-colors"
                />
              </div>

              <div className="pt-4 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(true)}
                  className="w-full flex items-center justify-between gap-4 border border-[#123D2A]/20 dark:border-white/15 bg-[#FAF2CC]/70 dark:bg-white/5 px-5 py-4 text-left hover:border-[#F4C430] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#123D2A] dark:text-[#F4C430] shrink-0" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">
                        Community-Regeln lesen
                      </span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Bitte öffne die Regeln, lies sie durch und bestätige sie anschließend.
                      </span>
                    </span>
                  </span>
                  {hasReadRules && <CheckCircle2 className="w-5 h-5 text-[#123D2A] dark:text-[#F4C430] shrink-0" />}
                </button>

                <label className={`flex items-start gap-4 cursor-pointer ${hasReadRules ? '' : 'opacity-60'}`}>
                <div className={`w-5 h-5 border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                  regAcceptRules ? 'bg-[#123D2A] border-[#123D2A] dark:bg-white dark:border-white' : 'border-gray-400'
                }`}>
                  {regAcceptRules && <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-[#171A17]" />}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                  Ich akzeptiere die redaktionellen Community-Regeln (keine verbotenen Artikel, fairer und respektvoller Handel).
                </span>
                <input
                  type="checkbox"
                  required
                  disabled={!hasReadRules}
                  checked={regAcceptRules}
                  onChange={(e) => setRegAcceptRules(e.target.checked)}
                  className="sr-only"
                />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"
              >
                Konto erstellen & loslegen
              </button>
            </form>
          )}

        </div>

        {/* RIGHT: QUICK PERSONA SWITCHER */}
        <div className="lg:pl-16 lg:border-l border-gray-200 dark:border-white/10 space-y-12">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] mb-2 block">
              Schnell-Test
            </span>
            <h3 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white mb-4">
              Test-Profile
            </h3>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
              Klicke auf eine Person, um sofort ihre Perspektive (Verkäufer, Käufer oder Moderator) zu testen:
            </p>
          </div>

          <div className="space-y-6">
            {sampleUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickLogin(u.id)}
                className="w-full pb-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between text-left group hover:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt=""
                    className="w-16 h-16 object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-serif font-bold text-xl text-[#171A17] dark:text-white">
                        {u.firstName} {u.lastName.charAt(0)}.
                      </span>
                      <span className="text-[9px] px-2 py-1 uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold">
                        {u.role}
                      </span>
                    </div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-gray-500">
                      {u.city} • {u.ratingAverage} ★ ({u.ratingCount})
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#171A17] dark:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111511]/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden bg-[#F5F1E8] dark:bg-[#111511] border border-[#123D2A]/20 dark:border-white/15 shadow-2xl">
            <div className="flex items-start justify-between gap-6 border-b border-[#123D2A]/15 dark:border-white/10 bg-[#123D2A] px-6 py-5 text-[#F5F1E8]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F4C430]">
                  Vor der Registrierung
                </p>
                <h2 className="mt-1 font-serif font-bold text-2xl">
                  {t.communityRules}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-2 text-[#F5F1E8]/70 hover:text-[#F5F1E8] transition-colors"
                aria-label="Community-Regeln schließen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[58vh] overflow-y-auto px-6 py-6 space-y-8">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {t.rulesIntro}
              </p>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t.rulesNotAllowedTitle}</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {[t.rulesProhibited1, t.rulesProhibited2, t.rulesProhibited3, t.rulesProhibited4, t.rulesProhibited5, t.rulesProhibited6, t.rulesProhibited7, t.rulesProhibited8].map((rule) => (
                    <li key={rule} className="flex items-start gap-3">
                      <span className="mt-0.5 font-bold text-red-600">×</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.rulesBehaviorTitle}</span>
                </h3>
                <div className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p><strong className="text-[#171A17] dark:text-white">{t.rulesHonestTitle}</strong> {t.rulesHonestDesc}</p>
                  <p><strong className="text-[#171A17] dark:text-white">{t.rule1Title}</strong> {t.rule1Desc}</p>
                  <p><strong className="text-[#171A17] dark:text-white">{t.rule2Title}</strong> {t.rule2Desc}</p>
                </div>
              </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-[#123D2A]/15 dark:border-white/10 bg-white/70 dark:bg-white/5 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-3 border border-[#123D2A]/20 text-[#123D2A] dark:border-white/20 dark:text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#123D2A]/5 transition-colors"
              >
                Nochmals lesen
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasReadRules(true);
                  setRegAcceptRules(true);
                  setShowRulesModal(false);
                }}
                className="flex-1 px-5 py-3 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"
              >
                Regeln gelesen und akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
