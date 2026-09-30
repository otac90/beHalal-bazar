import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { localizeText } from '../../i18n/translations';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ isOpen, title, message, confirmLabel = 'Löschen', onConfirm, onClose }) => {
  const { language, t } = useApp();
  const ui = (value: string) => localizeText(value, language);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md border border-[#123D2A]/15 bg-[#F5F1E8] p-6 shadow-2xl dark:border-white/10 dark:bg-[#111511]">
        <div className="flex items-start justify-between gap-4 border-b border-[#123D2A]/10 pb-5 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"><AlertTriangle className="h-5 w-5" /></div>
            <div><h2 id="confirm-dialog-title" className="font-serif text-xl font-bold text-[#171A17] dark:text-white">{title}</h2><p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{message}</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label={ui('Dialog schließen')} className="text-gray-500 hover:text-[#171A17] dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex justify-end gap-3 pt-5"><button type="button" onClick={onClose} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-white">{t.cancel}</button><button type="button" onClick={onConfirm} className="bg-red-700 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-red-800">{ui(confirmLabel)}</button></div>
      </div>
    </div>
  );
};
