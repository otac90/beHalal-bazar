const fs = require('fs');

// Patch ReportDialog
let reportCode = fs.readFileSync('src/components/marketplace/ReportDialog.tsx', 'utf8');
reportCode = reportCode.replace(
  /className="bg-white dark:bg-\[#161E18\] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 dark:border-white\/10"/g,
  'className="bg-[#F5F1E8] dark:bg-[#111511] max-w-lg w-full p-6 shadow-2xl border border-[#123D2A]/10 dark:border-white/10"'
);
reportCode = reportCode.replace(
  /<div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white\/10">([\s\S]*?)<\/div>/,
  `<div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
          <h3 className="font-serif font-bold text-2xl text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Meldung
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>`
);
reportCode = reportCode.replace(/rounded-xl/g, 'rounded-none');
reportCode = reportCode.replace(/rounded-lg/g, 'rounded-none');
reportCode = reportCode.replace(/text-xs/g, 'text-sm');
reportCode = reportCode.replace(
  /bg-gray-50 dark:bg-white\/5 border border-gray-200 dark:border-white\/10/g,
  'bg-transparent border border-[#123D2A]/20 dark:border-white/20'
);
reportCode = reportCode.replace(
  /bg-amber-50 dark:bg-amber-950\/30 border border-amber-200\/60 dark:border-amber-800\/40/g,
  'bg-amber-500/10 border border-amber-500/30'
);
reportCode = reportCode.replace(
  /className="px-4 py-2 rounded-none text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white\/5"/g,
  'className="px-6 py-3 font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 transition-opacity"'
);
reportCode = reportCode.replace(
  /className="px-4 py-2 rounded-none bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs transition-colors"/g,
  'className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition-colors"'
);

fs.writeFileSync('src/components/marketplace/ReportDialog.tsx', reportCode);


// Patch ReviewDialog
let reviewCode = fs.readFileSync('src/components/marketplace/ReviewDialog.tsx', 'utf8');
reviewCode = reviewCode.replace(
  /className="bg-white dark:bg-\[#161E18\] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 dark:border-white\/10"/g,
  'className="bg-[#F5F1E8] dark:bg-[#111511] max-w-md w-full p-6 shadow-2xl border border-[#123D2A]/10 dark:border-white/10"'
);
reviewCode = reviewCode.replace(
  /<div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white\/10">([\s\S]*?)<\/div>/,
  `<div className="flex items-center justify-between pb-6 mb-6 border-b border-[#123D2A]/10 dark:border-white/10">
          <h3 className="font-serif font-bold text-2xl text-[#123D2A] dark:text-[#F4C430] flex items-center gap-2">
            <Star className="w-6 h-6 fill-current" />
            {t.leaveReview}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>`
);
reviewCode = reviewCode.replace(/rounded-xl/g, 'rounded-none');
reviewCode = reviewCode.replace(/rounded-full/g, 'rounded-none');
reviewCode = reviewCode.replace(/text-xs/g, 'text-sm');
reviewCode = reviewCode.replace(
  /bg-gray-50 dark:bg-white\/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white\/10 hover:border-gray-300/g,
  'bg-transparent border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-gray-300 hover:border-[#123D2A]/50 dark:hover:border-white/50'
);
reviewCode = reviewCode.replace(
  /bg-gray-50 dark:bg-white\/5 border border-gray-200 dark:border-white\/10/g,
  'bg-transparent border border-[#123D2A]/20 dark:border-white/20'
);
reviewCode = reviewCode.replace(
  /className="px-4 py-2 rounded-none text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white\/5"/g,
  'className="px-6 py-3 font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 transition-opacity"'
);
reviewCode = reviewCode.replace(
  /className="px-4 py-2 rounded-none bg-\[#123D2A\] dark:bg-\[#F5C518\] hover:bg-\[#0D2C1E\] dark:hover:bg-\[#E5B215\] text-white dark:text-\[#123D2A\] text-sm font-bold shadow-xs transition-colors"/g,
  'className="px-6 py-3 bg-[#123D2A] dark:bg-[#F4C430] hover:bg-[#0D2C1E] dark:hover:bg-[#E4B528] text-[#F5F1E8] dark:text-[#123D2A] font-bold uppercase tracking-widest transition-colors"'
);
fs.writeFileSync('src/components/marketplace/ReviewDialog.tsx', reviewCode);

console.log('Modals patched successfully.');
