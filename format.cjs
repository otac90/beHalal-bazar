const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

// Ensure aspect ratio is nice and images are properly contained
code = code.replace(
  /className="w-full h-full object-contain"/g,
  'className="w-full h-full object-cover"'
);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
