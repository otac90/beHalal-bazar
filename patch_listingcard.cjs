const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingCard.tsx', 'utf8');

// 1. Add isNew
const dateObjCode = "const dateObj = new Date(listing.createdAt);";
code = code.replace(dateObjCode, `${dateObjCode}\n  const isNew = Date.now() - dateObj.getTime() < 48 * 60 * 60 * 1000; // 48h for demo`);

// 2. Badges
// FREE
code = code.replace(
  /bg-\[#123D2A\] text-\[#F4C430\]/g,
  'bg-[#123D2A] text-[#F5F1E8]'
);
// WANTED
code = code.replace(
  /bg-\[#171A17\] text-white/g,
  'bg-transparent border border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'
);
// NEW (Add after TOP BADGES flex container)
code = code.replace(
  /{isFree && \(/,
  `{isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F4C430] text-[#123D2A] uppercase tracking-widest">
              NEU
            </span>
          )}
          {isFree && (`
);

// 3. Heart
code = code.replace(
  /fill-\[#123D2A\] text-\[#123D2A\] dark:fill-\[#F4C430\] dark:text-\[#F4C430\]/,
  'fill-[#F4C430] text-[#F4C430]'
);
code = code.replace(
  /text-\[#171A17\] dark:text-white drop-shadow-md hover:scale-110/,
  'text-[#171A17] dark:text-white drop-shadow-md hover:scale-110 hover:text-[#123D2A] dark:hover:text-[#F4C430]'
);

// 4. Price Color
code = code.replace(
  /<span className="text-sm font-bold text-\[#171A17\] dark:text-white">([\s\S]*?)<\/span>/g,
  (match, p1) => {
    return `<span className="text-sm font-bold text-[#123D2A] dark:text-[#F4C430]">${p1}</span>`;
  }
);

fs.writeFileSync('src/components/marketplace/ListingCard.tsx', code);
console.log('ListingCard updated');
