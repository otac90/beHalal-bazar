const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/SafetyBox.tsx', 'utf8');

code = code.replace(
  /className="py-6 border-b border-gray-200 dark:border-white\/10 space-y-4"/,
  'className="p-6 bg-[#FAF2CC] dark:bg-[#191E19] border border-[#F4C430]/20 space-y-4"'
);

code = code.replace(/text-\[#123D2A\] dark:text-white/g, 'text-[#123D2A] dark:text-[#F4C430]');
code = code.replace(/text-gray-600 dark:text-gray-400/g, 'text-[#171A17] dark:text-gray-400');

fs.writeFileSync('src/components/marketplace/SafetyBox.tsx', code);
console.log('SafetyBox updated');
