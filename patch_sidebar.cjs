const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/FilterSidebar.tsx', 'utf8');

code = code.replace(
  /'bg-\[#123D2A\] border-\[#123D2A\] dark:bg-white dark:border-white'/,
  "'bg-[#123D2A] border-[#123D2A] dark:bg-[#F4C430] dark:border-[#F4C430]'"
);

fs.writeFileSync('src/components/marketplace/FilterSidebar.tsx', code);
console.log('Sidebar updated');
