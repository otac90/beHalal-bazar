const fs = require('fs');
let code = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');

// Active Tabs
code = code.replace(
  /'border-\[#123D2A\] dark:border-white text-\[#171A17\] dark:text-white'/g,
  "'border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'"
);

// Submit Buttons
code = code.replace(
  /className="w-full py-4 bg-\[#123D2A\] dark:bg-white text-white dark:text-\[#171A17\] text-\[11px\] font-bold uppercase tracking-widest hover:bg-\[#171A17\] dark:hover:bg-gray-200 transition-colors"/g,
  'className="w-full py-4 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"'
);
code = code.replace(
  /className="w-full py-4 bg-\[#123D2A\] dark:bg-\[#F4C430\] text-white dark:text-\[#171A17\] text-\[11px\] font-bold uppercase tracking-widest hover:bg-\[#171A17\] dark:hover:bg-white transition-colors"/g,
  'className="w-full py-4 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#E4B528] transition-colors"'
);

// Inputs active state
code = code.replace(
  /focus:border-\[#123D2A\] dark:focus:border-white/g,
  'focus:border-[#123D2A] dark:focus:border-[#F4C430]'
);

// Header banner (Geschlossene vertrauensvolle Community)
code = code.replace(
  /bg-\[#171A17\] text-white dark:bg-white dark:text-\[#171A17\]/g,
  'bg-[#123D2A] text-[#F5F1E8] dark:bg-[#123D2A] dark:text-[#F5F1E8]'
);

fs.writeFileSync('src/pages/AuthPage.tsx', code);
console.log('AuthPage updated');
