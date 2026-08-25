const fs = require('fs');
const path = require('path');

function updateFile(filePath, replacer) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = replacer(content);
  fs.writeFileSync(filePath, content);
}

// 1. MarketplaceHeader.tsx
updateFile('src/components/layout/MarketplaceHeader.tsx', (content) => {
  // Update desktop search button
  content = content.replace(
    /className="w-10 h-10 mr-1 flex items-center justify-center rounded-full bg-\[#123D2A\] dark:bg-\[#F4C430\] text-white dark:text-\[#123D2A\] hover:opacity-90 transition-opacity shrink-0"/g,
    'className="w-10 h-10 mr-1 flex items-center justify-center rounded-full bg-[#F4C430] text-[#123D2A] hover:bg-[#E4B528] transition-colors shrink-0"'
  );
  
  // Update mobile search input focus
  content = content.replace(
    /className="w-full h-12 pl-12 pr-4 rounded-full bg-white dark:bg-\[#191E19\] text-sm text-\[#171A17\] dark:text-white placeholder:text-gray-400 focus:outline-none"/g,
    'className="w-full h-12 pl-12 pr-4 rounded-full bg-white dark:bg-[#191E19] text-sm text-[#171A17] dark:text-white placeholder:text-gray-400 border border-transparent focus:outline-none focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] transition-colors"'
  );
  // Update message badge in header (Yellow instead of Red)
  content = content.replace(
    /bg-red-600 text-white rounded-full/g,
    'bg-[#F4C430] text-[#123D2A] rounded-full'
  );
  
  return content;
});

// 2. MobileNav.tsx
updateFile('src/components/layout/MobileNav.tsx', (content) => {
  // Active text color: #123D2A + Yellow Dot
  // The dot is usually a small span. We can add a dot after the icon for active state.
  // Actually, we can just replace 'text-[#123D2A] dark:text-[#F5C518] font-bold'
  content = content.replace(
    /'text-\[#123D2A\] dark:text-\[#F5C518\] font-bold'/g,
    "'text-[#123D2A] dark:text-[#F4C430] font-bold relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#F4C430] after:rounded-full'"
  );
  
  // Unread badge Mobile (red -> yellow)
  content = content.replace(
    /bg-red-600 text-white rounded-full/g,
    'bg-[#F4C430] text-[#123D2A] rounded-full'
  );
  return content;
});

console.log('Colors updated in Header and MobileNav');
