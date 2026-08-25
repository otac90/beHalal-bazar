const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Replace old active filter banner
code = code.replace(
  /bg-\[#CBD9C6\]\/30 dark:bg-white\/5 text-\[#123D2A\] dark:text-white/g,
  'bg-[#CBD9C6] dark:bg-[#CBD9C6] text-[#123D2A] dark:text-[#123D2A]'
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log('Active filters updated');
