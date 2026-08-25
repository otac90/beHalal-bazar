const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. Tabs
code = code.replace(
  /'border-\[#123D2A\] dark:border-white text-\[#123D2A\] dark:text-white'/g,
  "'border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'"
);

// 2. Status Badge
const statusOld = `<span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430]">
                            {lst.status === 'ACTIVE' ? 'Aktiv' : lst.status === 'RESERVED' ? 'Reserviert' : 'Verkauft'}
                          </span>`;
const statusNew = `<span className={\`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest \${lst.status === 'ACTIVE' ? 'bg-[#CBD9C6] text-[#123D2A]' : lst.status === 'RESERVED' ? 'bg-[#FAF2CC] text-[#123D2A]' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}\`}>
                            {lst.status === 'ACTIVE' ? 'Aktiv' : lst.status === 'RESERVED' ? 'Reserviert' : 'Verkauft'}
                          </span>`;
code = code.replace(statusOld, statusNew);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log('AccountPage tabs & badges updated');
