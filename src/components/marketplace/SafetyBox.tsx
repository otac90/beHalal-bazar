import React from 'react';
import { ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SafetyBox: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="py-6 border-b border-gray-200 dark:border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#123D2A] dark:text-white" />
        <span className="font-serif text-lg text-[#171A17] dark:text-white">{t.safetyBoxTitle}</span>
      </div>
      <p className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
        {t.safetyBoxTips}
      </p>
      <div className="grid grid-cols-1 gap-2 pt-2 font-sans text-xs uppercase tracking-widest text-gray-500">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#123D2A] dark:text-white shrink-0" />
          <span>Direkte persönliche Übergabe</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#123D2A] dark:text-white shrink-0" />
          <span>Keine anonymen Vorauszahlungen</span>
        </div>
      </div>
    </div>
  );
};
