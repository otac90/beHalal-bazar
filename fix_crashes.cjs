const fs = require('fs');

let code = fs.readFileSync('src/components/marketplace/ListingDetailView.tsx', 'utf8');

code = code.replace(/const createdAtDate = new Date\(listing\.createdAt\);/, `const createdAtDate = new Date(listing?.createdAt || Date.now());`);
code = code.replace(/const updatedAtDate = new Date\(listing\.updatedAt\);/, `const updatedAtDate = new Date(listing?.updatedAt || Date.now());`);

fs.writeFileSync('src/components/marketplace/ListingDetailView.tsx', code);
