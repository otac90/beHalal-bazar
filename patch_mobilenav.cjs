const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MobileNav.tsx', 'utf8');

code = code.replace(/bg-\[#F5C518\]/g, 'bg-[#F4C430]');
code = code.replace(/dark:text-\[#F5C518\]/g, 'dark:text-[#F4C430]');

fs.writeFileSync('src/components/layout/MobileNav.tsx', code);
