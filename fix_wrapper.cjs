const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

const targetStr = '{/* NAV / BREADCRUMB */}';
code = code.replace(targetStr, '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">\n        {/* NAV / BREADCRUMB */}');

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
console.log('Fixed wrapper div');
