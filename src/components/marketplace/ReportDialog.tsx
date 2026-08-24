import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ReportReason } from '../../types';
import { storage } from '../../services/storage';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string;
  listingTitle?: string;
  reportedUserId?: string;
}

export const ReportDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  reportedUserId,
}) => {
  const { user, showToast, t } = useApp();
  const [reason, setReason] = useState<ReportReason>('FORBIDDEN_PRODUCT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasonsList: { value: ReportReason; label: string }[] = [
    { value: 'FORBIDDEN_PRODUCT', label: 'Verbotenes Produkt / Regelverstoß' },
    { value: 'FAKE_REPLICA', label: 'Produktfälschung / Markenschutzverletzung' },
    { value: 'SCAM_FRAUD', label: 'Verdacht auf Betrug / Unzuverlässigkeit' },
    { value: 'SERVICE_JOB', label: 'Dienstleistung oder Jobangebot (nicht gestattet)' },
    { value: 'ANIMAL_PET', label: 'Tierverkauf oder Tiervermittlung (nicht gestattet)' },
    { value: 'REAL_ESTATE', label: 'Immobilie / Wohnungsangebot (nicht gestattet)' },
    { value: 'SPAM', label: 'Spam oder Mehrfacheinstellung' },
    { value: 'WRONG_CATEGORY', label: 'Falsche Kategorie' },
    { value: 'OFFENSIVE', label: 'Beleidigende oder respektlose Inhalte' },
    { value: 'OTHER', label: 'Sonstiger Grund' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Bitte gib eine kurze Begründung an.', 'warning');
      return;
    }

    setIsSubmitting(true);
    storage.addReport({
      reporterId: user.id,
      reporterName: `${user.firstName} ${user.lastName}`,
      reportedUserId,
      listingId,
      listingTitle,
      reason,
      description,
    });

    setIsSubmitting(false);
    showToast('Vielen Dank. Deine Meldung wurde an das Moderationsteam übermittelt.', 'success');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#161E18] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Meldung an Moderation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {listingTitle && (
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">Betrifft Inserat: </span>
              {listingTitle}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Grund der Meldung *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#123D2A]"
            >
              {reasonsList.map((r) => (
                <option key={r.value} value={r.value} className="dark:bg-[#161E18]">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Details & Erläuterung *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe bitte kurz, warum dieses Inserat oder dieser Nutzer gegen die Regeln der BE HALAL Community verstößt..."
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#123D2A]"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Meldungen werden vertraulich von unserem Moderationsteam geprüft. Missbräuchliche Falschmeldungen sind nicht gestattet.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Wird übermittelt...' : 'Meldung absenden'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
