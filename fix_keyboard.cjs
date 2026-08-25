const fs = require('fs');
let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

code = code.replace(/listing\.\(listing\?\.images\?\.length \|\| 0\)/g, `listing?.images?.length`);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
