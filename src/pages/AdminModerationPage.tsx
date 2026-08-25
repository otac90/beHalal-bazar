import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Check, X, Trash2, Plus, 
  AlertTriangle, Users, Package, FileText, Ban, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { Report } from '../types';

export const AdminModerationPage: React.FC = () => {
  const { user, setUser, config, setConfig, showToast, navigate, t } = useApp();

  const [reports, setReports] = useState<Report[]>(storage.getReports());
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');

  const listings = storage.getListings();
  const allUsers = storage.getUsers();

  const isAdminOrMod = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const handleMakeMeAdmin = () => {
    const adminPersona = allUsers.find((u) => u.role === 'ADMIN') || allUsers[0];
    if (adminPersona) {
      storage.setCurrentUser(adminPersona);
      setUser(adminPersona);
      showToast('Du bist nun als Administrator angemeldet.', 'success');
    }
  };

  const handleResolveReport = (reportId: string, action: 'DISMISSED' | 'DELETED_LISTING' | 'BANNED_USER') => {
    const rep = reports.find((r) => r.id === reportId);
    if (!rep) return;

    if (action === 'DELETED_LISTING' && rep.listingId) {
      storage.deleteListing(rep.listingId);
      showToast('Inserat wurde gelöscht und Meldung als erledigt markiert.', 'success');
    } else if (action === 'BANNED_USER' && rep.reportedUserId) {
      storage.banUser(rep.reportedUserId);
      if (rep.listingId) storage.deleteListing(rep.listingId);
      showToast('Nutzer wurde gesperrt.', 'success');
    } else {
      showToast('Meldung abgewiesen.', 'info');
    }

    storage.updateReportStatus(reportId, 'RESOLVED', action);
    setReports(storage.getReports());
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const lower = newKeyword.trim().toLowerCase();
    if (config.bannedKeywords.includes(lower)) {
      showToast('Schlagwort bereits in der Sperrliste vorhanden.', 'warning');
      return;
    }

    const updated = {
      ...config,
      bannedKeywords: [...config.bannedKeywords, lower],
    };
    storage.saveConfig(updated);
    setConfig(updated);
    setNewKeyword('');
    showToast(`"${lower}" zur Sperrliste hinzugefügt.`, 'success');
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = {
      ...config,
      bannedKeywords: config.bannedKeywords.filter((k) => k !== keyword),
    };
    storage.saveConfig(updated);
    setConfig(updated);
    showToast(`"${keyword}" aus der Sperrliste entfernt.`, 'info');
  };

  if (!isAdminOrMod) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Zugang nur für Moderatoren & Admins
        </h2>
        <p className="text-xs text-gray-500">
          Dieser Bereich ist dem ONLINE BAZAR Plattform-Team vorbehalten. Zu Testzwecken kannst du mit einem Klick zur Administrator-Rolle wechseln.
        </p>
        <button
          onClick={handleMakeMeAdmin}
          className="px-5 py-2.5 rounded-xl bg-[#123D2A] text-[#F5C518] text-xs font-bold shadow-md hover:bg-[#0D2C1E]"
        >
          Als Administrator anmelden (Test)
        </button>
      </div>
    );
  }

  const filteredReports = reports.filter((r) => {
    if (selectedStatusFilter === 'ALL') return true;
    return r.status === selectedStatusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER & METRICS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-extrabold uppercase tracking-wide">
                Admin Panel
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white font-heading">
                Moderation & Sicherheit
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Verwalte Inseratsmeldungen, automatische Filtersperren und Plattformregeln.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 dark:text-[#F5C518] font-semibold">
              Angemeldet als: {user.firstName} ({user.role})
            </span>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-gray-400 font-semibold block">Offene Meldungen</span>
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">
              {reports.filter((r) => r.status === 'PENDING').length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-gray-400 font-semibold block">Aktive Inserate</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {listings.filter((l) => l.status === 'ACTIVE').length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-gray-400 font-semibold block">Registrierte Mitglieder</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {allUsers.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-gray-400 font-semibold block">Gesperrte Wörter</span>
            <span className="text-2xl font-extrabold text-[#123D2A] dark:text-[#F5C518]">
              {config.bannedKeywords.length}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: INCOMING REPORTS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 space-y-4 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Community-Meldungen</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedStatusFilter('PENDING')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedStatusFilter === 'PENDING'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              Offen
            </button>
            <button
              onClick={() => setSelectedStatusFilter('RESOLVED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedStatusFilter === 'RESOLVED'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              Erledigt
            </button>
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              Alle
            </button>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                      {rep.reason}
                    </span>
                    {rep.status === 'RESOLVED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Erledigt ({rep.actionTaken})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Gemeldet von {rep.reporterName} am {new Date(rep.createdAt).toLocaleString('de-AT')}
                  </span>
                </div>

                {rep.listingTitle && (
                  <div className="text-xs">
                    <span className="font-semibold text-gray-500">Betroffener Artikel: </span>
                    <strong className="text-gray-900 dark:text-white">{rep.listingTitle}</strong>
                    {rep.listingId && (
                      <button
                        onClick={() => navigate('listing-detail', { id: rep.listingId })}
                        className="ml-2 text-xs text-[#123D2A] dark:text-[#F5C518] underline font-semibold"
                      >
                        Inserat ansehen
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-[#161E18] p-3 rounded-xl border border-gray-200/50 dark:border-white/5">
                  "{rep.description}"
                </p>

                {rep.status === 'PENDING' && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      Meldung ablehnen (Freigeben)
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'DELETED_LISTING')}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
                    >
                      Inserat sofort löschen
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep.id, 'BANNED_USER')}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                    >
                      Nutzer sperren & Inserat löschen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">
            Keine Meldungen im gewählten Filter.
          </div>
        )}

      </div>

      {/* SECTION 2: BANNED KEYWORDS & AUTO-MODERATION ENGINE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#161E18] border border-gray-200/80 dark:border-white/10 space-y-4 shadow-sm">
        
        <div className="pb-3 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ban className="w-4 h-4 text-[#123D2A] dark:text-[#F5C518]" />
            <span>Automatische Wortfilter & Sperrliste</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Inserate mit diesen Begriffen werden vom System automatisch vor der Veröffentlichung blockiert.
          </p>
        </div>

        {/* ADD KEYWORD FORM */}
        <form onSubmit={handleAddKeyword} className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Neues verbotenes Wort oder Phrase hinzufügen (z.B. replica, shisha, job)"
            className="flex-1 h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#123D2A]"
          />
          <button
            type="submit"
            className="px-4 h-10 rounded-xl bg-[#123D2A] dark:bg-[#F5C518] text-white dark:text-[#123D2A] text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Hinzufügen</span>
          </button>
        </form>

        {/* KEYWORDS CHIPS */}
        <div className="flex flex-wrap gap-2 pt-2">
          {config.bannedKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5"
            >
              <span>{kw}</span>
              <button
                onClick={() => handleRemoveKeyword(kw)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Wort entfernen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

      </div>

    </div>
  );
};
