const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingCard.tsx', 'utf8');

// 1. Fix WANTED Badge
code = code.replace(
  /\{isWanted && \(\s*<span className="px-2 py-0\.5 text-\[10px\] font-bold bg-transparent border border-\[#F4C430\] text-\[#123D2A\] dark:text-\[#F4C430\] uppercase tracking-widest">\s*\{t\.typeWanted\}\s*<\/span>\s*\)\}/,
  `{isWanted && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123D2A] text-[#F4C430] uppercase tracking-widest">
              {t.typeWanted}
            </span>
          )}`
);

// 2. Fix Favorite Heart
code = code.replace(
  /className=\{`absolute top-3 right-3 p-1\.5 transition-transform active:scale-90 z-10`\}/,
  `className={\`absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-[#123D2A]/10 dark:border-white/10 transition-transform active:scale-90 z-10\`}`
);

code = code.replace(
  /<Heart className=\{`w-5 h-5 \$\{isFav \? 'fill-\[#F4C430\] text-\[#F4C430\]' : 'text-\[#171A17\] dark:text-white drop-shadow-md hover:scale-110 hover:text-\[#123D2A\] dark:hover:text-\[#F4C430\]'}`\} \/>/,
  `<Heart className={\`w-4 h-4 \${isFav ? 'fill-red-500 text-red-500' : 'text-[#123D2A] dark:text-white hover:text-red-500 transition-colors'}\`} />`
);


fs.writeFileSync('src/components/marketplace/ListingCard.tsx', code);
console.log('ListingCard updated');
