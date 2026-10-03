import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ReportReason } from '../../types';
import { useApp } from '../../context/AppContext';
import { localizeText } from '../../i18n/translations';
import { createClient } from '../../utils/supabase/client';

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
  const { user, showToast, t, language } = useApp();
  const ui = (value: string) => localizeText(value, language);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      return;
    }
    if (!description.trim()) {
      showToast(ui('Bitte gib eine kurze Begründung an.'), 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await createClient().from('moderation_reports').insert({
        source: listingId ? 'LISTING' : 'USER',
        reporter_id: user.id,
        reported_user_id: reportedUserId ?? null,
        listing_id: listingId ?? null,
        reason,
        description: description.trim(),
      });
      if (error) throw error;
      showToast(ui('Vielen Dank. Deine Meldung wurde an das Moderationsteam übermittelt.'), 'success');
      setDescription('');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : ui('Die Meldung konnte nicht übermittelt werden.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#F5F1E8] dark:bg-[#111511] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#123D2A]/10 dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
          <h3 className="font-serif font-bold text-2xl text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            {ui('Meldung')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {listingTitle && (
            <div className="p-3 bg-[#123D2A]/5 dark:bg-white/5 border border-[#123D2A]/10 dark:border-white/10 text-sm text-[#171A17] dark:text-gray-300">
              <span className="font-bold">{ui('Betrifft Inserat: ')}</span>
              {listingTitle}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#123D2A] dark:text-gray-300 mb-2 uppercase tracking-widest">
              {ui('Grund der Meldung *')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full h-12 px-4 bg-transparent border border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
            >
              {reasonsList.map((r) => (
                <option key={r.value} value={r.value} className="dark:bg-[#111511]">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#123D2A] dark:text-gray-300 mb-2 uppercase tracking-widest">
              {ui('Details & Erläuterung *')}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={ui('Beschreibe bitte kurz, warum dieses Inserat oder dieser Nutzer gegen die Regeln der ONLINE BAZAR Community verstößt...')}
              className="w-full p-4 bg-transparent border border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
            />
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <span className="font-medium">
              {ui('Meldungen werden vertraulich von unserem Moderationsteam geprüft. Missbräuchliche Falschmeldungen sind nicht gestattet.')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#123D2A]/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 transition-opacity"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isSubmitting ? ui('Wird übermittelt...') : ui('Meldung absenden')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
