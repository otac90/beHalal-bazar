const fs = require('fs');

// 1. Translations
let trans = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Replace searchPlaceholder in DE
trans = trans.replace(
  /Was suchst du heute in der Community\? \(z\.B\. Kinderwagen, iPhone, Fahrrad\)/g,
  'Was suchst du heute in der Community?'
);
// Replace global BE HALAL
trans = trans.replace(/BE HALAL/g, 'Online Bazar');
trans = trans.replace(/Be Halal/g, 'Online Bazar');

// The brandName might become "Online Bazar"
fs.writeFileSync('src/i18n/translations.ts', trans);

// 2. index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/BE HALAL/g, 'Online Bazar');
fs.writeFileSync('index.html', index);

// 3. Footer
let footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
// "Im Footer in der linken spalte soll das kleine Online Bazar verschwinden und nur darüber statt BE HALAL bitte ONLINE BAZAR schreiben."
footer = footer.replace(
  /<span className="font-serif font-bold text-2xl tracking-tight text-white mb-1">BE HALAL<\/span>\s*<span className="text-xs font-bold text-white\/50 uppercase tracking-widest">Online Bazar<\/span>/,
  '<span className="font-serif font-bold text-2xl tracking-tight text-white mb-1">ONLINE BAZAR</span>'
);
// Also in case it was already replaced by the string literal in translation
footer = footer.replace(
  /<span className="font-serif font-bold text-2xl tracking-tight text-white mb-1">\{t\.brandName\}<\/span>\s*<span className="text-xs font-bold text-white\/50 uppercase tracking-widest">Online Bazar<\/span>/,
  '<span className="font-serif font-bold text-2xl tracking-tight text-white mb-1">ONLINE BAZAR</span>'
);

fs.writeFileSync('src/components/layout/Footer.tsx', footer);

console.log('Text updates complete');
