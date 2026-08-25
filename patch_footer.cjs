const fs = require('fs');
let footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

footer = footer.replace(
  /<span className="font-serif font-bold text-2xl text-\[#F5F1E8\]">\s*BE HALAL\s*<\/span>\s*<span className="text-\[9px\] tracking-widest text-\[#F5F1E8\]\/60 font-bold uppercase mt-1">\s*ONLINE BAZAR\s*<\/span>/,
  '<span className="font-serif font-bold text-2xl text-[#F5F1E8] uppercase">ONLINE BAZAR</span>'
);

fs.writeFileSync('src/components/layout/Footer.tsx', footer);
console.log('Footer updated');
