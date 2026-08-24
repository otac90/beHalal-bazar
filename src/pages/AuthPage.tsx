import React, { useState } from 'react';
import { 
  Lock, Mail, ShieldCheck, UserCheck, ArrowRight, 
  Sparkles, CheckCircle2, UserIcon, KeyRound 
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
    showToast('Konto erfolgreich erstellt und verifiziert! Willkommen bei BE HALAL.', 'success');
    navigate('home');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171A17] text-white dark:bg-white dark:text-[#171A17] text-[10px] uppercase tracking-widest font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Geschlossene vertrauensvolle Community</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#171A17] dark:text-white">
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
                  ? 'border-[#123D2A] dark:border-white text-[#171A17] dark:text-white'
                  : 'border-transparent text-gray-400 hover:text-[#171A17] dark:hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                mode === 'register'
                  ? 'border-[#123D2A] dark:border-white text-[#171A17] dark:text-white'
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-lg font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors placeholder:font-sans placeholder:font-normal placeholder:uppercase placeholder:text-[10px]"
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
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                  className="w-full pb-2 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-bold text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                />
              </div>

              <label className="flex items-start gap-4 pt-4 cursor-pointer">
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
                  checked={regAcceptRules}
                  onChange={(e) => setRegAcceptRules(e.target.checked)}
                  className="sr-only"
                />
              </label>

              <button
                type="submit"
                className="w-full py-4 bg-[#123D2A] dark:bg-[#F4C430] text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-white transition-colors"
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
            <h3 className="font-serif text-3xl text-[#171A17] dark:text-white mb-4">
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
                      <span className="font-serif text-xl text-[#171A17] dark:text-white">
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

    </div>
  );
};
