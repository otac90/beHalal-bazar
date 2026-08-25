import React from 'react';
import { ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SafetyBox: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="p-6 bg-[#FAF2CC] dark:bg-[#191E19] border border-[#F4C430]/20 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#123D2A] dark:text-[#F4C430]" />
        <span className="font-serif font-bold text-lg text-[#171A17] dark:text-white">{t.safetyBoxTitle}</span>
      </div>
      <p className="font-sans text-sm text-[#171A17] dark:text-gray-400 leading-relaxed max-w-sm">
        {t.safetyBoxTips}
      </p>
      <div className="grid grid-cols-1 gap-2 pt-2 font-sans text-xs uppercase tracking-widest text-gray-500">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430] shrink-0" />
          <span>Direkte persönliche Übergabe</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430] shrink-0" />
          <span>Keine anonymen Vorauszahlungen</span>
        </div>
      </div>
    </div>
  );
};
